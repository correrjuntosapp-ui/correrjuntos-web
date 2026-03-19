// ========================= UI MODULE =========================
// Modal management, formatting helpers, utility functions.
// Loaded AFTER state.js. Exposes functions on window.* for backward compat.
(function() {
    'use strict';

var __cjPrevFocus = null;
var __cjFocusableSelector = 'a[href]:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([type=hidden]):not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

function escapeLocationText(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeInlineArg(value) {
    return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, ' ');
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return mins + 'm';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h';
    const days = Math.floor(hrs / 24);
    return days + 'd';
}

// ========== ACTIVE MISSION (Motor de Acción) ==========

function showWelcomeAnimation() {
    // Añadir overlay
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);

    // Añadir clase a la app
    const app = document.getElementById('view-app');
    if (app) {
        app.classList.add('welcome-anim');
        setTimeout(() => app.classList.remove('welcome-anim'), 1000);
    }
}


function formatDate(d){
    if(!d)return'';
    const t = I18N[currentLang] || I18N.es;
    const m = [t.monthJan, t.monthFeb, t.monthMar, t.monthApr, t.monthMay, t.monthJun, t.monthJul, t.monthAug, t.monthSep, t.monthOct, t.monthNov, t.monthDec];
    const[y,mo,da]=d.split('-');
    return`${parseInt(da)} ${m[parseInt(mo)-1]} ${y}`;
}

// Formatear fecha corta: "Hoy", "Mañana", "Lun 3"
function formatDateShort(d){
    if(!d) return '';
    const t = I18N[currentLang] || I18N.es;
    const today = new Date();
    const date = new Date(d + 'T00:00:00');
    const diffDays = Math.floor((date - new Date(today.toDateString())) / (1000*60*60*24));

    if(diffDays === 0) return t.dateToday;
    if(diffDays === 1) return t.dateTomorrow;

    const dias = currentLang === 'en'
        ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        : ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    return `${dias[date.getDay()]} ${date.getDate()}`;
}

// Formatear hora: elimina segundos (16:00:00 -> 16:00)
function formatHora(h){if(!h)return'--:--';return h.split(':').slice(0,2).join(':');}


function openModal(id){
  var el = document.getElementById(id);
  if(!el) return;
  // Guardar foco previo para restaurar al cerrar
  __cjPrevFocus = document.activeElement;
  el.classList.add('active');
  // Accesibilidad: role, aria-modal
  el.setAttribute('role','dialog');
  el.setAttribute('aria-modal','true');
  // Buscar título para aria-labelledby — si no tiene ID, generar uno
  var titleEl = el.querySelector('[id$="-title"], [id$="-titulo"], .text-xl, .text-2xl, h2, h3');
  if(titleEl){
    if(!titleEl.id) titleEl.id = id + '-auto-title';
    el.setAttribute('aria-labelledby', titleEl.id);
  }
  // Bloquear scroll del body
  document.body.style.overflow = 'hidden';
  // Focus trap: mover foco al primer elemento focusable dentro de modal-content
  setTimeout(function(){
    var container = el.querySelector('.modal-content') || el;
    var focusable = container.querySelectorAll(__cjFocusableSelector);
    if(focusable.length) focusable[0].focus();
  }, 120);
  // Focus trap listener — en documento para capturar todos los Tab
  el.__cjTrapFocus = function(e){
    if(e.key !== 'Tab') return;
    var container = el.querySelector('.modal-content') || el;
    var focusable = Array.from(container.querySelectorAll(__cjFocusableSelector)).filter(function(f){ return f.offsetParent !== null; });
    if(!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if(e.shiftKey){
      if(document.activeElement === first || !container.contains(document.activeElement)){ e.preventDefault(); last.focus(); }
    } else {
      if(document.activeElement === last || !container.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', el.__cjTrapFocus);
  // Cerrar con Escape
  el.__cjEscClose = function(e){
    if(e.key === 'Escape') closeModal(id);
  };
  document.addEventListener('keydown', el.__cjEscClose);
  // Si es el modal de completar perfil, detectar ubicación automáticamente
  if(id === 'modal-complete-profile'){
    window.__cjProfileCompletionRequired = true;
    setTimeout(() => {
      try{ detectarUbicacionGPS(); }catch(_){}
    }, 500);
  }
}
function closeModal(id){
  // No permitir cerrar modal-complete-profile si el perfil está incompleto
  if(id === 'modal-complete-profile' && window.__cjProfileCompletionRequired){
    showToast('Completa tu perfil para continuar', 'error');
    return;
  }
  // Guardar borrador al cerrar modal crear quedada
  if(id === 'modal-crear'){
    try{ if(typeof saveDraftQuedada === 'function') saveDraftQuedada(); }catch(_){}
  }
  var el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('active');
  // Limpiar focus trap listeners del document
  if(el.__cjTrapFocus){ document.removeEventListener('keydown', el.__cjTrapFocus); el.__cjTrapFocus = null; }
  if(el.__cjEscClose){ document.removeEventListener('keydown', el.__cjEscClose); el.__cjEscClose = null; }
  // Restaurar scroll del body (solo si no hay otro modal activo)
  if(!document.querySelector('.modal.active')) document.body.style.overflow = '';
  // Limpiar hash de deep link si era un modal con ruta
  if(id === 'modal-quedada-detail' || id === 'modal-user-profile' || id === 'modal-ranking'){
    try{ if(window.location.hash) history.replaceState({}, '', window.location.pathname + window.location.search); }catch(_){}
  }
  // Restaurar foco previo
  if(__cjPrevFocus && typeof __cjPrevFocus.focus === 'function'){
    try{ __cjPrevFocus.focus(); }catch(_){}
  }
  __cjPrevFocus = null;
}

// Cerrar todos los modales activos (para navegación bottom-nav)
function closeAllModals(){
  document.querySelectorAll('.modal.active').forEach(function(m){
    try{ closeModal(m.id); }catch(_){}
  });
}

// Ver perfil de organizador - abre modal con info detallada

function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}


function scrollToMap(){
    const mapEl = document.getElementById('map');
    if(mapEl){
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight del mapa
        setTimeout(() => {
            mapEl.style.boxShadow = '0 0 0 4px rgba(249, 115, 22, 0.5)';
            setTimeout(() => { mapEl.style.boxShadow = ''; }, 2000);
        }, 500);
    }
}

// ===================== FUNCIONES MEJORADAS CREAR QUEDADA =====================

// 📊 Actualizar barra de progreso del formulario (más granular)

function isNewUser() {
    // Usuario no logueado o sin fecha de creación = mostrar seed
    if (!currentUser || !currentUser.created_at) return true;
    // Usuarios seed nunca ven contenido seed
    if (currentUser.es_seed) return false;
    // TEMP: Todos los usuarios ven seed hasta masa critica
    return true;
    // --- Original filter (restaurar cuando haya 15+ quedadas reales) ---
    // const createdAt = new Date(currentUser.created_at);
    // const now = new Date();
    // const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    // return diffDays < 7;
}

// ===================== SUPABASE: CARGA DE QUEDADAS =====================

function toggleWelcomeLevelAll(checkbox) {
    const checks = document.querySelectorAll('.welcome-level-check');
    checks.forEach(c => c.checked = checkbox.checked);
}

function skipWelcomeNotif() {
    closeModal('modal-welcome-notif');
    showToast('Puedes configurar notificaciones desde tu perfil', 'info');
    // Mostrar CTA para ver quedadas
    setTimeout(() => openModal('modal-onboarding-complete'), 300);
}

async function saveWelcomeNotif() {
    if (!currentUser) {
        closeModal('modal-welcome-notif');
        return;
    }

    const distance = document.getElementById('welcome-distance').value;
    const levels = [];
    if (document.getElementById('welcome-level-all').checked) {
        levels.push('Todos');
    } else {
        if (document.getElementById('welcome-level-beginner').checked) levels.push('Principiante');
        if (document.getElementById('welcome-level-intermediate').checked) levels.push('Intermedio');
        if (document.getElementById('welcome-level-advanced').checked) levels.push('Avanzado');
    }

    const notifPush = document.getElementById('welcome-notif-push').checked;
    const notifEmail = document.getElementById('welcome-notif-email').checked;

    const sb = await getSupabaseClientOrToast(10000, true);
    if (!sb) return;

    try {
        const { error } = await window.supabaseClient
            .from('profiles')
            .update({
                notif_push: notifPush,
                notif_email: notifEmail,
                notif_distance_km: parseInt(distance),
                notif_levels: levels
            })
            .eq('id', currentUser.id);

        if (error) throw error;

        // Actualizar currentUser
        currentUser.notif_push = notifPush;
        currentUser.notif_email = notifEmail;

        closeModal('modal-welcome-notif');

        // Si activó push, solicitar permiso y registrar suscripción
        if (notifPush) {
            try {
                await ensurePushLoaded();
                if (typeof requestPushPermission === 'function') await requestPushPermission();
            } catch(e) {
                console.warn('Error activando push:', e);
            }
        }

        // Mostrar CTA para ver quedadas
        setTimeout(() => openModal('modal-onboarding-complete'), 500);
    } catch (err) {
        console.error('Error guardando preferencias:', err);
        showToast('Error al guardar preferencias', 'error');
    }
}


    // ─── Expose to window ────────────────────────────────
    window.escapeLocationText = escapeLocationText;
    window.escapeInlineArg = escapeInlineArg;
    window.timeAgo = timeAgo;
    window.showWelcomeAnimation = showWelcomeAnimation;
    window.formatDate = formatDate;
    window.formatDateShort = formatDateShort;
    window.formatHora = formatHora;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.closeAllModals = closeAllModals;
    window.escapeHtml = escapeHtml;
    window.scrollToMap = scrollToMap;
    window.isNewUser = isNewUser;
    window.toggleWelcomeLevelAll = toggleWelcomeLevelAll;
    window.skipWelcomeNotif = skipWelcomeNotif;
    window.saveWelcomeNotif = saveWelcomeNotif;
})();
