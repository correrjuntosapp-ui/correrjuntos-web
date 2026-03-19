// ========================= PROFILE MODULE =========================
// User profile, onboarding, avatar, stats, referrals, stats card.
// Loaded AFTER state.js, error-handler.js, validation.js, ui.js.
(function() {
    'use strict';

let verifyFileData = null;

let userStats = { quedadas: 0, km: 0, runners: 0, racha: 0, created: 0, first5k: false, weeklyActivity: [0,0,0,0,0,0,0,0] };


async function loadUserStats() {
    if (!currentUser) return;
    if (!window.supabaseClient) return;
    try {
        // Contar quedadas donde el usuario participó
        const { data: participaciones } = await window.supabaseClient
            .from('participantes')
            .select('quedada_id, quedadas(distancia, fecha, creador_id)')
            .eq('user_id', currentUser.id)
            .limit(200);

        if (participaciones) {
            userStats.quedadas = participaciones.length;

            // Calcular km totales
            let totalKm = 0;
            const uniqueRunners = new Set();
            const weeklyRuns = {};

            let has5kRun = false;
            for (const p of participaciones) {
                if (p.quedadas) {
                    // Extraer distancia numérica
                    const distMatch = String(p.quedadas.distancia || '').match(/(\d+)/);
                    if (distMatch) {
                        const dist = parseInt(distMatch[1]);
                        totalKm += dist;
                        // Detectar si ha completado una quedada de 5+ km
                        if (dist >= 5) has5kRun = true;
                    }

                    // Registrar semana para racha
                    if (p.quedadas.fecha) {
                        const d = new Date(p.quedadas.fecha);
                        const weekKey = `${d.getFullYear()}-${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`;
                        weeklyRuns[weekKey] = true;
                    }
                }
            }
            userStats.km = totalKm;
            userStats.first5k = has5kRun;

            // Contar runners únicos
            for (const p of participaciones) {
                const { data: coRunners } = await window.supabaseClient
                    .from('participantes')
                    .select('user_id')
                    .eq('quedada_id', p.quedada_id)
                    .neq('user_id', currentUser.id);
                if (coRunners) coRunners.forEach(r => uniqueRunners.add(r.user_id));
            }
            userStats.runners = uniqueRunners.size;

            // Calcular racha (semanas consecutivas)
            userStats.racha = Object.keys(weeklyRuns).length;

            // Calcular actividad semanal real (últimas 8 semanas)
            var weekly8 = [0,0,0,0,0,0,0,0];
            var nowMs = Date.now();
            for (const p of participaciones) {
                if (p.quedadas && p.quedadas.fecha) {
                    var dMs = new Date(p.quedadas.fecha).getTime();
                    var weeksAgo = Math.floor((nowMs - dMs) / (7*24*60*60*1000));
                    if (weeksAgo >= 0 && weeksAgo < 8) weekly8[weeksAgo]++;
                }
            }
            // weekly8[0] = esta semana, weekly8[7] = hace 8 semanas
            userStats.weeklyActivity = weekly8;
        }

        // Contar quedadas creadas
        const { count } = await window.supabaseClient
            .from('quedadas')
            .select('*', { count: 'exact', head: true })
            .eq('creador_id', currentUser.id);
        userStats.created = count || 0;

        updateStatsUI();
    } catch (e) {
        console.warn('Stats error:', e);
    }
}

function updateStatsUI() {
    const panel = document.getElementById('user-stats-panel');
    if (!currentUser) {
        if (panel) panel.classList.add('hidden');
        return;
    }
    if (panel) panel.classList.remove('hidden');

    // Mostrar '—' en vez de '0' para stats vacías (más elegante para usuarios nuevos)
    document.getElementById('stat-quedadas').textContent = userStats.quedadas || '—';
    document.getElementById('stat-km').textContent = userStats.km || '—';
    document.getElementById('stat-runners').textContent = userStats.runners || '—';

    // Contar próximas quedadas donde el usuario está apuntado
    const today = new Date();
    today.setHours(0,0,0,0);
    const proximasCount = quedadas.filter(q => {
        if (!currentUser) return false;
        const asistentes = Array.isArray(q.asistentes) ? q.asistentes : (Array.isArray(q.asistentes_info) ? q.asistentes_info.map(a => a.user_id) : []);
        const isJoined = asistentes.includes(currentUser.id);
        const qDate = new Date(q.fecha + 'T00:00:00');
        return isJoined && qDate >= today;
    }).length;
    document.getElementById('stat-proximas').textContent = proximasCount || '—';

    // Actualizar avatar del banner
    const avatarInitials = document.getElementById('user-avatar-initials');
    const avatarImg = document.getElementById('user-avatar-img');
    const avatarBanner = document.getElementById('user-avatar-banner');
    if (avatarInitials && avatarImg && currentUser) {
        const initials = ((currentUser.nombre?.charAt(0) || '') + (currentUser.apellidos?.charAt(0) || '')).toUpperCase() || 'R';
        avatarInitials.textContent = initials;

        const userPhoto = currentUser.photo || currentUser.photo_url || currentUser.avatar_url;
        if (userPhoto) {
            avatarImg.src = userPhoto;
            avatarImg.alt = (currentUser.nombre || 'Usuario') + ' — foto de perfil';
            avatarImg.classList.remove('hidden');
            avatarInitials.classList.add('hidden');
        } else {
            avatarImg.classList.add('hidden');
            avatarInitials.classList.remove('hidden');
        }

        // Añadir borde dorado si es premium
        if (avatarBanner && currentUser.es_premium) {
            avatarBanner.classList.add('premium-avatar-border');
        } else if (avatarBanner) {
            avatarBanner.classList.remove('premium-avatar-border');
        }
    }

    // Actualizar resumen personalizado
    const summaryText = document.getElementById('stat-summary-text');
    const summarySub = document.getElementById('stat-summary-sub');
    if (summaryText && summarySub) {
        const t = I18N[currentLang] || I18N.es;
        if (proximasCount > 0) {
            const runsWord = currentLang === 'en' ? (proximasCount > 1 ? 'runs' : 'run') : (proximasCount > 1 ? 'quedadas' : 'quedada');
            const upcomingWord = currentLang === 'en' ? 'upcoming' : (proximasCount > 1 ? 'próximas' : 'próxima');
            summaryText.textContent = currentLang === 'en'
                ? `You have ${proximasCount} upcoming ${runsWord}`
                : `Tienes ${proximasCount} ${runsWord} ${upcomingWord}`;
            summarySub.textContent = currentLang === 'en'
                ? `${userStats.km} km run with ${userStats.runners} runners`
                : `${userStats.km} km corridos con ${userStats.runners} runners`;
        } else if (userStats.quedadas > 0) {
            const runsWord = currentLang === 'en' ? (userStats.quedadas > 1 ? 'runs' : 'run') : (userStats.quedadas > 1 ? 'quedadas' : 'quedada');
            summaryText.textContent = currentLang === 'en'
                ? `You've joined ${userStats.quedadas} ${runsWord}`
                : `Has participado en ${userStats.quedadas} ${runsWord}`;
            summarySub.textContent = currentLang === 'en'
                ? `${userStats.km} km total · Join a new one!`
                : `${userStats.km} km totales · ¡Únete a una nueva!`;
        } else {
            // Usuario nuevo sin quedadas - mostrar mensaje motivador con número de quedadas disponibles
            const totalQuedadasDisponibles = quedadas ? quedadas.length : 0;
            summaryText.textContent = `${t.welcome}, ${currentUser.nombre || 'runner'}!`;
            if (totalQuedadasDisponibles > 0) {
                summarySub.textContent = currentLang === 'en'
                    ? `We found ${totalQuedadasDisponibles} runs near you 👇`
                    : `Encontramos ${totalQuedadasDisponibles} quedadas cerca de ti 👇`;
            } else {
                summarySub.textContent = t.joinFirst;
            }
        }
    }

    // ⭐ Actualizar sección de estadísticas premium
    const premiumStatsSection = document.getElementById('premium-stats-section');
    const premiumStatsLocked = document.getElementById('premium-stats-locked');

    if (isUserPremium) {
        // Mostrar estadísticas premium
        if (premiumStatsSection) premiumStatsSection.classList.remove('hidden');
        if (premiumStatsLocked) premiumStatsLocked.classList.add('hidden');

        // Llenar datos premium
        const statRacha = document.getElementById('stat-racha');
        const statAvgKm = document.getElementById('stat-avg-km');
        const statCreated = document.getElementById('stat-created');
        const statBadgesUnlocked = document.getElementById('stat-badges-unlocked');

        if (statRacha) statRacha.textContent = userStats.racha || 0;
        if (statAvgKm) statAvgKm.textContent = userStats.quedadas > 0 ? Math.round(userStats.km / userStats.quedadas) : 0;
        if (statCreated) statCreated.textContent = userStats.created || 0;

        // Contar badges desbloqueados
        const unlockedBadges = BADGES_CONFIG.filter(b => b.condition(userStats)).length;
        if (statBadgesUnlocked) statBadgesUnlocked.textContent = unlockedBadges;

        // Generar mini gráfico de actividad (datos reales de últimas 8 semanas)
        const activityChart = document.getElementById('activity-chart');
        if (activityChart) {
            const wa = userStats.weeklyActivity || [0,0,0,0,0,0,0,0];
            const maxRuns = Math.max(1, ...wa); // evitar división por 0
            let chartHtml = '';
            for (let i = 7; i >= 0; i--) { // S8 (más antigua) → S1 (más reciente)
                const pct = Math.round((wa[i] / maxRuns) * 100);
                const label = i === 0 ? 'Hoy' : 'S' + i;
                chartHtml += `<div class="flex-1 flex flex-col items-center gap-1">
                    <div class="activity-bar w-full" style="height: ${pct > 0 ? Math.max(pct, 8) : 4}%" title="${wa[i]} quedada${wa[i]!==1?'s':''}"></div>
                    <span class="text-[8px] text-gray-500">${label}</span>
                </div>`;
            }
            activityChart.innerHTML = chartHtml;
        }
        // 🗺️ Heatmap: mostrar para premium
        const heatmapSection = document.getElementById('premium-heatmap-section');
        const heatmapLocked = document.getElementById('premium-heatmap-locked');
        if (heatmapSection) heatmapSection.classList.remove('hidden');
        if (heatmapLocked) heatmapLocked.classList.add('hidden');
        loadPersonalHeatmap();

        // 📊 Stats avanzadas
        loadEnhancedStats();
    } else {
        // Mostrar mensaje de desbloqueo
        if (premiumStatsSection) premiumStatsSection.classList.add('hidden');
        if (premiumStatsLocked) premiumStatsLocked.classList.remove('hidden');

        // Heatmap locked
        const heatmapSection = document.getElementById('premium-heatmap-section');
        const heatmapLocked = document.getElementById('premium-heatmap-locked');
        if (heatmapSection) heatmapSection.classList.add('hidden');
        if (heatmapLocked) heatmapLocked.classList.remove('hidden');
    }
}

// C4: loadEnhancedStats → moved to /js/premium-features.js (window.loadEnhancedStats)

// ========== PERSONAL HEATMAP ==========
let personalHeatmapInstance = null;


async function loadPersonalHeatmap() {
    const container = document.getElementById('personal-heatmap');
    if (!container || !currentUser) return;

    // Evitar recrear si ya existe
    if (personalHeatmapInstance) {
        try { personalHeatmapInstance.remove(); } catch(_) {}
        personalHeatmapInstance = null;
    }

    try {
        const sb = await getSupabaseClientOrToast(5000, false);
        if (!sb) return;

        const { data } = await sb
            .from('participantes')
            .select('quedadas(lat, lng, ciudad)')
            .eq('user_id', currentUser.id)
            .limit(500);

        const points = (data || [])
            .filter(p => p.quedadas && p.quedadas.lat && p.quedadas.lng)
            .map(p => [p.quedadas.lat, p.quedadas.lng, 1]);

        const t = I18N[currentLang] || I18N.es;

        if (!points.length) {
            container.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 text-sm">${t.premiumHeatmapEmpty || 'Únete a quedadas para ver tu mapa'}</div>`;
            return;
        }

        // Contar zonas únicas (~1km grid)
        const zones = new Set(points.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`));
        const zonesEl = document.getElementById('heatmap-zones-count');
        if (zonesEl) zonesEl.textContent = `${zones.size} ${t.premiumHeatmapZones || 'zonas'}`;

        // Cargar Leaflet + heat plugin
        await ensureLeaflet();
        if (!L.heatLayer) {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        personalHeatmapInstance = L.map(container, {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(personalHeatmapInstance);

        L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: { 0.4: '#3b82f6', 0.6: '#22c55e', 0.8: '#eab308', 1.0: '#f97316' }
        }).addTo(personalHeatmapInstance);

        const bounds = L.latLngBounds(points.map(p => [p[0], p[1]]));
        personalHeatmapInstance.fitBounds(bounds.pad(0.2));
    } catch (e) {
        console.warn('Heatmap error:', e);
        container.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Error cargando mapa</div>';
    }
}

// ========== QUEDADA COMMENTS ==========

function openVerifyLevelModal() {
    if (!currentUser) {
        showToast('Debes iniciar sesión', 'error');
        return;
    }
    verifyFileData = null;

    // Resetear formulario
    document.getElementById('verify-claimed-level').value = currentUser.nivel || 'Intermedio';
    document.getElementById('verify-strava-link').value = '';
    document.getElementById('verify-upload-preview').classList.add('hidden');
    document.getElementById('verify-upload-prompt').classList.remove('hidden');

    // Cargar estado actual de verificación
    loadVerificationStatus();

    // Setup listeners para cambio de metodo
    document.querySelectorAll('input[name="verify-method"]').forEach(radio => {
        radio.addEventListener('change', onVerifyMethodChange);
    });
    onVerifyMethodChange();

    openModal('modal-verify-level');
}

function onVerifyMethodChange() {
    const method = document.querySelector('input[name="verify-method"]:checked')?.value;
    const uploadSection = document.getElementById('verify-upload-section');
    const linkSection = document.getElementById('verify-link-section');

    if (method === 'strava_link') {
        uploadSection.classList.add('hidden');
        linkSection.classList.remove('hidden');
    } else {
        uploadSection.classList.remove('hidden');
        linkSection.classList.add('hidden');
    }
}

function onVerifyFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen es muy grande (max 5MB)', 'error');
        return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
        showToast('Solo se permiten imágenes', 'error');
        return;
    }

    verifyFileData = file;

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const vImg = document.getElementById('verify-preview-img');
        vImg.src = e.target.result;
        vImg.alt = 'Vista previa del documento de verificación';
        document.getElementById('verify-upload-preview').classList.remove('hidden');
        document.getElementById('verify-upload-prompt').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

async function loadVerificationStatus() {
    if (!currentUser) return;

    const sb = await getSupabaseClientOrToast(5000, false);
    if (!sb) return;

    try {
        const { data } = await window.supabaseClient
            .from('level_verifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const statusIcon = document.getElementById('verify-status-icon');
        const statusText = document.getElementById('verify-status-text');
        const statusDesc = document.getElementById('verify-status-desc');
        const statusContainer = document.getElementById('verify-current-status');

        if (!data) {
            statusIcon.textContent = '⏳';
            statusText.textContent = 'Sin verificar';
            statusDesc.textContent = 'Verifica tu nivel para ganar credibilidad';
            statusContainer.className = 'p-4 rounded-xl bg-slate-800/50 border border-slate-700';
        } else if (data.status === 'pending') {
            statusIcon.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>';
            statusText.textContent = 'Pendiente de revisión';
            statusDesc.textContent = `Nivel ${data.claimed_level} - Enviado el ${new Date(data.created_at).toLocaleDateString()}`;
            statusContainer.className = 'p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30';
        } else if (data.status === 'approved') {
            statusIcon.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>';
            statusText.textContent = '¡Verificado!';
            statusDesc.textContent = `Nivel ${data.claimed_level} verificado`;
            statusContainer.className = 'p-4 rounded-xl bg-green-500/10 border border-green-500/30';
        } else if (data.status === 'rejected') {
            statusIcon.textContent = '❌';
            statusText.textContent = 'Rechazado';
            statusDesc.textContent = data.reviewer_notes || 'Puedes enviar una nueva solicitud';
            statusContainer.className = 'p-4 rounded-xl bg-red-500/10 border border-red-500/30';
        }
    } catch (err) {
        console.warn('Error cargando estado de verificación:', err);
    }
}

async function submitVerification() {
    if (!currentUser) {
        showToast('Debes iniciar sesión', 'error');
        return;
    }

    const method = document.querySelector('input[name="verify-method"]:checked')?.value;
    const claimedLevel = document.getElementById('verify-claimed-level').value;

    if (!method || !claimedLevel) {
        showToast('Completa todos los campos', 'error');
        return;
    }

    let evidenceUrl = null;

    // Para strava_link, usar el enlace
    if (method === 'strava_link') {
        const link = document.getElementById('verify-strava-link').value.trim();
        if (!link || !link.includes('strava.com')) {
            showToast('Introduce un enlace de Strava válido', 'error');
            return;
        }
        evidenceUrl = link;
    } else {
        // Para screenshots o fotos, necesitamos subir la imagen
        if (!verifyFileData) {
            showToast('Selecciona una imagen', 'error');
            return;
        }

        // Subir a Supabase Storage
        showToast('Subiendo imagen...', 'info');
        const sb = await getSupabaseClientOrToast(15000, true);
        if (!sb) return;

        try {
            const fileName = `${currentUser.id}/${Date.now()}_${verifyFileData.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('verifications')
                .upload(fileName, verifyFileData);

            if (uploadError) {
                // Si el bucket no existe, usar una URL placeholder
                console.warn('Error subiendo imagen (bucket puede no existir):', uploadError);
                evidenceUrl = `pending_upload_${Date.now()}`;
            } else {
                // Obtener URL pública
                const { data: urlData } = window.supabaseClient.storage
                    .from('verifications')
                    .getPublicUrl(fileName);
                evidenceUrl = urlData?.publicUrl || `uploaded_${Date.now()}`;
            }
        } catch (err) {
            console.warn('Error en upload:', err);
            evidenceUrl = `pending_upload_${Date.now()}`;
        }
    }

    // Guardar en base de datos
    const sb = await getSupabaseClientOrToast(10000, true);
    if (!sb) return;

    try {
        const { error } = await window.supabaseClient
            .from('level_verifications')
            .insert({
                user_id: currentUser.id,
                verification_type: method,
                evidence_url: evidenceUrl,
                claimed_level: claimedLevel,
                status: 'pending'
            });

        if (error) throw error;

        showToast('¡Solicitud enviada! La revisaremos pronto.', 'success');
        triggerConfetti();
        closeModal('modal-verify-level');
    } catch (err) {
        console.error('Error al enviar verificación:', err);
        showToast('Error al enviar solicitud', 'error');
    }
}

async function loadProfileVerificationStatus() {
    if (!currentUser) return;

    const verifyBtn = document.getElementById('btn-verify-level');
    const verifyStatus = document.getElementById('profile-verify-status');

    const sb = await getSupabaseClientOrToast(5000, false);
    if (!sb) return;

    try {
        // Comprobar si el usuario tiene verificación aprobada
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('verification_badge, verified_level')
            .eq('id', currentUser.id)
            .maybeSingle();

        if (profile?.verification_badge) {
            // Usuario verificado
            verifyBtn.innerHTML = '<span>✓</span> Verificado';
            verifyBtn.className = 'px-4 py-3 rounded-xl font-bold text-sm bg-green-500/30 text-green-400 border border-green-500/50 flex items-center gap-2 whitespace-nowrap cursor-default';
            verifyStatus.classList.remove('hidden');
            verifyStatus.textContent = '';
            var _vsSpan = document.createElement('span');
            _vsSpan.className = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30';
            _vsSpan.textContent = '✓ Nivel ' + (profile.verified_level || currentUser.nivel) + ' verificado';
            verifyStatus.appendChild(_vsSpan);
        } else {
            // Comprobar si hay solicitud pendiente
            const { data: pending } = await window.supabaseClient
                .from('level_verifications')
                .select('status, claimed_level')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (pending?.status === 'pending') {
                verifyBtn.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Pendiente';
                verifyBtn.className = 'px-4 py-3 rounded-xl font-bold text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-2 whitespace-nowrap';
                verifyStatus.classList.remove('hidden');
                verifyStatus.textContent = '';
                var _vpSpan = document.createElement('span');
                _vpSpan.className = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
                _vpSpan.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> ';
                var _vpText = document.createTextNode('Solicitud de ' + (pending.claimed_level || '') + ' en revisión');
                _vpSpan.appendChild(_vpText);
                verifyStatus.appendChild(_vpSpan);
            } else {
                verifyBtn.innerHTML = '<span>✓</span> Verificar';
                verifyBtn.className = 'px-4 py-3 rounded-xl font-bold text-sm bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition flex items-center gap-2 whitespace-nowrap';
                verifyStatus.classList.add('hidden');
            }
        }
    } catch (err) {
        console.warn('Error cargando estado de verificación:', err);
    }
}

function generateReferralCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CJ-';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

// Detect ?ref= param on page load and store it
function detectReferralParam() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.startsWith('CJ-')) {
        localStorage.setItem('cj_referral_code', ref);
        if (typeof gtag === 'function') {
            gtag('event', 'referral_click', { referral_code: ref });
        }
    }
}

// Apply stored referral after registration
async function applyReferralAfterRegistration(newUserId) {
    const refCode = localStorage.getItem('cj_referral_code');
    if (!refCode || !window.supabaseClient) return;
    try {
        // Find the referrer by their code
        const { data: referrer } = await window.supabaseClient
            .from('profiles')
            .select('id, referral_count')
            .eq('referral_code', refCode)
            .single();
        if (!referrer || referrer.id === newUserId) return;

        // Update new user's referred_by
        await window.supabaseClient
            .from('profiles')
            .update({ referred_by: referrer.id })
            .eq('id', newUserId);

        // Increment referrer's count
        const newCount = (referrer.referral_count || 0) + 1;
        await window.supabaseClient
            .from('profiles')
            .update({ referral_count: newCount })
            .eq('id', referrer.id);

        // Check and grant referral rewards
        await checkReferralRewards(referrer.id, newCount);

        localStorage.removeItem('cj_referral_code');
        if (typeof gtag === 'function') {
            gtag('event', 'referral_complete', { referral_code: refCode, referrer_id: referrer.id });
        }
    } catch (e) { console.warn('Referral apply:', e); }
}

// Check and grant referral rewards at milestones (3, 5, 10)
async function checkReferralRewards(userId, count) {
    if (!window.supabaseClient) return;
    try {
        // 3 referidos → Badge "Community Builder"
        if (count === 3) {
            await window.supabaseClient
                .from('badges')
                .upsert({ user_id: userId, badge_id: 'referral_community_builder', unlocked_at: new Date().toISOString() }, { onConflict: 'user_id,badge_id' })
                .then(() => {});
            showToast('🤝 Badge desbloqueado: Community Builder! (3 referidos)', 'success');
        }
        // 5 referidos → 1 mes Premium gratis
        if (count === 5) {
            await window.supabaseClient
                .from('badges')
                .upsert({ user_id: userId, badge_id: 'referral_premium_reward', unlocked_at: new Date().toISOString() }, { onConflict: 'user_id,badge_id' })
                .then(() => {});
            // Grant 1 month premium — solo si no es ya premium de pago
            const { data: existingSub } = await window.supabaseClient
                .from('subscriptions')
                .select('status')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();
            if (!existingSub) {
                const now = new Date();
                const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                await window.supabaseClient
                    .from('profiles')
                    .update({ es_premium: true, is_premium: true, premium_until: expires.toISOString() })
                    .eq('id', userId);
                showToast('⭐ 1 mes Premium GRATIS desbloqueado! (5 referidos)', 'success');
            } else {
                showToast('⭐ Badge desbloqueado: Super Recruiter! (5 referidos)', 'success');
            }
        }
        // 10 referidos → Badge "Ambassador"
        if (count === 10) {
            await window.supabaseClient
                .from('badges')
                .upsert({ user_id: userId, badge_id: 'referral_ambassador', unlocked_at: new Date().toISOString() }, { onConflict: 'user_id,badge_id' })
                .then(() => {});
            showToast('🏆 Badge desbloqueado: Ambassador! (10 referidos)', 'success');
        }
    } catch (e) { console.warn('Referral rewards:', e); }
}

// Ensure current user has a referral code
async function ensureReferralCode() {
    if (!currentUser || !window.supabaseClient) return;
    if (currentUser.referral_code) return currentUser.referral_code;
    const code = generateReferralCode();
    try {
        const { error } = await window.supabaseClient
            .from('profiles')
            .update({ referral_code: code })
            .eq('id', currentUser.id);
        if (!error) {
            currentUser.referral_code = code;
            return code;
        }
        // If collision, try once more
        const code2 = generateReferralCode();
        const { error: e2 } = await window.supabaseClient
            .from('profiles')
            .update({ referral_code: code2 })
            .eq('id', currentUser.id);
        if (!e2) { currentUser.referral_code = code2; return code2; }
    } catch (e) { console.warn('Referral code gen:', e); }
    return null;
}

// Show referral section in profile modal
async function loadReferralUI() {
    const section = document.getElementById('referral-section');
    if (!section || !currentUser) { if (section) section.classList.add('hidden'); return; }
    section.classList.remove('hidden');

    const code = await ensureReferralCode();
    const link = code ? `https://www.correrjuntos.com?ref=${code}` : '';
    const linkInput = document.getElementById('referral-link-input');
    if (linkInput) linkInput.value = link;

    const countEl = document.getElementById('referral-count');
    const count = currentUser.referral_count || 0;
    if (countEl) countEl.textContent = count;

    // Update progress bar
    const progressBar = document.getElementById('referral-progress-bar');
    if (progressBar) progressBar.style.width = Math.min(count / 10 * 100, 100) + '%';

    // Update reward cards based on progress
    updateRewardCard(3, count >= 3);
    updateRewardCard(5, count >= 5);
    updateRewardCard(10, count >= 10);

    // Dynamic referral text
    const dynText = document.getElementById('referral-dynamic-text');
    if (dynText) {
        const faltan = Math.max(5 - count, 0);
        if (faltan > 0) {
            dynText.textContent = `Te faltan ${faltan} amigo${faltan === 1 ? '' : 's'} para ganar 1 mes Premium gratis`;
            dynText.classList.remove('hidden');
        } else {
            dynText.classList.add('hidden');
        }
    }

    // Also update the main banner
    updateReferralBanner(count);

    // i18n
    const t = I18N[currentLang] || I18N.es;
    setText('referral-title', t.inviteFriendsTitle);
    setText('referral-subtitle', t.inviteFriendsSubtitle);
    setText('referral-link-label', t.yourReferralLink);
    setText('referral-copy-btn', t.copyLink);
    setText('referral-count-label', t.friendsInvited);
    setText('reward-3-text', t.referralReward3);
    setText('reward-5-text', t.referralReward5);
    setText('reward-10-text', t.referralReward10);
    // Banner i18n
    setText('banner-referral-title', t.bannerReferralTitle);
    setText('banner-referral-desc', t.bannerReferralDesc);
    setText('banner-referral-btn', t.bannerReferralBtn);
}

function updateRewardCard(milestone, achieved) {
    const icon = document.getElementById(`reward-${milestone}-icon`);
    const card = document.getElementById(`reward-${milestone}-card`);
    if (icon) {
        if (achieved) {
            icon.className = 'w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-black bg-orange-500 text-white';
        } else {
            icon.className = 'w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-black bg-slate-700 text-gray-500';
        }
    }
    if (card) {
        if (achieved) {
            card.style.borderColor = 'rgba(249,115,22,0.5)';
            card.style.background = 'rgba(249,115,22,0.1)';
        } else {
            card.style.borderColor = 'rgba(100,116,139,0.3)';
            card.style.background = 'rgba(51,65,85,0.3)';
        }
    }
}

// Referral banner in main view
function updateReferralBanner(count) {
    const banner = document.getElementById('referral-banner');
    if (!banner || !currentUser) return;
    // Only show referral banner if user has attended >= 1 quedada
    if (userStats.quedadas < 1) { banner.classList.add('hidden'); return; }
    // Show banner if user hasn't dismissed it and has < 10 referrals
    const dismissed = localStorage.getItem('cj_referral_banner_dismissed');
    if (dismissed && count < 10) { banner.classList.add('hidden'); return; }
    if (count >= 10) { banner.classList.add('hidden'); return; } // Already ambassador
    banner.classList.remove('hidden');
    const progress = document.getElementById('banner-referral-progress');
    const countEl = document.getElementById('banner-referral-count');
    if (progress) progress.style.width = Math.min(count / 10 * 100, 100) + '%';
    if (countEl) countEl.textContent = count + '/10';
}

function dismissReferralBanner() {
    localStorage.setItem('cj_referral_banner_dismissed', '1');
    const banner = document.getElementById('referral-banner');
    if (banner) banner.classList.add('hidden');
}

function openProfileAndScrollToReferral() {
    // Open profile modal then scroll to referral section
    const profileBtn = document.getElementById('btnProfileTop');
    if (profileBtn) profileBtn.click();
    setTimeout(() => {
        const section = document.getElementById('referral-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function copyReferralLink() {
    const input = document.getElementById('referral-link-input');
    if (!input || !input.value) return;
    navigator.clipboard.writeText(input.value).then(() => {
        const t = I18N[currentLang] || I18N.es;
        showToast(t.linkCopied || 'Enlace copiado', 'success');
        if (typeof gtag === 'function') gtag('event', 'referral_copy', { referral_code: currentUser?.referral_code });
    }).catch(() => {
        input.select();
        document.execCommand('copy');
        showToast('Enlace copiado', 'success');
    });
}

function shareReferralWhatsApp() {
    const t = I18N[currentLang] || I18N.es;
    const link = document.getElementById('referral-link-input')?.value || '';
    const text = `${t.referralInviteText || 'Únete a CorrerJuntos y corramos juntos! Usa mi enlace:'}\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    if (typeof gtag === 'function') gtag('event', 'referral_share', { method: 'whatsapp', referral_code: currentUser?.referral_code });
}

async function shareReferralNative() {
    const t = I18N[currentLang] || I18N.es;
    const link = document.getElementById('referral-link-input')?.value || '';
    const text = t.referralInviteText || 'Únete a CorrerJuntos y corramos juntos! Usa mi enlace:';
    if (navigator.share) {
        try { await navigator.share({ title: 'CorrerJuntos', text, url: link }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    // Fallback: copy
    copyReferralLink();
}

// ========== SHAREABLE STATS CARD ==========

function openStatsCard() {
    if (!currentUser) { showToast('Inicia sesion para ver tus stats', 'error'); return; }

    // Fill stats card data
    const nameEl = document.getElementById('sc-name');
    const cityEl = document.getElementById('sc-city');
    const pointsEl = document.getElementById('sc-points');
    const levelEl = document.getElementById('sc-level');
    const createdEl = document.getElementById('sc-created');
    const attendedEl = document.getElementById('sc-attended');
    const badgesEl = document.getElementById('sc-badges');

    if (nameEl) nameEl.textContent = currentUser.nombreCompleto || currentUser.nombre || 'Runner';
    if (cityEl) cityEl.textContent = currentUser.ciudad || '';

    // Read current gamification data from the UI
    const pts = document.getElementById('gamification-points')?.textContent || '0';
    const created = document.getElementById('gamification-created')?.textContent || '0';
    const attended = document.getElementById('gamification-attended')?.textContent || '0';
    const level = document.getElementById('gamification-level')?.textContent || 'Novato';
    const badgeCount = document.querySelectorAll('#gamification-badges .badge-earned, #gamification-badges [class*="bg-orange"]').length || 0;

    if (pointsEl) pointsEl.textContent = pts;
    if (levelEl) levelEl.textContent = level;
    if (createdEl) createdEl.textContent = created;
    if (attendedEl) attendedEl.textContent = attended;
    if (badgesEl) badgesEl.textContent = badgeCount;

    openModal('modal-stats-card');
    if (typeof gtag === 'function') gtag('event', 'stats_card_open');
}

async function downloadStatsCard() {
    await ensureHtml2Canvas();
    const card = document.getElementById('stats-card-preview');
    if (!card) return;
    try {
        const canvas = await html2canvas(card, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            logging: false
        });
        const link = document.createElement('a');
        link.download = `correrjuntos-stats-${currentUser?.nombre || 'runner'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Imagen descargada', 'success');
        if (typeof gtag === 'function') gtag('event', 'stats_card_download');
    } catch (e) {
        console.warn('Stats card download error:', e);
        showToast('Error al generar imagen', 'error');
    }
}

async function shareStatsCard() {
    await ensureHtml2Canvas();
    const card = document.getElementById('stats-card-preview');
    if (!card) return;
    try {
        const canvas = await html2canvas(card, { backgroundColor: null, scale: 2, useCORS: true, logging: false });
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        const file = new File([blob], 'correrjuntos-stats.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Mis stats en CorrerJuntos',
                text: 'Mira mis stats en @correrjuntosapp',
                files: [file]
            });
        } else {
            // Fallback: download
            downloadStatsCard();
        }
        if (typeof gtag === 'function') gtag('event', 'stats_card_share');
    } catch (e) {
        if (e.name !== 'AbortError') downloadStatsCard();
    }
}

// ========== QR CODE GENERATION ==========
// Minimal QR code generator using Canvas API + qr-creator-like algo
// We use a CDN-loaded library for reliable QR generation
let qrLibLoaded = false;
function loadQRLib() {
    return new Promise((resolve) => {
        if (qrLibLoaded || window.QRCode) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
        s.integrity = 'sha384-HGmnkDZJy7mRkoARekrrj0VjEFSh9a0Z8qxGri/kTTAJkgR8hqD1lHsYSh3JdzRi';
        s.crossOrigin = 'anonymous';
        s.onload = () => { qrLibLoaded = true; resolve(); };
        s.onerror = () => resolve(); // fail silently
        document.head.appendChild(s);
    });
}

let currentQRQuedadaId = null;

async function showQuedadaQR() {
    const detailTitle = document.getElementById('detail-titulo')?.textContent || '';
    const detailCiudad = document.getElementById('detail-ciudad')?.textContent || '';

    // Find the quedada from the detail modal
    const q = quedadas.find(x => x.titulo === detailTitle && x.ciudad === detailCiudad);
    if (!q) { showToast('No se encontro la quedada', 'error'); return; }

    currentQRQuedadaId = q.id;
    document.getElementById('qr-quedada-title').textContent = q.titulo;
    document.getElementById('qr-quedada-info').textContent = `${q.ciudad} - ${formatDate(q.fecha)}`;

    await loadQRLib();
    const canvas = document.getElementById('qr-canvas');
    const url = `https://www.correrjuntos.com?utm_source=qr&utm_medium=offline&utm_campaign=${encodeURIComponent(q.ciudad || 'general')}`;

    if (window.QRCode) {
        try {
            await QRCode.toCanvas(canvas, url, {
                width: 200,
                margin: 0,
                color: { dark: '#0b1220', light: '#ffffff' }
            });
        } catch(e) {
            console.warn('QR error:', e);
            // Fallback: show link
            canvas.style.display = 'none';
        }
    }

    openModal('modal-qr');
    if (typeof gtag === 'function') gtag('event', 'qr_code_view', { quedada_id: q.id });
}

function downloadQR() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    const title = document.getElementById('qr-quedada-title')?.textContent || 'quedada';
    link.download = `correrjuntos-qr-${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('QR descargado', 'success');
    if (typeof gtag === 'function') gtag('event', 'qr_code_download');
}

// ========== TOGGLE MAPA (Minimizar/Expandir) ==========
// mapState → via AppState shim

async function requestAccountDeletion(){
  if(!currentUser){ showToast('Debes iniciar sesión','error'); return; }
  const confirmWord = currentLang === 'en' ? 'DELETE' : 'ELIMINAR';
  const txt = (document.getElementById('delete-confirm-text')?.value || '').trim().toUpperCase();
  if(txt !== confirmWord){ showToast(currentLang === 'en' ? 'Type DELETE to confirm' : 'Escribe ELIMINAR para confirmar','error'); return; }

  const btn = document.getElementById('btn-delete-account');
  const prev = btn ? btn.textContent : '';
  if(btn){ btn.disabled=true; btn.textContent=currentLang === 'en' ? 'Deleting...' : 'Eliminando...'; }

  const sb = await getSupabaseClientOrToast(12000, true);
  if(!sb){ if(btn){ btn.disabled=false; btn.textContent=prev; } return; }

  var errors = [];

  try{
    // 1) registrar solicitud de eliminación (audit trail)
    try{
      await sb.from('account_deletion_requests').insert([{ user_id: currentUser.id, email: currentUser.email }]);
    }catch(e){ console.warn('[account-deletion] request log failed:', e.message); }

    // 2) limpiar participaciones del usuario
    try{
      var { error: partErr } = await sb.from('participantes').delete().eq('user_id', currentUser.id);
      if(partErr) errors.push('participantes: ' + partErr.message);
    }catch(e){ errors.push('participantes: ' + e.message); }

    // 3) Soft-delete quedadas creadas: desasociar creador en vez de hard-delete
    //    Así otros participantes conservan su historial
    try{
      var { error: quedErr } = await sb.from('quedadas').update({ creador_id: null, descripcion: '[Cuenta eliminada]' }).eq('creador_id', currentUser.id);
      if(quedErr){
        // Fallback: si UPDATE falla (p.ej. NOT NULL constraint), intentar delete
        console.warn('[account-deletion] soft-delete quedadas failed, trying hard-delete:', quedErr.message);
        var { error: quedDelErr } = await sb.from('quedadas').delete().eq('creador_id', currentUser.id);
        if(quedDelErr) errors.push('quedadas: ' + quedDelErr.message);
      }
    }catch(e){ errors.push('quedadas: ' + e.message); }

    // 4) Eliminar perfil público
    try{
      var { error: profErr } = await sb.from('profiles').delete().eq('id', currentUser.id);
      if(profErr) errors.push('profiles: ' + profErr.message);
    }catch(e){ errors.push('profiles: ' + e.message); }

    // 5) Cerrar sesión
    try{ await sb.auth.signOut(); }catch(e){ console.warn('[account-deletion] signOut error:', e.message); }
    currentUser=null;

    closeModal('modal-delete-account');
    closeModal('modal-profile');
    showLanding();

    if(errors.length > 0){
      console.error('[account-deletion] Partial errors:', errors);
      showToast(currentLang === 'en' ? 'Account deleted with some warnings. Contact support if needed.' : 'Cuenta eliminada con algunas advertencias. Contacta soporte si es necesario.','warning', 6000);
    } else {
      showToast(currentLang === 'en' ? 'Account deleted successfully.' : 'Cuenta eliminada correctamente.','success');
    }
    setTimeout(()=>{ try{ openModal('modal-login'); }catch(e){ console.warn(e); } }, 300);
  }catch(e){
    console.error('[account-deletion] Critical error:', e);
    showToast((currentLang === 'en' ? 'Could not delete account: ' : 'No se pudo eliminar: ') + (e?.message||e), 'error');
  }finally{
    if(btn){ btn.disabled=false; btn.textContent=prev || (currentLang === 'en' ? 'Confirm deletion' : 'Confirmar eliminación'); }
  }
}
window.requestAccountDeletion = requestAccountDeletion;


// ====== Profile photo (lightweight, stored locally) ======
let profilePhotoTemp = null; // data URL (jpeg) prepared for saving


function setProfileAvatar(photoDataUrl, initials){
    const img = document.getElementById('profile-avatar-img');
    const init = document.getElementById('profile-avatar-initials');
    if(init) init.textContent = (initials || 'CJ');
    if(!img) return;
    if(photoDataUrl){
        img.src = photoDataUrl;
        img.alt = 'Foto de perfil del usuario';
        img.classList.remove('hidden');
        if(init) init.classList.add('hidden');
    } else {
        img.removeAttribute('src');
        img.classList.add('hidden');
        if(init) init.classList.remove('hidden');
    }
}

function resizeImageToDataUrl(file, size=256, quality=0.82){
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            try {
                const sw = img.naturalWidth;
                const sh = img.naturalHeight;
                const s = Math.min(sw, sh);
                const sx = Math.floor((sw - s) / 2);
                const sy = Math.floor((sh - s) / 2);

                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

                const out = canvas.toDataURL('image/jpeg', quality);
                URL.revokeObjectURL(url);
                resolve(out);
            } catch (e) {
                URL.revokeObjectURL(url);
                reject(e);
            }
        };
        img.onerror = (e) => {
            try { URL.revokeObjectURL(url); } catch(_) {}
            reject(e);
        };
        img.src = url;
    });
}

async function onProfilePhotoSelected(ev){
    const file = ev && ev.target && ev.target.files ? ev.target.files[0] : null;
    if(!file) return;

    // allow selecting the same file again later
    try { ev.target.value = ''; } catch(_) {}

    if(!file.type || !file.type.startsWith('image/')){
        showToast('Selecciona una imagen válida','error');
        return;
    }
    if(file.size > 5 * 1024 * 1024){
        showToast('Imagen demasiado grande (máx 5MB)','error');
        return;
    }

    try {
        const dataUrl = await resizeImageToDataUrl(file, 256, 0.82);
        profilePhotoTemp = dataUrl;
        const initials = ((currentUser?.nombre||'').charAt(0) + (currentUser?.apellidos||'').charAt(0)).toUpperCase();
        setProfileAvatar(profilePhotoTemp, initials || 'CJ');
        showToast('Foto lista. Pulsa Guardar cambios');
    } catch (e) {
        showToast('No se pudo procesar la imagen','error');
    }
}


function openProfile(){
    if(!currentUser){ showToast('Debes iniciar sesión','error'); openModal('modal-login'); return; }
    // Fill header
    const initials = ((currentUser.nombre||'').charAt(0)+(currentUser.apellidos||'').charAt(0)).toUpperCase();
    profilePhotoTemp = (currentUser.photo || '');
    setProfileAvatar(profilePhotoTemp, initials || 'CJ');
    const pn=document.getElementById('profile-name'); if(pn) pn.textContent = (currentUser.nombreCompleto || (currentUser.nombre+' '+(currentUser.apellidos||''))).trim();
    const pe=document.getElementById('profile-email'); if(pe) pe.textContent = currentUser.email || '';

    // Fill fields
    document.getElementById('profile-first').value = currentUser.nombre || '';
    document.getElementById('profile-last').value = currentUser.apellidos || '';
    document.getElementById('profile-country').value = currentUser.pais || (currentUser.ciudad && currentUser.ciudad.toLowerCase().includes('lisboa') ? 'Portugal' : 'España');
    document.getElementById('profile-city').value = currentUser.ciudad || '';
    document.getElementById('profile-level').value = currentUser.nivel || 'Intermedio';
    document.getElementById('profile-phone').value = currentUser.telefono || '';
    document.getElementById('profile-wa').checked = !!currentUser.whatsapp;
    document.getElementById('profile-social').value = currentUser.social || '';
    document.getElementById('profile-bio').value = currentUser.bio || '';

    // Cargar estado de verificación de nivel
    loadProfileVerificationStatus();

    // Cargar preferencias de notificaciones push
    loadAndDisplayNotificationPrefs();

    // Cargar conexión de Strava
    if (typeof loadStravaConnection === 'function') {
        loadStravaConnection();
    }

    // Plan badge
    const planBadge = document.getElementById('plan-badge-text');
    const planUpgrade = document.getElementById('plan-badge-upgrade');
    const isPrem = getEffectivePlan() === 'premium';
    if (planBadge) planBadge.textContent = isPrem ? 'Plan: Premium' : 'Plan: Básico';
    if (planBadge) {
        if (isPrem) { planBadge.className = 'text-xs px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold'; }
        else { planBadge.className = 'text-xs px-3 py-1 rounded-full bg-slate-700 text-gray-400 font-semibold'; }
    }
    if (planUpgrade) planUpgrade.classList.toggle('hidden', isPrem);

    openModal('modal-profile');
    loadGamificationStats();
    loadMisQuedadas();
    loadReferralUI();
    loadRecentActivity();
    loadAdvancedStats();
}

// ====== ONBOARDING: Completar perfil después de registro simplificado ======
let onboardSelectedLevel = '';


function selectOnboardLevel(level){
    onboardSelectedLevel = level;
    document.getElementById('onboard-nivel').value = level;
    // Visual feedback + aria-checked
    document.querySelectorAll('.onboard-level-btn').forEach(btn => {
        btn.classList.remove('border-orange-500', 'bg-orange-500/20');
        btn.classList.add('border-slate-700', 'bg-slate-800/50');
        btn.setAttribute('aria-checked', 'false');
    });
    var selectedBtn = event.target.closest('.onboard-level-btn');
    selectedBtn.classList.remove('border-slate-700', 'bg-slate-800/50');
    selectedBtn.classList.add('border-orange-500', 'bg-orange-500/20');
    selectedBtn.setAttribute('aria-checked', 'true');
}

async function searchOnboardUbicacion(query){
    const dropdown = document.getElementById('onboard-ubicacion-dropdown');
    if(!query || query.length < 2){ dropdown.classList.add('hidden'); return; }

    // Usar el mismo índice de ubicaciones que el registro
    const results = locationsIndex.filter(loc => {
        const searchTerm = query.toLowerCase();
        return loc.place.toLowerCase().includes(searchTerm) ||
               (loc.admin1 && loc.admin1.toLowerCase().includes(searchTerm));
    }).slice(0, 8);

    if(results.length === 0){ dropdown.classList.add('hidden'); return; }

    dropdown.innerHTML = results.map(loc => `
        <div class="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-0"
             onclick="selectOnboardUbicacion('${escapeInlineArg(loc.place)}', '${escapeInlineArg(loc.admin1 || '')}', '${escapeInlineArg(loc.country)}')">
            <div class="font-medium text-white">${escapeLocationText(loc.place)}</div>
            <div class="text-xs text-gray-400">${escapeLocationText(loc.admin1 || '')} - ${loc.country === 'ES' ? 'Espana' : 'Portugal'}</div>
        </div>
    `).join('');
    dropdown.classList.remove('hidden');
}

function selectOnboardUbicacion(place, admin1, country){
    document.getElementById('onboard-ubicacion').value = place;
    document.getElementById('onboard-ciudad').value = admin1 || place;
    document.getElementById('onboard-poblacion').value = place;
    document.getElementById('onboard-pais').value = country;
    document.getElementById('onboard-ubicacion-dropdown').classList.add('hidden');
}

async function detectarUbicacionGPS(){
    const btn = document.getElementById('btn-gps-ubicacion');
    const icon = document.getElementById('gps-icon');
    const spinner = document.getElementById('gps-spinner');

    if(!navigator.geolocation){
        showToast('Tu navegador no soporta GPS','error');
        return;
    }

    // Mostrar spinner
    icon.classList.add('hidden');
    spinner.classList.remove('hidden');
    btn.disabled = true;

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000
            });
        });

        const { latitude, longitude } = position.coords;

        // Reverse geocoding con Nominatim
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`);
        const data = await response.json();

        if(data && data.address){
            const addr = data.address;
            const place = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
            const admin1 = addr.state || addr.province || '';
            const country = addr.country_code?.toUpperCase() || 'ES';

            if(place){
                document.getElementById('onboard-ubicacion').value = place;
                document.getElementById('onboard-ciudad').value = admin1 || place;
                document.getElementById('onboard-poblacion').value = place;
                document.getElementById('onboard-pais').value = country;
                showToast('Ubicación detectada', 'success');
            } else {
                showToast('No se pudo determinar la ciudad','error');
            }
        } else {
            showToast('Error al obtener ubicación','error');
        }
    } catch(e) {
        console.warn('GPS error:', e);
        if(e.code === 1){
            showToast('Permiso de ubicación denegado','error');
        } else if(e.code === 2){
            showToast('Ubicación no disponible','error');
        } else {
            showToast('Error al obtener ubicación','error');
        }
    } finally {
        // Restaurar botón
        icon.classList.remove('hidden');
        spinner.classList.add('hidden');
        btn.disabled = false;
    }
}

