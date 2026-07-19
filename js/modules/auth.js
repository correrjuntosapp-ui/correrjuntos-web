// ========================= AUTH MODULE =========================
// Login, registration, password reset, session management.
// Loaded AFTER state.js, error-handler.js, validation.js, ui.js.
(function() {
    'use strict';

function showApp(withWelcome = false){document.getElementById('view-landing').classList.remove('active');document.getElementById('view-app').classList.add('active');setTimeout(()=>ensureLeaflet().then(initMap),100);updateUserUI();if(withWelcome)showWelcomeAnimation();loadActiveMission();loadUserStats().then(()=>{applyDashboardMode();updateReferralBanner(currentUser?.referral_count||0);updatePlanStatusBar();updateDashboardCrearCounter();updateDynamicPremiumBanner();renderSmartAlertsPreview();}).catch(()=>{});loadSocialStats();initFilterPills();initDesktopFilters();updateGeoFilterUI();/* C1+C2: strava.js + push.js now load on-demand, not eagerly */lazyLoadScript('/js/premium-features.min.js');/* C4: load premium features (matching, paywall, enhanced stats) */var _ln=document.getElementById('mobile-bottom-nav');var _an=document.getElementById('app-bottom-nav');if(_ln)_ln.style.display='none';if(_an&&window.innerWidth<768)_an.style.display='block';if(typeof gtag==='function')gtag('event','dashboard_view');}
// Procesar deep link guardado (si el usuario llegó con #quedada/xxx sin sesión y luego hizo login)

function processDeepLinkAfterLogin(){
  try{
    var saved = sessionStorage.getItem('cj_deep_link');
    if(!saved) return;
    sessionStorage.removeItem('cj_deep_link');
    var parts = saved.split('/');
    if(parts[0] === 'quedada' && parts[1]){
      setTimeout(function(){ try{ openQuedadaDetail(parts[1]); }catch(_){} }, 800);
    } else if(parts[0] === 'perfil' && parts[1]){
      setTimeout(function(){ try{ openUserProfile(parts[1]); }catch(_){} }, 800);
    } else if(parts[0] === 'ranking'){
      setTimeout(function(){ try{ openRankingModal(); }catch(_){} }, 800);
    }
  }catch(_){}
}

function showLanding(){document.getElementById('view-app').classList.remove('active');document.getElementById('view-landing').classList.add('active');var _an=document.getElementById('app-bottom-nav');if(_an)_an.style.display='none';var _ln=document.getElementById('mobile-bottom-nav');if(_ln&&window.innerWidth<768)_ln.style.display='block';}
function updateUserUI(){const n=document.getElementById('user-name');if(currentUser&&n)n.textContent=currentUser.nombre;}

async function logout(){
    // Limpiar estado local inmediatamente
    currentUser=null;
    window.currentUser=null;

    // Cerrar sesión en Supabase con timeout
    try{
        if(window.supabaseClient){
            await Promise.race([
                window.supabaseClient.auth.signOut(),
                new Promise(r => setTimeout(r, 3000)) // timeout 3s
            ]);
        }
    }catch(e){ console.warn('Logout error:', e); }

    // Limpiar storage
    try{ localStorage.removeItem('cj-auth'); }catch(_){}

    showLanding();
    showToast('Sesión cerrada', 'info');
}



// ===================== REGISTER: AUTOCOMPLETE CIUDAD (ES/PT) =====================
function hideSuggestionsRegister(){
  const box=document.getElementById('reg-city-suggestions');
  if(!box) return;
  box.classList.add('hidden');
  box.innerHTML='';
}


function onPlaceInputRegister(){
  const countrySel = (document.getElementById('reg-pais')?.value || 'España');
  const country = countrySel.toLowerCase().includes('port') ? 'PT' : 'ES';
  const q = norm(document.getElementById('reg-ciudad')?.value || '');
  const box=document.getElementById('reg-city-suggestions');
  if(!box) return;
  if(!q){ hideSuggestionsRegister(); return; }

  const results = (locationsIndex||[])
    .filter(x => x.country===country && (x.n_place.includes(q) || x.n_admin1.includes(q)))
    .slice(0, 10);

  if(!results.length){
    box.innerHTML = `<div class="p-3 text-sm text-gray-300">${currentLang==='en'?'No matches.':(currentLang==='pt'?'Sem resultados.':'Sin coincidencias.')}</div>`;
    box.classList.remove('hidden');
    return;
  }

  box.innerHTML = results.map(formatSuggestion).join('');
  box.classList.remove('hidden');
  box.querySelectorAll('.suggest-item').forEach(el=>{
    el.addEventListener('click', ()=>{
      const place=el.getAttribute('data-place')||'';
      document.getElementById('reg-ciudad').value = place;
      hideSuggestionsRegister();
    });
  });
}

document.addEventListener('click', (e)=>{
  const box=document.getElementById('reg-city-suggestions');
  const inp=document.getElementById('reg-ciudad');
  if(!box||!inp) return;
  if(inp.parentElement && inp.parentElement.contains(e.target)) return;
  hideSuggestionsRegister();
});

// ===================== CHATS ONLINE (Supabase) =====================
// Si existen tablas cj_topics y cj_messages, se usan (online + realtime). Si no, fallback a localStorage.
let __cjChatMode = 'local';
let __cjMsgSub = null;


async function getSupabaseClientOrToast(timeoutMs=12000, toastOnFail=false){
    if(window.supabaseClient) return window.supabaseClient;

    // Si existe un bootstrap global, lo esperamos (con timeout).
    const ready = window.__CJ_SUPABASE_READY__;
    if(ready && typeof ready.then === 'function'){
try{
    await Promise.race([
        ready,
        new Promise((_, rej)=>setTimeout(()=>rej(new Error('timeout')), timeoutMs))
    ]);
}catch(_){}
    }

    if(window.supabaseClient) return window.supabaseClient;

    // Error real (no carga / bloqueado / credenciales incorrectas / red)
    if(toastOnFail) showToast('No se pudo conectar con Supabase. Revisa conexión/bloqueadores y recarga.','error');
    return null;
}


async function loginWithGoogle(){
    const sb = await getSupabaseClientOrToast(10000, true);
    if(!sb) return;

    try {
        closeModal('modal-login');
        closeModal('modal-register');

        // Pre-set remember flags so the "Recordarme" check doesn't kill the OAuth session on return
        try {
            localStorage.setItem('cj_remember_session', '1');
            localStorage.setItem('cj_had_login', '1');
            sessionStorage.setItem('cj_session_temp', '1');
        } catch(_) {}

        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if(error){
            showToast('Error al conectar con Google: ' + error.message, 'error');
            return;
        }
        // La redirección a Google se maneja automáticamente
    } catch(e){
        CJ.handleApiError(e, 'googleOAuth');
    }
}


async function doLogin(){
    const e=document.getElementById('login-email').value.trim();
    const p=document.getElementById('login-pass').value;
    const rememberMe = document.getElementById('login-remember')?.checked ?? true;
    if(!e||!p){showToast('Completa todos los campos','error');return;}

    // Mostrar estado de carga en el botón
    const loginBtn = document.querySelector('#modal-login button[onclick="doLogin()"]');
    const originalBtnText = loginBtn ? loginBtn.innerHTML : '';
    if(loginBtn){ loginBtn.disabled = true; loginBtn.innerHTML = '<span class="animate-pulse">Conectando...</span>'; }

    const sb = await getSupabaseClientOrToast(12000, true);
    if(!sb){
        if(loginBtn){ loginBtn.disabled = false; loginBtn.innerHTML = originalBtnText; }
        return;
    }

    if(loginBtn){ loginBtn.innerHTML = '<span class="animate-pulse">Iniciando sesión...</span>'; }

    let data, error;
    try {
        const loginPromise = window.supabaseClient.auth.signInWithPassword({ email: e, password: p });
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Tiempo de espera agotado')), 15000)
        );
        const result = await Promise.race([loginPromise, timeoutPromise]);
        data = result.data;
        error = result.error;
    } catch(loginErr) {
        showToast(loginErr.message || 'Error de conexión', 'error');
        if(loginBtn){ loginBtn.disabled = false; loginBtn.innerHTML = originalBtnText; }
        return;
    }

    if(error){
        showToast(error.message,'error');
        if(loginBtn){ loginBtn.disabled = false; loginBtn.innerHTML = originalBtnText; }
        return;
    }

    // Guardar preferencia de "Recordarme"
    try {
        if (rememberMe) {
            localStorage.setItem('cj_remember_session', '1');
            localStorage.setItem('cj_had_login', '1');
        } else {
            localStorage.removeItem('cj_remember_session');
            localStorage.setItem('cj_had_login', '0'); // Marca que NO quiere recordar
            // Si no quiere recordar, la sesión se cerrará al cerrar el navegador
            sessionStorage.setItem('cj_session_temp', '1');
        }
    } catch(_) {}

    const userId = data?.user?.id;
    const email = data?.user?.email || e;
    // cargar perfil
    const { data: prof, error: eProf } = await window.supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if(eProf){ CJ.handleApiError(eProf, 'loginProfile', {silent:true}); }

    currentUser = {
        id: userId,
        email,
        nombre: prof?.nombre || '',
        apellidos: prof?.apellidos || '',
        nombreCompleto: ((prof?.nombre||'') + ' ' + (prof?.apellidos||'')).trim(),
        ciudad: prof?.ciudad || '',
        nivel: prof?.nivel || null,
        telefono: prof?.telefono || '',
        whatsapp: !!prof?.whatsapp,
        bio: prof?.bio || '',
        social: prof?.instagram || prof?.strava || '',
        photo: prof?.photo_url || '',
        created_at: prof?.created_at || null,
        es_seed: !!prof?.es_seed,
        es_premium: !!prof?.es_premium,
        referral_code: prof?.referral_code || null,
        referral_count: prof?.referral_count || 0,
        alert_new_quedadas: !!prof?.alert_new_quedadas,
        alert_radius_km: prof?.alert_radius_km || 25
    };

    // Restaurar botón antes de cerrar modal
    if(loginBtn){ loginBtn.disabled = false; loginBtn.innerHTML = originalBtnText; }

    closeModal('modal-login');
    showToast('¡Bienvenido' + (currentUser.nombre ? ', '+currentUser.nombre : '') + '!');
    showApp(true); // true = mostrar animación de bienvenida

    // Esperar a que la vista esté visible antes de cargar datos (fix móvil)
    await new Promise(r => setTimeout(r, 150));
    await loadQuedadas();

    // Forzar actualización de UI después de cargar datos
    try{ updateUserUI(); }catch(_){}
    try{ renderQuedadas(); }catch(_){}
    try{ updateMarkers(); }catch(_){}

    // Verificar si hay quedadas pasadas pendientes de reseña
    checkPendingReviews();
    // Procesar deep link guardado (si el usuario llegó con un hash sin sesión)
    processDeepLinkAfterLogin();

    // Verificar estado premium
    await checkPremiumStatus();
}

// C4: maybeShowPremiumPromo → moved to /js/premium-features.js (window.maybeShowPremiumPromo)

// ====== FUNCIONES AUXILIARES PARA LOGIN/REGISTRO ======

// Toggle mostrar/ocultar contraseña

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        // Cambiar a icono de ojo tachado
        if (icon) {
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            `;
        }
    } else {
        input.type = 'password';
        // Restaurar icono de ojo normal
        if (icon) {
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            `;
        }
    }
}