async function saveOnboardProfile(){
    const nombre = (document.getElementById('onboard-nombre')?.value || '').trim();
    const ciudad = (document.getElementById('onboard-ciudad')?.value || '').trim();
    const poblacion = (document.getElementById('onboard-poblacion')?.value || '').trim();
    const pais = (document.getElementById('onboard-pais')?.value || '').trim();
    const nivel = onboardSelectedLevel;

    if(!nombre){ showToast('¿Cómo te llamas?','error'); return; }
    if(!poblacion && !ciudad){ showToast('Indica tu ubicación para ver quedadas cerca','error'); return; }
    if(!nivel){ showToast('Selecciona tu nivel de running','error'); return; }

    const sb = window.supabaseClient;
    if(!sb || !currentUser){ showToast('Error de conexión','error'); return; }

    try {
        await sb.from('profiles').update({
            nombre,
            ciudad: poblacion || ciudad || null,
            pais: pais || 'España',
            nivel: nivel || null
        }).eq('id', currentUser.id);

        // Actualizar usuario local
        currentUser.nombre = nombre;
        currentUser.ciudad = poblacion || ciudad;
        currentUser.pais = pais || 'España';
        currentUser.nivel = nivel;
        document.getElementById('user-name').textContent = nombre;

        showToast('¡Perfil actualizado!','success');

        // Quitar restricción y cerrar modal
        window.__cjProfileCompletionRequired = false;
        closeModal('modal-complete-profile');

        // Mostrar modal de notificaciones después
        setTimeout(() => openModal('modal-welcome-notif'), 500);
    } catch(e) {
        CJ.handleApiError(e, 'saveOnboardProfile');
    }
}


async function saveProfile(){
    if(!currentUser) return;
    const nombre = document.getElementById('profile-first').value.trim();
    const apellidos = document.getElementById('profile-last').value.trim();
    const pais = document.getElementById('profile-country').value;
    const ciudad = document.getElementById('profile-city').value.trim();
    const nivel = document.getElementById('profile-level').value;
    const telefono = document.getElementById('profile-phone').value.trim();
    const whatsapp = document.getElementById('profile-wa').checked;
    const social = document.getElementById('profile-social').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();

    // Notificaciones
    const notifWhatsapp = document.getElementById('profile-notif-whatsapp')?.checked || false;
    const notifEmail = document.getElementById('profile-notif-email')?.checked || false;
    const notifPush = document.getElementById('profile-notif-push')?.checked || false;

    // Alertas de nuevas quedadas (Premium)
    const alertNewQuedadas = document.getElementById('alert-toggle')?.checked || false;
    const alertRadiusEl = document.getElementById('alert-radius-value');
    const alertRadiusKm = alertRadiusEl ? parseInt(alertRadiusEl.value, 10) || 25 : 25;

    if(!nombre || !apellidos || !ciudad){
        showToast('Completa nombre, apellidos y ciudad','error');
        return;
    }
    // Input length validation
    if(!CJ.validate.maxLength(nombre, 80)){ showToast('Nombre demasiado largo (máx. 80 caracteres)','error'); return; }
    if(!CJ.validate.maxLength(apellidos, 80)){ showToast('Apellidos demasiado largo (máx. 80 caracteres)','error'); return; }
    if(!CJ.validate.maxLength(ciudad, 100)){ showToast('Ciudad demasiado larga (máx. 100 caracteres)','error'); return; }
    if(!CJ.validate.maxLength(bio, 500)){ showToast('Bio demasiado larga (máx. 500 caracteres)','error'); return; }
    if(!CJ.validate.maxLength(social, 200)){ showToast('Enlace social demasiado largo (máx. 200 caracteres)','error'); return; }
    if(social && !CJ.validate.url(social) && !social.startsWith('@')){ showToast('Enlace social no válido','error'); return; }

    currentUser.nombre = CJ.validate.truncate(nombre, 80);
    currentUser.apellidos = CJ.validate.truncate(apellidos, 80);
    currentUser.nombreCompleto = `${nombre} ${apellidos}`;
    currentUser.pais = pais;
    currentUser.ciudad = ciudad;
    currentUser.nivel = nivel;
    currentUser.telefono = telefono;
    currentUser.whatsapp = whatsapp && !!telefono;
    currentUser.social = social;
    currentUser.bio = bio;
    currentUser.notif_whatsapp = notifWhatsapp;
    currentUser.notif_email = notifEmail;
    currentUser.notif_push = notifPush;

    // Persist profile photo (if any)
    if(profilePhotoTemp !== null){
        currentUser.photo = profilePhotoTemp;
    }

    // Persistir en Supabase (public.profiles)
    if(window.supabaseClient){
        const { error } = await window.supabaseClient
          .from('profiles')
          .upsert({
              id: currentUser.id,
              nombre: currentUser.nombre,
              apellidos: currentUser.apellidos,
              ciudad: currentUser.ciudad,
              nivel: currentUser.nivel,
              telefono: currentUser.telefono,
              whatsapp: !!currentUser.whatsapp,
              bio: currentUser.bio,
              instagram: currentUser.social,
              photo_url: currentUser.photo || null,
              notif_whatsapp: notifWhatsapp,
              notif_email: notifEmail,
              notif_push: notifPush,
              alert_new_quedadas: alertNewQuedadas,
              alert_radius_km: alertRadiusKm
          });
        if(error){
            CJ.handleApiError(error, 'saveProfile');
            return;
        }
    }

    updateUserUI();
    closeModal('modal-profile');
    showToast('Perfil actualizado');
}