// Validación de email en tiempo real

function validateLoginEmail(input) {
    const statusEl = document.getElementById('login-email-status');
    const errorEl = document.getElementById('login-email-error');
    const value = input.value.trim();

    if (!statusEl) return;

    if (!value) {
        statusEl.classList.add('hidden');
        if (errorEl) errorEl.classList.add('hidden');
        return;
    }

    // Regex para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);

    statusEl.classList.remove('hidden');
    if (isValid) {
        statusEl.textContent = '✓';
        statusEl.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-lg text-green-500';
        if (errorEl) errorEl.classList.add('hidden');
    } else {
        statusEl.textContent = '✗';
        statusEl.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-lg text-red-400';
        if (errorEl) {
            errorEl.textContent = 'Introduce un email válido';
            errorEl.classList.remove('hidden');
        }
    }
}

// Validación de email en registro
function validateRegEmail(input) {
    const statusEl = document.getElementById('reg-email-status');
    const errorEl = document.getElementById('reg-email-error');
    const value = input.value.trim();

    if (!statusEl) return;

    if (!value) {
        statusEl.classList.add('hidden');
        if (errorEl) errorEl.classList.add('hidden');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);

    statusEl.classList.remove('hidden');
    if (isValid) {
        statusEl.textContent = '✓';
        statusEl.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-lg text-green-500';
        if (errorEl) errorEl.classList.add('hidden');
    } else {
        statusEl.textContent = '✗';
        statusEl.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-lg text-red-400';
        if (errorEl) {
            errorEl.textContent = 'Introduce un email válido';
            errorEl.classList.remove('hidden');
        }
    }
}