// ===================== SUPABASE READY HELPER =====================
// Espera a que el bootstrap de Supabase termine. Evita falsos "Supabase no inicializado" por carga lenta.

    // ─── Expose to window ────────────────────────────────
    window.userStats = userStats;
    window.loadUserStats = loadUserStats;
    window.updateStatsUI = updateStatsUI;
    window.loadPersonalHeatmap = loadPersonalHeatmap;
    window.openVerifyLevelModal = openVerifyLevelModal;
    window.onVerifyMethodChange = onVerifyMethodChange;
    window.onVerifyFileSelected = onVerifyFileSelected;
    window.loadVerificationStatus = loadVerificationStatus;
    window.submitVerification = submitVerification;
    window.loadProfileVerificationStatus = loadProfileVerificationStatus;
    window.generateReferralCode = generateReferralCode;
    window.detectReferralParam = detectReferralParam;
    window.applyReferralAfterRegistration = applyReferralAfterRegistration;
    window.checkReferralRewards = checkReferralRewards;
    window.ensureReferralCode = ensureReferralCode;
    window.loadReferralUI = loadReferralUI;
    window.updateRewardCard = updateRewardCard;
    window.updateReferralBanner = updateReferralBanner;
    window.dismissReferralBanner = dismissReferralBanner;
    window.openProfileAndScrollToReferral = openProfileAndScrollToReferral;
    window.copyReferralLink = copyReferralLink;
    window.shareReferralWhatsApp = shareReferralWhatsApp;
    window.shareReferralNative = shareReferralNative;
    window.openStatsCard = openStatsCard;
    window.downloadStatsCard = downloadStatsCard;
    window.shareStatsCard = shareStatsCard;
    window.loadQRLib = loadQRLib;
    window.showQuedadaQR = showQuedadaQR;
    window.downloadQR = downloadQR;
    window.requestAccountDeletion = requestAccountDeletion;
    window.setProfileAvatar = setProfileAvatar;
    window.resizeImageToDataUrl = resizeImageToDataUrl;
    window.onProfilePhotoSelected = onProfilePhotoSelected;
    window.openProfile = openProfile;
    window.selectOnboardLevel = selectOnboardLevel;
    window.searchOnboardUbicacion = searchOnboardUbicacion;
    window.selectOnboardUbicacion = selectOnboardUbicacion;
    window.detectarUbicacionGPS = detectarUbicacionGPS;
    window.saveOnboardProfile = saveOnboardProfile;
    window.saveProfile = saveProfile;
})();