// ====== VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL ======
function validatePasswordRealtime(password) {
    const strengthDiv = document.getElementById('pass-strength');
    const checkLength = document.getElementById('pass-check-length');
    const checkIcon = document.getElementById('pass-check-icon');
    const strengthLabel = document.getElementById('pass-strength-label');
    const bar1 = document.getElementById('pass-bar-1');
    const bar2 = document.getElementById('pass-bar-2');
    const bar3 = document.getElementById('pass-bar-3');

    if (!strengthDiv) return;

    // Mostrar indicador cuando empiece a escribir
    if (password.length > 0) {
        strengthDiv.classList.remove('hidden');
    } else {
        strengthDiv.classList.add('hidden');
        return;
    }

    // Calcular fuerza
    let strength = 0;
    const hasLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password);

    if (hasLength) strength++;
    if (hasNumber) strength++;
    if (hasSpecial || hasMixed) strength++;

    // Actualizar check de longitud
    if (hasLength) {
        if (checkIcon) checkIcon.textContent = '✓';
        if (checkLength) checkLength.className = 'text-green-400 flex items-center gap-1';
    } else {
        if (checkIcon) checkIcon.textContent = '○';
        if (checkLength) checkLength.className = 'text-gray-500 flex items-center gap-1';
    }

    // Reset barras
    const resetBar = (bar) => {
        if (bar) bar.className = 'flex-1 h-1.5 bg-slate-700 rounded-full transition-all duration-300';
    };
    resetBar(bar1); resetBar(bar2); resetBar(bar3);

    // Aplicar colores según fuerza
    if (strength >= 1 && bar1) {
        bar1.className = 'flex-1 h-1.5 rounded-full transition-all duration-300 ' +
            (strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : 'bg-green-500');
    }
    if (strength >= 2 && bar2) {
        bar2.className = 'flex-1 h-1.5 rounded-full transition-all duration-300 ' +
            (strength === 2 ? 'bg-yellow-500' : 'bg-green-500');
    }
    if (strength >= 3 && bar3) {
        bar3.className = 'flex-1 h-1.5 rounded-full transition-all duration-300 bg-green-500';
    }

    // Actualizar label
    if (strengthLabel) {
        if (strength <= 1) {
            strengthLabel.textContent = 'Débil';
            strengthLabel.className = 'font-semibold text-red-400';
        } else if (strength === 2) {
            strengthLabel.textContent = 'Media';
            strengthLabel.className = 'font-semibold text-yellow-400';
        } else {
            strengthLabel.textContent = 'Fuerte';
            strengthLabel.className = 'font-semibold text-green-400';
        }
    }
}

// ====== REGISTRO SIMPLIFICADO (Solo email + contraseña) ======

async function doRegisterSimple(){
    const sb = window.supabaseClient;
    if(!sb){ showToast('Supabase no está listo aún. Recarga la página.','error'); return; }

    const email = (document.getElementById('reg-email')?.value || '').trim();
    const pass = (document.getElementById('reg-pass')?.value || '').trim();
    const terminos = !!document.getElementById('reg-terminos')?.checked;

    // Validaciones mínimas
    if(!CJ.validate.email(email)){ showToast('Email no válido.','error'); return; }
    if(!CJ.validate.password(pass)){ showToast('La contraseña debe tener al menos 6 caracteres.','error'); return; }
    if(!terminos){ showToast('Acepta los términos para continuar.','error'); return; }

    // Verificar si el email ya existe
    const { data: loginData, error: loginErr } = await sb.auth.signInWithPassword({ email, password: pass });
    if(!loginErr && loginData?.session){
        await sb.auth.signOut();
        showToast('Este correo ya está registrado. Inicia sesión.','error');
        closeModal('modal-register');
        openModal('modal-login');
        return;
    }

    // Registro
    const { data, error } = await sb.auth.signUp({
        email,
        password: pass,
        options: { emailRedirectTo: window.location.origin + '/' }
    });

    if(error){
        const msg = (error.message || '').toLowerCase();
        if(msg.includes('already') && (msg.includes('registered') || msg.includes('exists'))){
            showToast('Este email ya está registrado.','error');
            closeModal('modal-register');
            openModal('modal-login');
            return;
        }
        showToast(error.message,'error');
        return;
    }

    // Si requiere confirmación por email
    if(data?.user && !data?.session){
        showToast('Te hemos enviado un email para confirmar tu cuenta.','success');
        closeModal('modal-register');
        openModal('modal-login');
        return;
    }

    // Actualizar perfil mínimo + generar referral code
    try{
        const { data: u2 } = await sb.auth.getUser();
        const uid = u2?.user?.id;
        if(uid){
            const refCode = generateReferralCode();
            await sb.from('profiles').update({ email, referral_code: refCode }).eq('id', uid);
            // Apply referral if user came via a referral link
            applyReferralAfterRegistration(uid);
        }
    }catch(e){ CJ.handleApiError(e, 'registerProfile', {silent:true}); }

    showToast('¡Cuenta creada!','success');
    triggerConfetti();
    closeModal('modal-register');
    showApp(true);
    await loadQuedadas();

    // Enviar email de bienvenida (fire & forget)
    try {
        fetch('https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'welcome',
                to_email: email,
                to_name: (document.getElementById('reg-nombre')?.value || '').trim() || email.split('@')[0],
                lang: currentLang || 'es',
                data: { user_id: data?.user?.id }
            })
        }).catch(() => {});
    } catch(e) { CJ.handleApiError(e, 'welcomeEmail', {silent:true}); }

    // Mostrar modal de onboarding para completar perfil
    setTimeout(() => openModal('modal-complete-profile'), 1500);
}


async function doRegister(){
    const sb = window.supabaseClient;
    if(!sb){ showToast('Supabase no está listo aún. Recarga la página.','error'); return; }

    // 1) Leer campos del formulario
    const nombre = (document.getElementById('reg-nombre')?.value || '').trim();
    const apellidos = (document.getElementById('reg-apellidos')?.value || '').trim();
    const edad = (document.getElementById('reg-edad')?.value || '').trim();
    const nivel = (document.getElementById('reg-nivel')?.value || '').trim();
    const paisSel = (document.getElementById('reg-pais')?.value || '').trim();
    const provincia = (document.getElementById('reg-ciudad')?.value || '').trim();
    const poblacion = (document.getElementById('reg-poblacion')?.value || '').trim();
    const ciudad = poblacion || provincia; // Usar población si existe, si no provincia

    const prefijo = (document.getElementById('reg-prefijo')?.value || '').trim();
    const telefono = (document.getElementById('reg-telefono')?.value || '').trim();

    const email = (document.getElementById('reg-email')?.value || '').trim();
    const email2 = (document.getElementById('reg-email2')?.value || '').trim();
    const pass = (document.getElementById('reg-pass')?.value || '').trim();
    const pass2 = (document.getElementById('reg-pass2')?.value || '').trim();

    const mayor = !!document.getElementById('reg-mayor')?.checked;
    const terminos = !!document.getElementById('reg-terminos')?.checked;

    // 2) Validaciones
    if(!nombre || !apellidos){ showToast('Completa nombre y apellidos.','error'); return; }
    if(!edad || !nivel || !paisSel || !provincia){ showToast('Completa edad, nivel, país y provincia.','error'); return; }
    if(!poblacion){ showToast('Selecciona tu población/municipio.','error'); return; }
    if(!CJ.validate.email(email)){ showToast('Email no válido.','error'); return; }
    if(email !== email2){ showToast('Los emails no coinciden.','error'); return; }
    if(!CJ.validate.password(pass)){ showToast('La contraseña debe tener al menos 6 caracteres.','error'); return; }
    if(pass !== pass2){ showToast('Las contraseñas no coinciden.','error'); return; }
    if(!mayor){ showToast('Debes ser mayor de 18.','error'); return; }
    if(!terminos){ showToast('Acepta los términos.','error'); return; }

    // 3) Intento de login SOLO para detectar si el email ya existe.
    //    Si el login funciona, NO iniciamos sesión aquí: mostramos mensaje y forzamos a usar "Entrar".
    const { data: loginData, error: loginErr } = await sb.auth.signInWithPassword({
        email,
        password: pass
    });

    if(!loginErr && loginData?.session){
        // Cerramos la sesión inmediatamente (este flujo es REGISTRO, no LOGIN)
        await sb.auth.signOut();

        showToast('Este correo ya está registrado. Por favor, pulsa en “Entrar” para acceder a tu cuenta.','error');
        closeModal('modal-register');
        openModal('modal-login');
        return;
    }

    // 4) Registro real
    const { data, error } = await sb.auth.signUp({
        email,
        password: pass,
        options: {
            data: { nombre },
            emailRedirectTo: window.location.origin + '/'
        }
    });

    if(error){
        const msg = (error.message || '').toLowerCase();
        if(msg.includes('already') && (msg.includes('registered') || msg.includes('exists'))){
            showToast('Este email ya está registrado. Usa “Iniciar sesión” o “Recuperar contraseña”.','error');
            closeModal('modal-register');
            openModal('modal-login');
            return;
        }
        showToast(error.message,'error');
        return;
    }

    // 5) Si requiere confirmación por email, no habrá sesión
    if(data?.user && !data?.session){
        showToast('Te hemos enviado un email para confirmar tu cuenta. Confírmalo y luego inicia sesión.','success');
        closeModal('modal-register');
        openModal('modal-login');
        return;
    }

    // 6) Si por configuración devuelve sesión, actualizamos perfil y entramos
    try{
        const { data: u2 } = await sb.auth.getUser();
        const uid = u2?.user?.id;
        if(uid){
            const refCode = generateReferralCode();
            await sb
              .from('profiles')
              .update({
                  nombre,
                  apellidos,
                  ciudad,
                  nivel,
                  telefono: telefono ? `${prefijo}${telefono}` : null,
                  email,
                  referral_code: refCode
              })
              .eq('id', uid);
            applyReferralAfterRegistration(uid);
        }
    }catch(e){
        CJ.handleApiError(e, 'registerProfileUpdate', {silent:true});
    }

    showToast('¡Cuenta creada!','success');
    triggerConfetti();
    closeModal('modal-register');
    showApp(true);
    await loadQuedadas();

    // Mostrar modal de configuración de notificaciones para nuevos usuarios
    setTimeout(() => openModal('modal-welcome-notif'), 1500);
}



// ====== RECUPERAR CONTRASENA (SUPABASE AUTH) ======

async function doForgotPasswordSend(){
    const email = (document.getElementById('forgot-email')?.value || '').trim();
    if(!CJ.validate.email(email)){ showToast('Introduce un email válido','error'); return; }
    const sb = await getSupabaseClientOrToast(12000, true);
    if(!sb) return;

    const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/?auth=recovery&reset=1'
    });

    if(error){ showToast(error.message,'error'); return; }
    showToast('Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo y la carpeta de spam.','success');
    closeModal('modal-forgot');
    openModal('modal-login');
}

// ====== RESET PASSWORD (RECOVERY) — robust + premium ======
// Nota: evitamos que se quede "Actualizando..." usando timeout real y llamada REST directa.
async function doResetPasswordUpdate(){
    // Soporta ambos modales (legacy y actual)
    const p1 = ((document.getElementById('reset-pass')?.value || document.getElementById('reset-new-pass')?.value || '') + '').trim();
    const p2 = ((document.getElementById('reset-pass2')?.value || document.getElementById('reset-confirm-pass')?.value || '') + '').trim();
    if(!p1 || p1.length < 6){ showToast('La contraseña debe tener al menos 6 caracteres','error'); return; }
    if(p1 !== p2){ showToast('Las contraseñas no coinciden','error'); return; }

    const sb = await getSupabaseClientOrToast(12000, true);
    if(!sb) return;

    // Botón UX
    const btn = document.getElementById('reset-update-btn');
    const prevTxt = btn ? btn.textContent : '';
    if(btn){ btn.disabled = true; btn.textContent = (currentLang==='en'?'Updating...':(currentLang==='pt'?'A atualizar...':'Actualizando...')); }

    // helper: limpiar estado recovery para que no reabra el modal luego
    function clearRecoveryStateHard(){
        try{ sessionStorage.setItem('cj_recovery_done','1'); }catch(_){ }
        try{ window.history.replaceState({}, '', window.location.pathname); }catch(_){ }
        try{ window.location.hash = ''; }catch(_){ }
    }

    // helper: timeout
    const withTimeout = (p, ms=15000) => new Promise((res, rej)=>{
        const t = setTimeout(()=>rej(new Error('TIMEOUT')), ms);
        Promise.resolve(p).then(v=>{ clearTimeout(t); res(v); }).catch(e=>{ clearTimeout(t); rej(e); });
    });

    // Debe existir sesión temporal de recovery para poder cambiar la contraseña
    try{
        let { data: s } = await sb.auth.getSession();
        if(!s || !s.session){
            // Reintento: si venimos del email, a veces el intercambio PKCE / setSession tarda o no se ejecutó
            try{
                if(typeof window.__CJ_TRY_RECOVERY__ === 'function'){
                    await window.__CJ_TRY_RECOVERY__();
                }
            }catch(_){ }
            // Espera corta por si el navegador aún no persistió la sesión
            await new Promise(r=>setTimeout(r, 450));
            s = (await sb.auth.getSession()).data;
        }
        if(!s || !s.session){
            const last = String(window.__CJ_RECOVERY_LAST_ERROR__ || '');
            const lower = last.toLowerCase();
            if(lower.includes('code verifier') || lower.includes('code_verifier') || lower.includes('verifier should be non-empty')){
                showToast('Enlace inválido para este navegador. Este reset usa PKCE y debe abrirse en el MISMO navegador/dispositivo donde pediste “Recuperar contraseña”. Pide un nuevo enlace desde aquí y ábrelo sin cambiar de navegador.','error');
                return;
            }
            const extra = last ? (' Detalle: ' + last) : '';
            showToast('No se detecta una sesión de recuperación. Abre el enlace del correo en el navegador (no previsualizador) y prueba de nuevo.' + extra,'error');
            return;
        }
    }catch(_){ }

    try{
        // 1) Obtener token de sesión recovery
        const { data: sessData } = await sb.auth.getSession();
        const accessToken = sessData?.session?.access_token;
        if(!accessToken){
            showToast('No se detecta sesión de recuperación. Abre el enlace del correo de nuevo.','error');
            return;
        }

        // 2) Actualizar password via REST (evita cuelgues del SDK en algunos entornos)
        const url = `${SUPABASE_URL}/auth/v1/user`;
        const resp = await withTimeout(fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ password: p1 })
        }), 15000);

        const txt = await resp.text();
        let payload = null;
        try{ payload = txt ? JSON.parse(txt) : null; }catch(_){ payload = null; }

        if(!resp.ok){
            const msg = payload?.msg || payload?.message || payload?.error_description || payload?.error || `Error ${resp.status}`;
            showToast(String(msg), 'error');
            return;
        }

        // 3) Éxito: cerrar modal, limpiar URL/hash y volver a login
        clearRecoveryStateHard();
        try{ closeModal('modal-reset'); }catch(_){ }
        try{ closeModal('modal-reset-password'); }catch(_){ }

        // cerrar sesión recovery
        try{ await sb.auth.signOut(); }catch(_){ }

        showToast('Contraseña actualizada correctamente. Inicia sesión con la nueva contraseña.','success');
        try{ showLanding(); }catch(_){ }
        setTimeout(()=>{ try{ openModal('modal-login'); }catch(_){ } }, 250);
    }catch(e){
        if(String(e?.message||'')==='TIMEOUT'){
            showToast('No se pudo completar (timeout). Reintenta desde el enlace del correo.','error');
        }else{
            showToast('Error actualizando contraseña: ' + (e?.message||e), 'error');
        }
    }finally{
        if(btn){ btn.disabled = false; btn.textContent = prevTxt || (currentLang==='en'?'Update password':(currentLang==='pt'?'Atualizar palavra-passe':'Actualizar contraseña')); }
    }
}

// Permite validar manualmente el enlace del correo (útil cuando el usuario abre el email en otro dispositivo/navegador
// y el flujo PKCE no puede canjear el code por falta de code_verifier).
async function doValidateResetLink(){
    const raw = ((document.getElementById('reset-link')?.value || '') + '').trim();
    if(!raw){ showToast('Pega el enlace completo del correo para validarlo','error'); return; }
    const sb = await getSupabaseClientOrToast(12000, true);
    if(!sb) return;

    // Acepta: URL de Supabase /auth/v1/verify?token=...&type=recovery&redirect_to=...
    //        URL final en tu sitio con ?code=... o ?token_hash=... o #access_token=...
    try{
        let u;
        try{ u = new URL(raw); }catch(_){
            // Si el usuario pega solo query/hash, intentamos completar
            u = new URL(raw.startsWith('?') || raw.startsWith('#') ? (window.location.origin + '/' + raw) : (window.location.origin + '/?' + raw));
        }

        // 1) Hash tokens
        const h = new URLSearchParams((u.hash || '').replace(/^#/, ''));
        const at = h.get('access_token');
        const rt = h.get('refresh_token');
        if(at && rt){
            const { error } = await sb.auth.setSession({ access_token: at, refresh_token: rt });
            if(error) throw error;
            showToast('Enlace validado. Ya puedes actualizar la contraseña.','success');
            return;
        }

        // 2) token_hash / token (OTP)
        const qs = new URLSearchParams(u.search || '');
        const type = (qs.get('type') || 'recovery').toLowerCase();
        const token_hash = qs.get('token_hash');
        const token = qs.get('token');
        if(token_hash){
            const { error } = await sb.auth.verifyOtp({ type: type || 'recovery', token_hash });
            if(error) throw error;
            showToast('Enlace validado. Ya puedes actualizar la contraseña.','success');
            return;
        }
        if(token){
            // Para enlaces /auth/v1/verify?...token=...
            const { error } = await sb.auth.verifyOtp({ type: type || 'recovery', token });
            if(error) throw error;
            showToast('Enlace validado. Ya puedes actualizar la contraseña.','success');
            return;
        }

        // 3) PKCE code (solo funciona si el code_verifier existe en este navegador)
        const code = qs.get('code');
        if(code){
            const { error } = await sb.auth.exchangeCodeForSession(code);
            if(error) throw error;
            showToast('Enlace validado. Ya puedes actualizar la contraseña.','success');
            return;
        }

        showToast('Ese enlace no contiene token/código de recuperación. Copia el enlace del botón del correo (no el texto) y pégalo completo.','error');
    }catch(e){
        const msg = (e && e.message) ? e.message : String(e);
        // Mensaje específico para PKCE sin verifier
        if(msg.toLowerCase().includes('code verifier') || msg.toLowerCase().includes('code_verifier') || msg.toLowerCase().includes('verifier should be non-empty')){
            showToast('Este enlace es PKCE y no puede validarse en este navegador (falta code_verifier). Solución: solicita el reset desde este mismo navegador y abre el email aquí, o copia el enlace ORIGINAL de Supabase (/auth/v1/verify?token=...) y pégalo.','error');
            return;
        }
        showToast('No se pudo validar el enlace: ' + msg,'error');
    }
}

// Alias para versiones antiguas del modal (si quedó cacheado o conviven ambos)
async function doResetPassword(){
    return doResetPasswordUpdate();
}

// Alias legacy: el botón del modal llama a updatePassword()
window.updatePassword = doResetPasswordUpdate;

    // ─── Expose to window ────────────────────────────────
    window.showApp = showApp;
    window.processDeepLinkAfterLogin = processDeepLinkAfterLogin;
    window.showLanding = showLanding;
    window.updateUserUI = updateUserUI;
    window.logout = logout;
    window.hideSuggestionsRegister = hideSuggestionsRegister;
    window.onPlaceInputRegister = onPlaceInputRegister;
    window.getSupabaseClientOrToast = getSupabaseClientOrToast;
    window.loginWithGoogle = loginWithGoogle;
    window.doLogin = doLogin;
    window.togglePasswordVisibility = togglePasswordVisibility;
    window.validateLoginEmail = validateLoginEmail;
    window.validateRegEmail = validateRegEmail;
    window.validatePasswordRealtime = validatePasswordRealtime;
    window.doRegisterSimple = doRegisterSimple;
    window.doRegister = doRegister;
    window.doForgotPasswordSend = doForgotPasswordSend;
    window.doResetPasswordUpdate = doResetPasswordUpdate;
    window.doValidateResetLink = doValidateResetLink;
    window.doResetPassword = doResetPassword;
})();
