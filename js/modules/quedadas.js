// ========================= QUEDADAS MODULE =========================
// Quedada CRUD, attendance, comments, sharing, weather, city views.
// Loaded AFTER state.js, error-handler.js, validation.js, ui.js, map-core.js, profile.js.
(function() {
    'use strict';

let currentShareQuedadaId = null;
let floatingCardQuedada = null;

async function loadQuedadaComments(quedadaId) {
    const list = document.getElementById('detail-comments-list');
    const countEl = document.getElementById('detail-comments-count');
    const inputWrap = document.getElementById('detail-comment-input-wrap');
    if (!list) return;

    const t = I18N[currentLang] || I18N.es;

    // Always render input regardless of query result
    if (inputWrap) {
        if (!currentUser) {
            inputWrap.innerHTML = '';
        } else if (isUserPremium) {
            inputWrap.innerHTML = `
                <div class="flex gap-2 mt-2">
                    <input id="comment-input" type="text" maxlength="200" placeholder="${t.premiumCommentPlaceholder || 'Escribe un comentario...'}" class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-orange-500 outline-none">
                    <button onclick="postComment('${quedadaId}')" class="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition">${t.premiumCommentSend || 'Enviar'}</button>
                </div>`;
        } else {
            inputWrap.innerHTML = `
                <div class="text-center py-2">
                    <button onclick="openPremiumSales()" class="text-xs text-yellow-400 hover:text-yellow-300 transition">${t.premiumCommentCta || '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Premium para comentar'}</button>
                </div>`;
        }
    }

    try {
        const sb = await getSupabaseClientOrToast(5000, false);
        if (!sb) { list.innerHTML = ''; return; }

        const { data: comments, error } = await sb
            .from('quedada_comments')
            .select('id, texto, created_at, user_id')
            .eq('quedada_id', quedadaId)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) {
            console.warn('Comments query error:', error.message);
            list.innerHTML = `<div class="text-gray-500 text-xs text-center py-2">${t.premiumNoComments || 'Sin comentarios aún'}</div>`;
            return;
        }

        if (countEl) countEl.textContent = comments && comments.length ? `(${comments.length})` : '';

        if (!comments || !comments.length) {
            list.innerHTML = `<div class="text-gray-500 text-xs text-center py-2">${t.premiumNoComments || 'Sin comentarios aún'}</div>`;
        } else {
            // Fetch profiles for comment authors
            const authorIds = [...new Set(comments.map(c => c.user_id))];
            const { data: profiles } = await sb
                .from('profiles')
                .select('id, nombre, photo_url')
                .in('id', authorIds);
            const profileMap = {};
            if (profiles) profiles.forEach(p => { profileMap[p.id] = p; });

            list.innerHTML = comments.map(c => {
                const prof = profileMap[c.user_id];
                const initial = (prof && prof.nombre ? prof.nombre.charAt(0) : 'R').toUpperCase();
                const nombre = prof && prof.nombre ? escapeHtml(prof.nombre) : 'Runner';
                return `
                <div class="flex gap-2 p-2 rounded-lg bg-slate-700/30">
                    <div class="w-6 h-6 rounded-full bg-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">${initial}</div>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs"><span class="font-bold text-white">${nombre}</span> <span class="text-gray-500">${timeAgo(c.created_at)}</span></div>
                        <div class="text-xs text-gray-300 mt-0.5">${escapeHtml(c.texto)}</div>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (e) {
        console.warn('Comments error:', e);
        list.innerHTML = `<div class="text-gray-500 text-xs text-center py-2">${t.premiumNoComments || 'Sin comentarios aún'}</div>`;
    }
}

async function postComment(quedadaId) {
    const input = document.getElementById('comment-input');
    const texto = input && input.value ? input.value.trim() : '';
    if (!texto || !currentUser) return;

    try {
        const sb = await getSupabaseClientOrToast(5000, false);
        if (!sb) return;

        const { error } = await sb.from('quedada_comments').insert({
            quedada_id: quedadaId,
            user_id: currentUser.id,
            texto: texto
        });

        if (error) {
            showToast('Error al enviar comentario', 'error');
            return;
        }

        input.value = '';
        loadQuedadaComments(quedadaId);
    } catch (e) {
        console.warn('Post comment error:', e);
    }
}


function openShareModal() {
    const detailModal = document.getElementById('modal-quedada-detail');
    const titulo = document.getElementById('detail-titulo')?.textContent;
    const q = quedadas.find(x => x.titulo === titulo);
    if (q) {
        currentShareQuedadaId = q.id;
        document.getElementById('share-quedada-id').value = q.id;
    }
    openModal('modal-share');
}

function getShareText(quedada) {
    const q = quedada || quedadas.find(x => x.id === currentShareQuedadaId);
    if (!q) return { title: 'CorrerJuntos', text: 'Encuentra runners cerca de ti', url: 'https://www.correrjuntos.com?utm_source=share&utm_medium=social' };
    const dateStr = typeof formatDate === 'function' ? formatDate(q.fecha) : q.fecha;
    const timeStr = typeof formatHora === 'function' ? formatHora(q.hora) : q.hora;
    return {
        title: q.titulo,
        text: `🏃 ${q.titulo}\n📍 ${q.ciudad}\n📅 ${dateStr} a las ${timeStr}\n📏 ${q.distancia || ''}\n\n¡Únete a correr conmigo en @correrjuntosapp!`,
        url: `https://www.correrjuntos.com?utm_source=share&utm_medium=quedada&utm_campaign=${encodeURIComponent(q.ciudad || 'general')}`
    };
}

// Universal share function - tries Web Share API first, falls back to modal
async function smartShare(quedada) {
    const shareData = getShareText(quedada);
    // Track share event in GA4
    if (typeof gtag === 'function') {
        gtag('event', 'share', { method: 'smart_share', content_type: 'quedada', item_id: quedada?.id || 'general' });
    }
    // Try native Web Share API (mobile)
    if (navigator.share) {
        try {
            await navigator.share({ title: shareData.title, text: shareData.text, url: shareData.url });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return; // User cancelled
        }
    }
    // Fallback: open share modal
    if (quedada) {
        currentShareQuedadaId = quedada.id;
        const el = document.getElementById('share-quedada-id');
        if (el) el.value = quedada.id;
    }
    openModal('modal-share');
}

// Share CorrerJuntos (generic, for landing page)
async function shareCorrerJuntos() {
    const t = I18N[currentLang] || I18N.es;
    const shareData = {
        title: 'CorrerJuntos',
        text: t.shareGenericText || 'Encuentra runners cerca de ti y nunca vuelvas a correr solo. Únete gratis a @correrjuntosapp',
        url: 'https://www.correrjuntos.com?utm_source=share&utm_medium=organic&utm_campaign=landing'
    };
    if (typeof gtag === 'function') {
        gtag('event', 'share', { method: 'generic_share', content_type: 'landing' });
    }
    if (navigator.share) {
        try { await navigator.share(shareData); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    // Fallback: copy to clipboard
    try {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        showToast(t.shareCopiedMsg || 'Enlace copiado al portapapeles', 'success');
    } catch(e) {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`, '_blank');
    }
}

function shareWhatsApp() {
    const { text, url } = getShareText();
    const fullText = `${text}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'whatsapp' });
    closeModal('modal-share');
}

function shareTwitter() {
    const { text, url } = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    if (typeof gtag === 'function') gtag('event', 'share', { method: 'twitter' });
    closeModal('modal-share');
}

function copyShareLink() {
    const { text, url } = getShareText();
    navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
        const t = I18N[currentLang] || I18N.es;
        showToast(t.shareCopiedMsg || 'Enlace copiado', 'success');
        if (typeof gtag === 'function') gtag('event', 'share', { method: 'copy_link' });
        closeModal('modal-share');
    });
}

// ========== REFERRAL SYSTEM ==========

function isQuedadaLive(q) {
    const now = new Date();
    const qDateTime = new Date(`${q.fecha}T${q.hora}`);
    const diffMs = qDateTime - now;
    const diffMins = diffMs / (1000 * 60);
    return diffMins > 0 && diffMins <= 60; // Empieza en menos de 1 hora
}

// ========== WEATHER API ==========
async function getWeather(lat, lng, fecha) {
    try {
        const targetDate = new Date(fecha);
        const today = new Date();
        const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

        // Solo podemos predecir hasta 7 días
        if (diffDays > 7 || diffDays < 0) return null;

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
        const data = await res.json();

        if (!data.daily) return null;

        const dayIndex = data.daily.time.findIndex(d => d === fecha);
        if (dayIndex === -1) return null;

        const code = data.daily.weathercode[dayIndex];
        const tempMax = Math.round(data.daily.temperature_2m_max[dayIndex]);
        const tempMin = Math.round(data.daily.temperature_2m_min[dayIndex]);
        const rain = data.daily.precipitation_probability_max[dayIndex];

        // Weather codes estandarizados
        // 0: Despejado, 1-3: Parcialmente nublado, 45-48: Niebla
        // 51-57: Llovizna, 61-67: Lluvia, 71-77: Nieve, 80-82: Chubascos, 95-99: Tormenta
        let condition = 'good';
        let icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>';
        let desc = 'Despejado';

        if (code === 0) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'; desc = 'Despejado'; condition = 'good';
        } else if (code >= 1 && code <= 3) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>'; desc = 'Parcial nublado'; condition = 'good';
        } else if (code >= 45 && code <= 48) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>'; desc = 'Niebla'; condition = 'warn';
        } else if (code >= 51 && code <= 57) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zM16 16l-2 4m-1-6l-2 4m-1-6l-2 4"/></svg>'; desc = 'Llovizna'; condition = 'warn';
        } else if (code >= 61 && code <= 67) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zM16 16l-2 4m-1-6l-2 4m-1-6l-2 4"/></svg>'; desc = 'Lluvia'; condition = rain > 60 ? 'bad' : 'warn';
        } else if (code >= 71 && code <= 77) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zM8 19v.01M12 17v.01M16 19v.01M10 21v.01M14 21v.01"/></svg>'; desc = 'Nieve'; condition = 'bad';
        } else if (code >= 80 && code <= 82) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zM16 16l-2 4m-1-6l-2 4m-1-6l-2 4"/></svg>'; desc = 'Chubascos'; condition = rain > 50 ? 'bad' : 'warn';
        } else if (code >= 95) {
            icon = '<svg style="width:24px;height:24px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zM13 10V3L4 14h7v7l9-11h-7z"/></svg>'; desc = 'Tormenta'; condition = 'bad';
        }

        // Texto estandarizado: siempre temperatura + lluvia si > 20%
        let text = `${tempMax}°`;
        if (rain > 20) {
            text += ` · ${rain}% <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a8 8 0 01-8-8c0-4.42 8-12 8-12s8 7.58 8 12a8 8 0 01-8 8z"/></svg>`;
        }

        return { condition, icon, text, desc, temp: tempMax, tempMin, rain };
    } catch (e) {
        console.warn('Weather error:', e);
        return null;
    }
}

// ========== WEATHER IN DETAIL MODAL ==========
async function loadDetailWeather(lat, lng, fecha) {
    const section = document.getElementById('detail-weather-section');
    const content = document.getElementById('detail-weather-content');
    if (!section || !content) return;

    const weather = await getWeather(lat, lng, fecha);
    if (!weather) { section.classList.add('hidden'); return; }

    const t = I18N[currentLang] || I18N.es;
    const tip = getRunningTip(weather);
    const borderClass = weather.condition === 'bad' ? 'border-red-500/30 bg-red-500/10'
                      : weather.condition === 'warn' ? 'border-yellow-500/30 bg-yellow-500/10'
                      : 'border-green-500/30 bg-green-500/10';

    content.className = `flex items-center gap-3 px-3 py-2.5 rounded-xl border ${borderClass}`;
    content.innerHTML = `
        <span class="text-2xl">${weather.icon}</span>
        <div class="flex-1">
            <div class="text-sm font-bold text-white">${weather.desc} · ${weather.temp}°/${weather.tempMin}°</div>
            <div class="text-xs text-gray-400">${weather.rain > 20 ? `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a8 8 0 01-8-8c0-4.42 8-12 8-12s8 7.58 8 12a8 8 0 01-8 8z"/></svg> ${weather.rain}% ${t.weatherRain || 'lluvia'} · ` : ''}${tip}</div>
        </div>`;
    section.classList.remove('hidden');
}

function getRunningTip(weather) {
    const t = I18N[currentLang] || I18N.es;
    if (weather.condition === 'bad') return t.weatherTipBad || 'Lleva chubasquero 🌧️';
    if (weather.condition === 'warn') return t.weatherTipWarn || 'Podría llover, ve preparado';
    if (weather.temp > 30) return t.weatherTipHot || 'Hidrátate bien, hace calor 🥵';
    if (weather.temp < 8) return t.weatherTipCold || 'Abrígate, hace frío 🧥';
    return t.weatherTipGood || 'Día perfecto para correr 🏃';
}


function isQuedadaPasada(q) {
    if (!q || !q.fecha || !q.hora) return false;
    try {
        // Normalizar hora: quitar segundos si los tiene (18:00:00 -> 18:00)
        const horaNorm = q.hora.split(':').slice(0, 2).join(':');
        const fechaHora = new Date(`${q.fecha}T${horaNorm}:00`);
        if (isNaN(fechaHora.getTime())) return false;
        // 5 minutos de gracia después de la hora de inicio
        const finGracia = new Date(fechaHora.getTime() + 5 * 60 * 1000);
        return Date.now() > finGracia.getTime();
    } catch (e) { return false; }
}

function getUserName(id){
    if(currentUser && id===currentUser.id) return currentUser.nombre || 'Tú';
    return 'Runner';
}
var __cjPrevFocus = null;
var __cjFocusableSelector = 'a[href]:not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([type=hidden]):not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

async function viewOrganizerProfile(userId) {
    if (!userId) return;

    // Mostrar toast de carga
    showToast('Cargando perfil...', 'info');

    try {
        // Buscar el perfil del organizador
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            showToast('No se pudo cargar el perfil', 'error');
            return;
        }

        // Buscar reseñas del organizador
        const { data: reviews } = await supabaseClient
            .from('organizer_reviews')
            .select('*, reviewer:reviewer_id(nombre, photo_url)')
            .eq('organizer_id', userId)
            .order('created_at', { ascending: false })
            .limit(3);

        // Crear y mostrar modal de perfil del organizador
        showOrganizerModal(profile, reviews || []);

    } catch (err) {
        console.error('Error loading organizer profile:', err);
        showToast('Error al cargar el perfil', 'error');
    }
}

function showOrganizerModal(profile, reviews) {
    const existingModal = document.getElementById('modal-organizer-profile');
    if (existingModal) existingModal.remove();

    const nombre = profile.nombre || 'Organizador';
    const apellidos = profile.apellidos || '';
    const photo = profile.photo_url || '';
    const initials = ((nombre).charAt(0) + (apellidos).charAt(0)).toUpperCase() || 'R';
    const rating = profile.organizer_rating;
    const totalReviews = profile.total_reviews || 0;
    const totalOrganized = profile.total_organized || 0;
    const verified = profile.verification_badge || false;
    const nivel = profile.nivel || 'Sin nivel';
    const ciudad = profile.ciudad || '';

    // Generar badges
    let badgesHtml = '';
    if (verified) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">✓ Verificado</span>`;
    if (totalOrganized >= 20) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> Experto</span>`;
    else if (totalOrganized >= 10) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Veterano</span>`;
    else if (totalOrganized >= 5) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg> Activo</span>`;
    if (rating >= 4.5 && totalReviews >= 3) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> Muy valorado</span>`;

    // Generar HTML de reseñas
    let reviewsHtml = '';
    if (reviews.length > 0) {
        reviewsHtml = reviews.map(r => {
            const reviewerName = r.reviewer?.nombre || 'Anónimo';
            const reviewerPhoto = r.reviewer?.photo_url || '';
            const reviewerInitial = reviewerName.charAt(0).toUpperCase();
            const stars = '★'.repeat(Math.floor(r.rating)) + '☆'.repeat(5 - Math.floor(r.rating));
            return `
                <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div class="flex items-center gap-3 mb-2">
                        ${reviewerPhoto
                            ? `<img src="${escapeHtml(reviewerPhoto)}" class="w-8 h-8 rounded-full object-cover" alt="Foto de reseña" loading="lazy" />`
                            : `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-xs">${reviewerInitial}</div>`
                        }
                        <div class="flex-1">
                            <div class="text-sm font-bold text-white">${reviewerName}</div>
                            <div class="text-yellow-400 text-xs">${stars}</div>
                        </div>
                    </div>
                    ${r.comment ? `<p class="text-sm text-gray-400 italic">"${escapeHtml(r.comment)}"</p>` : ''}
                </div>
            `;
        }).join('');
    } else {
        reviewsHtml = '<p class="text-sm text-gray-500 text-center py-4">Aún no tiene reseñas</p>';
    }

    const modalHtml = `
        <div id="modal-organizer-profile" class="modal active" onclick="if(event.target===this)closeModal('modal-organizer-profile')">
            <div class="modal-content p-6 max-w-lg mx-4">
                <div class="flex justify-between items-start mb-6">
                    <div class="text-xl font-bold">Perfil del organizador</div>
                    <button onclick="closeModal('modal-organizer-profile')" class="text-gray-500 hover:text-white transition" aria-label="Cerrar">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <!-- Header del perfil -->
                <div class="flex items-center gap-4 mb-6">
                    ${photo
                        ? `<img src="${escapeHtml(photo)}" class="w-20 h-20 rounded-full object-cover border-4 border-orange-500/30" alt="Foto de perfil" loading="lazy" />`
                        : `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-2xl border-4 border-orange-500/30">${initials}</div>`
                    }
                    <div>
                        <h3 class="text-xl font-bold text-white">${nombre} ${apellidos}</h3>
                        ${ciudad ? `<p class="text-sm text-gray-400"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${ciudad}</p>` : ''}
                        <span class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${nivel === 'Principiante' ? 'bg-green-500/20 text-green-400' : nivel === 'Intermedio' ? 'bg-yellow-500/20 text-yellow-400' : nivel === 'Avanzado' ? 'bg-red-500/20 text-red-400' : nivel === 'Elite' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'}">${nivel}</span>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div class="text-2xl font-black text-orange-400">${totalOrganized}</div>
                        <div class="text-xs text-gray-500">Quedadas</div>
                    </div>
                    <div class="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div class="text-2xl font-black ${rating ? 'text-yellow-400' : 'text-gray-500'}">${rating ? rating.toFixed(1) : '-'}</div>
                        <div class="text-xs text-gray-500">Rating</div>
                    </div>
                    <div class="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div class="text-2xl font-black text-blue-400">${totalReviews}</div>
                        <div class="text-xs text-gray-500">Reseñas</div>
                    </div>
                </div>

                <!-- Badges -->
                ${badgesHtml ? `
                <div class="mb-6">
                    <h4 class="text-sm font-bold text-gray-400 mb-3">Insignias</h4>
                    <div class="flex flex-wrap gap-2">${badgesHtml}</div>
                </div>
                ` : ''}

                <!-- Reseñas -->
                <div>
                    <h4 class="text-sm font-bold text-gray-400 mb-3">Reseñas recientes</h4>
                    <div class="space-y-3 max-h-48 overflow-y-auto">${reviewsHtml}</div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function loadQuedadas(){
    // Mostrar skeletons mientras carga
    showSkeletons('lista-quedadas', 3);

    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaWhpd2RidGNiZGF6bWF4ZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTQwNjAsImV4cCI6MjA4NDEzMDA2MH0.C1Zus9DOIDJOGkdPWmMd_ZaSfG0ARVYobv66POrT-QU';
    const API_URL = 'https://waihiwdbtcbdazmaxdor.supabase.co/rest/v1';
    const todayStr = new Date().toISOString().split('T')[0];

    let data = null, error = null;

    // Try Supabase client first (with 8s timeout), fallback to REST
    const sb = window.supabaseClient;
    if (sb && typeof sb.from === 'function') {
        const premiumCols = ',is_private,access_code,recurrence,ruta_coords';
        const baseCols = 'id,titulo,ciudad,ubicacion,direccion,lat,lng,fecha,hora,nivel,distancia,ritmo,descripcion,creador_id,created_at,es_seed,organizador_nombre,organizador_foto,participantes_seed,max_participantes';
        const joinCols = 'creador:profiles!quedadas_creador_id_fkey(id,nombre,apellidos,photo_url,organizer_rating,total_reviews,total_organized,verification_badge,es_premium),participantes(user_id,status,es_seed,profiles!participantes_user_id_fkey_profiles(id,nombre,apellidos,photo_url,es_seed,es_premium))';

        let query = sb.from('quedadas').select(baseCols + premiumCols + ',' + joinCols).gte('fecha', todayStr).order('fecha', { ascending: true }).order('hora', { ascending: true }).limit(100);
        if (!isNewUser()) query = query.or('es_seed.is.null,es_seed.eq.false');

        try {
            const result = await Promise.race([
                query,
                new Promise((_, rej) => setTimeout(() => rej(new Error('sdk_timeout')), 8000))
            ]);
            data = result.data;
            error = result.error;

            // Fallback: If premium columns don't exist
            if (error && error.message && (error.message.includes('is_private') || error.message.includes('access_code'))) {
                let q2 = sb.from('quedadas').select(baseCols + ',' + joinCols).gte('fecha', todayStr).order('fecha', { ascending: true }).order('hora', { ascending: true }).limit(100);
                if (!isNewUser()) q2 = q2.or('es_seed.is.null,es_seed.eq.false');
                const r2 = await Promise.race([q2, new Promise((_, rej) => setTimeout(() => rej(new Error('sdk_timeout')), 8000))]);
                data = r2.data;
                error = r2.error;
            }
        } catch(e) {
            console.warn('Supabase SDK timeout, using REST fallback');
            data = null;
            error = null;
        }
    }

    // REST fallback if SDK failed or timed out
    if (!data) {
        try {
            const resp = await fetch(API_URL + '/quedadas?select=id,titulo,ciudad,ubicacion,direccion,lat,lng,fecha,hora,nivel,distancia,ritmo,descripcion,creador_id,created_at,es_seed,organizador_nombre,organizador_foto,pais&fecha=gte.' + todayStr + '&or=(es_seed.is.null,es_seed.eq.false)&order=fecha.asc,hora.asc&limit=100', {
                headers: { 'apikey': ANON_KEY }
            });
            data = await resp.json();
            if (!Array.isArray(data)) data = [];
            // Map REST data to expected format (no joins available via REST)
            data = data.map(q => ({
                ...q,
                creador: { nombre: q.organizador_nombre || '', photo_url: q.organizador_foto || '' },
                participantes: [],
                asistentes: []
            }));
            error = null;
        } catch(e) {
            console.warn('REST fallback failed:', e.message);
            error = { message: e.message };
        }
    }

    if(error){
        CJ.handleApiError(error, 'loadQuedadas', {silent:true});
        quedadas = [];
        // Show error state in list
        var listEl = document.getElementById('lista-quedadas');
        if(listEl){
            var isEN = currentLang === 'en';
            listEl.innerHTML = '<div class="flex flex-col items-center justify-center py-12 px-6 text-center">' +
                '<div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">' +
                '<svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>' +
                '</div>' +
                '<h3 class="text-white font-bold text-lg mb-2">' + (isEN ? 'Could not load runs' : 'No se pudieron cargar las quedadas') + '</h3>' +
                '<p class="text-gray-400 text-sm mb-4">' + (isEN ? 'Check your connection and try again' : 'Comprueba tu conexión e inténtalo de nuevo') + '</p>' +
                '<button onclick="loadQuedadas()" class="px-5 py-2 rounded-xl bg-slate-700 text-white font-bold text-sm hover:bg-slate-600 transition">' + (isEN ? 'Retry' : 'Reintentar') + '</button>' +
                '</div>';
        }
        updateMarkers();
        return;
    } else {
        const showSeed = isNewUser();
        quedadas = (data || []).map(q => {
            // Filtrar participantes seed si el usuario no es nuevo
            const participantes = showSeed
                ? (q.participantes || [])
                : (q.participantes || []).filter(p => !p.es_seed);

            // Convertir participantes reales a formato estándar
            const asistentesReales = participantes.map(p => {
                const prof = p.profiles || null;
                const nombre = (prof && prof.nombre) ? String(prof.nombre) : '';
                const apellidos = (prof && prof.apellidos) ? String(prof.apellidos) : '';
                const initials = ((nombre.charAt(0) || '') + (apellidos.charAt(0) || '')).toUpperCase() || 'R';
                return {
                    user_id: p.user_id,
                    nombre,
                    apellidos,
                    initials,
                    photo_url: prof && prof.photo_url ? String(prof.photo_url) : '',
                    status: p.status || 'confirmed',
                    es_seed: !!p.es_seed,
                    es_premium: !!(prof && prof.es_premium)
                };
            });

            // Para quedadas seed, añadir participantes ficticios del campo participantes_seed
            let asistentesFinales = asistentesReales;
            if (q.es_seed && showSeed && Array.isArray(q.participantes_seed)) {
                const participantesSeed = q.participantes_seed.map((ps, idx) => ({
                    user_id: `seed-${q.id}-${idx}`,
                    nombre: ps.nombre || '',
                    apellidos: ps.apellido || '',
                    initials: ((ps.nombre || '').charAt(0) + (ps.apellido || '').charAt(0)).toUpperCase() || 'R',
                    photo_url: ps.foto || '',
                    status: ps.status || 'confirmed',
                    es_seed: true
                }));
                asistentesFinales = [...asistentesReales, ...participantesSeed];
            }

            return {
                ...q,
                asistentes_info: asistentesFinales,
                asistentes: asistentesFinales.map(a => a.user_id)
            };
        });
    }

    renderCityChips();
    renderQuedadas();
    updateMarkers();
    updateFilterUI(); // Actualizar contador de resultados en sidebar
    try { injectEventSchema(); } catch(_) {} // SEO: inyectar SportsEvent JSON-LD con datos reales
}

/* ── SEO: Inyectar Event Schema dinámico (SportsEvent) ── */
/* Guard: solo inyectar si el listado de quedadas es visible en Home */
function injectEventSchema(dataOverride) {
    try {
        var listaEl = document.getElementById('lista-quedadas');
        if (!listaEl || listaEl.offsetParent === null) return; // no visible → no inyectar
        var source = dataOverride || quedadas || [];
        // Solo quedadas futuras, públicas, no seed, max 20
        var futuras = source.filter(function(q) {
            if (q.es_seed) return false;
            if (q.is_private) return false;
            // Si viene de loadQuedadasPreview ya está filtrada por fecha
            if (typeof isQuedadaPasada === 'function' && isQuedadaPasada(q)) return false;
            return true;
        }).slice(0, 20);

        if (!futuras.length) return;

        var events = futuras.map(function(q, i) {
            var hora = (q.hora || '08:00').substring(0, 5);
            var startDate = q.fecha + 'T' + hora + ':00';
            var participantes = (q.asistentes || []).length;
            var desc = q.descripcion || ('Quedada de running en ' + (q.ciudad || '') + '. Nivel: ' + (q.nivel || 'Todos') + '. Distancia: ' + (q.distancia || 'libre') + '.');

            var location = {
                '@type': 'Place',
                'name': q.ubicacion || q.ciudad || '',
                'address': {
                    '@type': 'PostalAddress',
                    'streetAddress': q.direccion || '',
                    'addressLocality': q.ciudad || ''
                }
            };
            if (q.lat && q.lng) {
                location.geo = { '@type': 'GeoCoordinates', 'latitude': q.lat, 'longitude': q.lng };
            }

            // endDate: +2h from start (running events are ~1-2h)
            var endParts = hora.split(':');
            var endH = (parseInt(endParts[0], 10) + 2) % 24;
            var endDate = q.fecha + 'T' + String(endH).padStart(2, '0') + ':' + endParts[1] + ':00';

            var ev = {
                '@type': 'SportsEvent',
                'name': q.titulo,
                'description': desc.substring(0, 300),
                'startDate': startDate,
                'endDate': endDate,
                'image': q.imagen || 'https://www.correrjuntos.com/img/og-image.jpg',
                'performer': { '@type': 'Organization', 'name': 'CorrerJuntos', 'url': 'https://www.correrjuntos.com' },
                'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR', 'url': 'https://www.correrjuntos.com', 'availability': 'https://schema.org/InStock', 'validFrom': '2025-01-01' },
                'location': location,
                'organizer': { '@type': 'Organization', 'name': 'CorrerJuntos', 'url': 'https://www.correrjuntos.com' },
                'eventStatus': 'https://schema.org/EventScheduled',
                'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
                'isAccessibleForFree': true,
                'sport': 'Running'
            };
            if (q.max_participantes) {
                ev.maximumAttendeeCapacity = q.max_participantes;
                ev.remainingAttendeeCapacity = Math.max(0, q.max_participantes - participantes);
            }

            return { '@type': 'ListItem', 'position': i + 1, 'item': ev };
        });

        var schema = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': 'Quedadas de running en CorrerJuntos',
            'description': 'Eventos de running gratuitos organizados por la comunidad.',
            'url': 'https://www.correrjuntos.com',
            'numberOfItems': events.length,
            'itemListElement': events
        };

        var existing = document.getElementById('schema-events');
        if (existing) {
            existing.textContent = JSON.stringify(schema);
        } else {
            var script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'schema-events';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    } catch (e) {
        console.warn('injectEventSchema:', e);
    }
}


function renderQuedadas(){
    const list = document.getElementById('lista-quedadas');
    const countEl = document.getElementById('quedadas-count');
    if(!list) return;

    // Primero filtrar por país del usuario (si no está en modo mundial)
    let quedadasPais = quedadas;
    if (geoFilterMode === 'country' && userCountry) {
        quedadasPais = quedadas.filter(q => matchesCountry(q.pais, userCountry));
    }

    let filtered;
    if(currentFilter==='all'){
        // Mundial: todas las quedadas del mundo
        filtered = quedadas;
    } else if(currentFilter==='country'){
        // Mi país: solo quedadas del país del usuario
        filtered = quedadasPais;
    } else if(currentFilter==='city'){
        // Mi ciudad (50km de radio)
        filtered = userLoc ? quedadasPais.filter(q=>haversineKm(userLoc.lat,userLoc.lng,q.lat,q.lng) <= 50) : quedadasPais;
    } else {
        filtered = quedadasPais.filter(q=>q.ciudad===currentFilter);
    }

    // 🧹 Filtrar quedadas que ya pasaron
    filtered = filtered.filter(q => !isQuedadaPasada(q));

    // PREMIUM: Aplicar filtros avanzados
    filtered = applyAdvancedFilters(filtered);

    if(countEl) countEl.textContent = filtered.length;

    // 🎯 Actualizar banner de quedadas disponibles
    const bannerCount = document.getElementById('banner-count');
    const bannerText = document.getElementById('banner-text');
    if (bannerCount) bannerCount.textContent = filtered.length;
    if (bannerText) {
        bannerText.textContent = currentLang === 'en'
            ? (filtered.length === 1 ? 'run available' : 'runs available')
            : (filtered.length === 1 ? 'quedada disponible' : 'quedadas disponibles');
    }

    // Agrupar quedadas por fecha
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const groups = {
        hoy: [],
        manana: [],
        semana: [],
        proximas: []
    };

    filtered.forEach(q => {
        const qDate = new Date(q.fecha + 'T00:00:00');
        if (qDate.getTime() === today.getTime()) {
            groups.hoy.push(q);
        } else if (qDate.getTime() === tomorrow.getTime()) {
            groups.manana.push(q);
        } else if (qDate < weekEnd) {
            groups.semana.push(q);
        } else {
            groups.proximas.push(q);
        }
    });

    // Insertar banner de Strava promo cada 3 quedadas (solo usuarios no premium)
    const adBanner = !isUserPremium ? `
        <div class="ad-banner p-4 rounded-2xl bg-gradient-to-br from-[#FC5200]/10 to-orange-900/20 border border-[#FC5200]/30 my-4 cursor-pointer hover:border-[#FC5200]/50 transition-all" onclick="openModal('modal-profile')">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-[#FC5200]/20 flex items-center justify-center flex-shrink-0">
                    <svg class="w-7 h-7" viewBox="0 0 24 24" fill="#FC5200"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-white font-bold text-sm">Sincroniza con Strava</p>
                    <p class="text-gray-400 text-xs">Conecta tu cuenta, ve tus stats reales y exporta carreras automáticamente</p>
                </div>
                <span class="px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex-shrink-0">PRO</span>
            </div>
            <div class="mt-3 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-[#FC5200] to-orange-600 text-white font-bold text-xs">
                <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Desbloquear con Premium
            </div>
        </div>
    ` : '';

    // Función para renderizar una tarjeta
    const renderCard = (q, index) => {
        const asistentesInfo = Array.isArray(q.asistentes_info) ? q.asistentes_info : [];
        const asistentes = Array.isArray(q.asistentes) ? q.asistentes : asistentesInfo.map(a=>a.user_id);
        const isJoined = !!(currentUser && asistentes.includes(currentUser.id));
        const isCreatorCard = !!(currentUser && q.creador_id && currentUser.id === q.creador_id && !q.es_seed);

        // PREMIUM: Skip private quedadas unless user is creator or participant
        if (q.is_private && !isJoined && !isCreatorCard) return '';

        // Detectar amenities desde descripción/ubicación (hasta que existan en BD)
        const detectAmenities = () => {
            const text = ((q.descripcion || '') + ' ' + (q.ubicacion || '')).toLowerCase();
            const detected = [];
            if (text.includes('fuente') || text.includes('agua')) detected.push('fuentes');
            if (text.includes('baño') || text.includes('aseo') || text.includes('wc')) detected.push('banos');
            if (text.includes('parking') || text.includes('aparc')) detected.push('parking');
            if (text.includes('sombra') || text.includes('árbol') || text.includes('parque')) detected.push('sombra');
            if (text.includes('iluminad') || text.includes('luz') || text.includes('noche')) detected.push('iluminacion');
            if (text.includes('cafe') || text.includes('bar') || text.includes('cafetería')) detected.push('cafe');
            if (text.includes('metro') || text.includes('bus') || text.includes('tren') || text.includes('transporte')) detected.push('transporte');
            if (text.includes('vestuario') || text.includes('ducha')) detected.push('vestuarios');
            return detected;
        };
        const detectedAmenities = q.amenities && q.amenities.length > 0 ? q.amenities : detectAmenities();

        // Obtener estado de asistencia del usuario actual
        const myParticipation = currentUser ? asistentesInfo.find(a => a.user_id === currentUser.id) : null;
        const myStatus = myParticipation?.status || 'confirmed';

        // Contar por estado
        const confirmedCount = asistentesInfo.filter(a => a.status === 'confirmed' || !a.status).length;
        const maybeCount = asistentesInfo.filter(a => a.status === 'maybe').length;
        const interestedCount = asistentesInfo.filter(a => a.status === 'interested').length;

        // Urgency badge
        let urgencyBadge = '';
        const spotsLeft = q.max_participantes ? q.max_participantes - confirmedCount : null;
        const hoursUntil = (new Date(`${q.fecha}T${q.hora || '00:00'}`) - new Date()) / 3600000;
        if (spotsLeft !== null && spotsLeft <= 3 && spotsLeft > 0) {
            urgencyBadge = `<div class="text-xs mb-3 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Quedan ${spotsLeft} plaza${spotsLeft === 1 ? '' : 's'}</div>`;
        } else if (hoursUntil > 0 && hoursUntil <= 6) {
            const h = Math.ceil(hoursUntil);
            urgencyBadge = `<div class="text-xs mb-3 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Empieza en ${h} hora${h === 1 ? '' : 's'}</div>`;
        } else if (confirmedCount >= 4) {
            urgencyBadge = `<div class="text-xs mb-3 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg> ${confirmedCount} runners ya se han unido</div>`;
        }

        const nombres = asistentesInfo.length ? asistentesInfo.slice(0,3).map(a => (a.user_id===currentUser?.id ? (currentUser.nombre||'Tú') : (a.nombre || getUserName(a.user_id)))) : asistentes.slice(0,3).map(uid=>getUserName(uid));
        const mas = asistentes.length>3 ? (asistentes.length-3) : 0;

        const levelBadge = (q.nivel==='Avanzado') ? 'bg-red-500/20 text-red-400'
                          : (q.nivel==='Intermedio') ? 'bg-yellow-500/20 text-yellow-400'
                          : (q.nivel==='Principiante') ? 'bg-green-500/20 text-green-400'
                          : (q.nivel==='Elite') ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-orange-500/20 text-orange-400'; // Todos u otro

        // Creador de la quedada (badge visual). IMPORTANTE: el creador SÍ puede abandonar.
        // NOTA: Las quedadas seed NUNCA son "Tu quedada" aunque el creador_id coincida
        const isCreator = !!(currentUser && q.creador_id && currentUser.id === q.creador_id && !q.es_seed);

        // Botón de acción con estados mejorados
        let actionBtn;
        if (!currentUser) {
            actionBtn = `<button onclick="event.stopPropagation();openModal('modal-register')" class="px-5 py-2.5 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/25 transition">${I18N[currentLang]?.join || 'Unirme'}</button>`;
        } else if (isCreator) {
            // El creador ve badge "Tu quedada" en lugar de "Unirme"
            actionBtn = `<span class="px-5 py-2.5 rounded-full font-extrabold text-sm bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> Tu quedada</span>`;
        } else if (isJoined) {
            const statusBadge = getStatusBadge(myStatus);
            // Botón dinámico: muestra el estado actual con opción de cambiar o abandonar
            actionBtn = `
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button onclick="event.stopPropagation();openAttendanceModal('${q.id}')" class="px-3 py-2 rounded-full font-bold text-xs border-2 ${statusBadge.class} hover:opacity-80 transition flex items-center gap-1.5" title="Cambiar estado">
                        ${statusBadge.icon} <span>${statusBadge.text}</span>
                        <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </button>
                </div>`;
        } else if (q.max_participantes && confirmedCount >= q.max_participantes) {
            // Quedada completa — no se puede unir
            actionBtn = `<span class="px-5 py-2.5 rounded-full font-extrabold text-sm bg-red-500/20 text-red-400 border border-red-500/40 cursor-not-allowed">Completa</span>`;
        } else {
            // Botón naranja para unirse
            actionBtn = `<button onclick="event.stopPropagation();openAttendanceModal('${q.id}')" class="px-5 py-2.5 rounded-full font-extrabold text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/25 transition">${I18N[currentLang]?.join || 'Unirme'}</button>`;
        }

        // Limitar nombres a 2 para evitar solapamiento
        const nombresLimitados = nombres.slice(0, 2);
        const masNombres = asistentes.length > 2 ? asistentes.length - 2 : 0;

        const participantsBlock = asistentes.length>0
          ? `<div class="flex items-center gap-2">
                <div class="avatar-stack">
                  ${(asistentesInfo.length? asistentesInfo.slice(0,3) : asistentes.slice(0,3).map(uid=>({user_id:uid, initials:getUserName(uid).trim().charAt(0).toUpperCase(), photo_url:''}))).map(a=>{const u=a||{}; const photo=u.photo_url||''; const ini=(u.initials||getUserName(u.user_id).trim().charAt(0).toUpperCase()||'R'); return photo ? `<div class="avatar"><img src="${escapeHtml(photo)}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" /></div>` : `<div class="avatar">${ini}</div>`;}).join('')}
                  ${mas>0 ? `<div class="avatar avatar-more">+${mas}</div>` : ''}
                </div>
                <div class="participants-names text-xs text-gray-300 font-semibold">${nombresLimitados.join(', ')}${masNombres>0 ? ` <span class="text-gray-500">+${masNombres}</span>` : ''}</div>
             </div>`
          : `<span class="text-xs text-gray-500">${I18N[currentLang]?.beFirst || (currentLang==='en'?'Be the first':(currentLang==='pt'?'Sê o primeiro':'Sé el primero'))}</span>`;

        // PREMIUM: Badge "En vivo"
        const isLive = isQuedadaLive(q);

        // Datos del organizador desde el join directo
        // Para quedadas seed, usar los campos organizador_nombre y organizador_foto
        const creadorInfo = asistentesInfo.find(a => a.user_id === q.creador_id);
        const creador = q.creador || {};
        const esSeed = q.es_seed === true;
        const creadorNombre = esSeed && q.organizador_nombre ? q.organizador_nombre.split(' ')[0] : (creador.nombre || creadorInfo?.nombre || 'Organizador');
        const creadorApellido = esSeed && q.organizador_nombre ? (q.organizador_nombre.split(' ')[1] || '') : (creador.apellidos || creadorInfo?.apellidos || '');
        const creadorApellidoCorto = creadorApellido ? creadorApellido.charAt(0) + '.' : '';
        const creadorPhoto = esSeed && q.organizador_foto ? q.organizador_foto : (creador.photo_url || creadorInfo?.photo_url || '');
        const creadorInitials = ((creadorNombre).charAt(0) + (creadorApellido).charAt(0)).toUpperCase() || 'R';
        const creadorRating = creador.organizer_rating;
        const creadorReviews = creador.total_reviews || 0;
        const creadorOrganized = creador.total_organized || 0;
        const creadorVerified = creador.verification_badge || false;
        const isCreadorPremium = creadorInfo?.es_premium || creador?.es_premium || false;

        // Generar TODOS los badges de confianza del organizador
        const getOrganizerBadges = () => {
            const badges = [];

            // ⭐ Badge Premium (siempre primero si aplica)
            if (isCreadorPremium) {
                badges.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', text: 'Premium', class: 'badge-premium', title: 'Organizador Premium' });
            }

            // Badge Verificado (email verificado)
            if (creadorVerified) {
                badges.push({ icon: '✓', text: 'Verificado', class: 'badge-verified', title: 'Email verificado' });
            }

            // Badge por cantidad de quedadas organizadas
            if (creadorOrganized >= 20) {
                badges.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>', text: 'Experto', class: 'badge-expert', title: 'Más de 20 quedadas organizadas' });
            } else if (creadorOrganized >= 10) {
                badges.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>', text: 'Elite', class: 'badge-elite', title: 'Más de 10 quedadas organizadas' });
            } else if (creadorOrganized >= 5) {
                badges.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', text: 'Activo', class: 'badge-active', title: 'Más de 5 quedadas organizadas' });
            }

            // Badge por rating alto
            if (creadorRating >= 4.5 && creadorReviews >= 3) {
                badges.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>', text: 'Top', class: 'badge-top-rated', title: 'Rating 4.5+ con 3+ reseñas' });
            } else if (creadorRating >= 4.0 && creadorReviews >= 2) {
                badges.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>', text: 'Recomendado', class: 'badge-recommended', title: 'Rating 4.0+ con reseñas positivas' });
            }

            // Si no tiene badges y es organizador de al menos 1 quedada, mostrar badge "Nuevo"
            if (badges.length === 0 && !esSeed) {
                badges.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', text: 'Nuevo', class: 'badge-new', title: 'Nuevo organizador' });
            }

            return badges;
        };
        const orgBadges = getOrganizerBadges();
        const orgBadge = orgBadges.length > 0 ? orgBadges[0] : null;

        // Generar HTML de todos los badges (siempre mostrar al menos el rating si existe)
        let badgesHtml = orgBadges.map(b =>
            `<span class="org-badge ${b.class}" title="${b.title}">${b.icon}</span>`
        ).join('');

        // Bloque del organizador para la tarjeta (no usado en tarjeta simplificada)
        const organizerBlock = `
          <div class="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/50">
            ${isCreadorPremium ? '<div class="premium-avatar-border">' : ''}
            ${creadorPhoto
              ? `<img src="${escapeHtml(creadorPhoto)}" class="w-9 h-9 rounded-full object-cover border-2 ${isCreadorPremium ? 'border-slate-900' : 'border-slate-600'}" alt="Organizador" />`
              : `<div class="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-sm border-2 ${isCreadorPremium ? 'border-slate-900' : 'border-slate-600'}">${creadorInitials}</div>`
            }
            ${isCreadorPremium ? '</div>' : ''}
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-500">${currentLang==='en'?'Organized by':(currentLang==='pt'?'Organizado por':'Organiza')}</div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-white truncate">${creadorNombre} ${creadorApellidoCorto}</span>
                ${creadorRating ? `<span class="text-xs text-yellow-400 font-bold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> ${creadorRating.toFixed(1)}</span>` : ''}
                ${creadorReviews > 0 ? `<span class="text-xs text-gray-500">(${creadorReviews})</span>` : ''}
                ${orgBadge ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${orgBadge.class} border">${orgBadge.icon}</span>` : ''}
              </div>
            </div>
            ${creadorOrganized > 0 ? `<div class="text-xs text-gray-500 text-right shrink-0">${creadorOrganized} ${currentLang==='en'?'events':(currentLang==='pt'?'eventos':'quedadas')}</div>` : ''}
          </div>`;

        // Generar lista de features (terreno + desnivel + amenities) DESTACADOS
        const featuresArray = [];
        if (q.terreno === 'asfalto') featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>', text: 'Asfalto' });
        if (q.terreno === 'tierra') featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>', text: 'Tierra' });
        if (q.terreno === 'mixto') featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>', text: 'Mixto' });
        if (q.desnivel === 'llano') featuresArray.push({ icon: '⬜', text: 'Llano' });
        if (q.desnivel === 'suave') featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>', text: 'Suave' });
        if (q.desnivel === 'moderado') featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21l7.5-12L15 15l6-9v15H3z"/></svg>', text: 'Moderado' });
        if (q.desnivel === 'fuerte') featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21l5-8 4 4 4-8 5 12H3z"/></svg>', text: 'Fuerte' });
        // Amenities detectados
        if (detectedAmenities.includes('fuentes')) featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a8 8 0 01-8-8c0-4.42 8-12 8-12s8 7.58 8 12a8 8 0 01-8 8z"/></svg>', text: 'Fuentes' });
        if (detectedAmenities.includes('banos')) featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>', text: 'Baños' });
        if (detectedAmenities.includes('parking')) featuresArray.push({ icon: '🅿️', text: 'Parking' });
        if (detectedAmenities.includes('vestuarios')) featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a8 8 0 01-8-8c0-4.42 8-12 8-12s8 7.58 8 12a8 8 0 01-8 8z"/></svg>', text: 'Vestuarios' });
        if (detectedAmenities.includes('iluminacion')) featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>', text: 'Iluminado' });
        if (detectedAmenities.includes('sombra')) featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>', text: 'Sombra' });
        if (detectedAmenities.includes('cafe')) featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8m-4-4v4M6 17h12a2 2 0 002-2V5H4v10a2 2 0 002 2z"/></svg>', text: 'Café' });
        if (detectedAmenities.includes('transporte')) featuresArray.push({ icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 21l4-4 4 4M3 5h18M5 5v10a2 2 0 002 2h10a2 2 0 002-2V5"/></svg>', text: 'Transporte' });

        // Ubicación: extraer calle principal
        const ubicacionParts = (q.ubicacion || '').split('·');
        const callePrincipal = ubicacionParts[0]?.trim() || '';

        return `
        <div class="card-quedada ${isJoined ? 'joined' : ''} p-6 rounded-2xl cursor-pointer hover:border-orange-500/30 transition-all" onclick="openQuedadaDetail('${q.id}')">

          <!-- ═══ SECCIÓN 1: HEADER con Fecha/Hora + Nivel ═══ -->
          <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/30">
            <div class="flex items-center gap-3">
              <div class="bg-orange-500/10 rounded-xl px-3 py-2 text-center min-w-[70px]">
                <div class="text-lg font-black text-orange-400">${formatHora(q.hora)}</div>
                <div class="text-[10px] text-orange-300/70 uppercase tracking-wide">${formatDateShort(q.fecha)}</div>
              </div>
              ${isLive ? `<span class="live-badge"><span class="live-dot"></span>¡Ahora!</span>` : ''}
              ${q.is_private ? `<span class="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>` : ''}
              ${q.recurrence ? `<span class="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></span>` : ''}
            </div>
            <div class="flex flex-col items-end gap-1">
              <div class="flex items-center gap-2">
                <span class="px-3 py-1.5 rounded-full text-xs font-bold ${levelBadge}">${q.nivel}</span>
                ${isJoined && !isCreator ? `<span class="px-2 py-1 rounded-full text-xs font-bold ${myStatus === 'confirmed' ? 'bg-green-500/20 text-green-400' : myStatus === 'maybe' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}">✓</span>` : ''}
              </div>
              ${creadorRating ? `<span class="text-xs text-yellow-400 font-semibold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> ${creadorRating.toFixed(1)}${creadorReviews > 0 ? ` <span class="text-gray-500">(${creadorReviews})</span>` : ''}</span>` : ''}
            </div>
          </div>

          <!-- ═══ SECCIÓN 2: TÍTULO ═══ -->
          <h3 class="text-xl font-bold text-white mb-2 leading-tight line-clamp-2" title="${escapeHtml(q.titulo)}">${escapeHtml(q.titulo)}</h3>

          <!-- ═══ SECCIÓN 3: UBICACIÓN ═══ -->
          <div class="flex items-center gap-2 mb-5">
            <span class="text-orange-400"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></span>
            <span class="text-sm text-gray-300">${q.ciudad}${callePrincipal && callePrincipal !== q.ciudad ? ` · ${callePrincipal}` : ''}</span>
          </div>

          <!-- ═══ SECCIÓN 4: DATOS CLAVE ═══ -->
          <div class="flex items-center justify-between py-4 px-4 mb-5 bg-slate-800/40 rounded-xl">
            <div class="text-center">
              <div class="text-lg font-bold text-white">${formatDistancia(q.distancia)}</div>
              <div class="text-[10px] text-gray-500 uppercase">Distancia</div>
            </div>
            <div class="w-px h-8 bg-slate-700"></div>
            <div class="text-center">
              <div class="text-lg font-bold text-white">${formatRitmo(q.ritmo)}</div>
              <div class="text-[10px] text-gray-500 uppercase">Ritmo</div>
            </div>
            <div class="w-px h-8 bg-slate-700"></div>
            <div class="text-center">
              <div class="text-lg font-bold ${q.max_participantes && confirmedCount >= q.max_participantes ? 'text-red-400' : confirmedCount >= 5 ? 'text-orange-400' : 'text-green-400'}">${confirmedCount}${q.max_participantes ? `<span class="text-sm text-gray-500">/${q.max_participantes}</span>` : ''}${maybeCount > 0 ? `<span class="text-sm text-yellow-400"> +${maybeCount}</span>` : ''}</div>
              <div class="text-[10px] text-gray-500 uppercase">Runners</div>
            </div>
          </div>

          <!-- ═══ SECCIÓN 5: DESCRIPCIÓN ═══ -->
          ${q.descripcion ? `
          <p class="text-sm text-gray-400 line-clamp-2 mb-5">${escapeHtml(q.descripcion)}</p>` : ''}

          <!-- ═══ SECCIÓN 5b: URGENCIA ═══ -->
          ${urgencyBadge}

          <!-- ═══ SECCIÓN 6: FEATURES PREMIUM ═══ -->
          ${q.ruta_coords ? `<div class="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20"><span class="text-xs"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg></span><span class="text-xs text-orange-400 font-semibold">Ruta GPS disponible</span></div>` : ''}

          <!-- ═══ SECCIÓN 7: CLIMA ═══ -->
          <div id="weather-${q.id}" class="mb-4"></div>

          <!-- ═══ SECCIÓN 7: FOOTER - Organizador + CTA ═══ -->
          <div class="card-footer flex items-center justify-between gap-3 pt-5 mt-auto border-t border-slate-700/30">
            <div class="organizer-wrapper flex items-center gap-2 min-w-0 flex-shrink" onclick="event.stopPropagation();">
              ${isCreadorPremium ? '<div class="premium-avatar-border flex-shrink-0" style="padding:1.5px;">' : ''}
              ${creadorPhoto
                ? `<img src="${escapeHtml(creadorPhoto)}" class="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="Organizador" loading="lazy" />`
                : `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">${creadorInitials}</div>`
              }
              ${isCreadorPremium ? '</div>' : ''}
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-white truncate">${creadorNombre}</span>
                <span class="text-xs text-gray-500">Organizador</span>
              </div>

              <!-- Tooltip del organizador -->
              <div class="organizer-tooltip">
                <div class="organizer-tooltip-header">
                  ${creadorPhoto
                    ? `<img src="${escapeHtml(creadorPhoto)}" class="organizer-tooltip-avatar" alt="Organizador" loading="lazy" />`
                    : `<div class="organizer-tooltip-avatar-placeholder">${creadorInitials}</div>`
                  }
                  <div>
                    <div class="organizer-tooltip-name">${creadorNombre} ${creadorApellidoCorto}</div>
                    <div class="organizer-tooltip-since">${creadorOrganized > 0 ? `${creadorOrganized} quedadas organizadas` : 'Nuevo organizador'}</div>
                  </div>
                </div>
                <button class="organizer-tooltip-btn" onclick="event.stopPropagation(); openUserProfile('${q.creador_id}');">
                  Ver perfil
                </button>
              </div>
            </div>

            <!-- CTA Button -->
            <div class="flex-shrink-0" onclick="event.stopPropagation();">
              ${actionBtn}
            </div>
          </div>
        </div>${(index + 1) % 3 === 0 ? adBanner : ''}`;
    };

    // Renderizar por grupos con headers
    let html = '';

    const renderGroup = (quedadas, title, icon, color) => {
        if (quedadas.length === 0) return '';
        return `
            <div class="col-span-full mb-2 mt-6 first:mt-0">
                <div class="flex items-center gap-2">
                    <span class="text-xl">${icon}</span>
                    <h3 class="text-lg font-bold ${color}">${title}</h3>
                    <span class="text-sm text-gray-500">(${quedadas.length})</span>
                </div>
            </div>
            ${quedadas.map((q, i) => renderCard(q, i)).join('')}
        `;
    };

    const t = I18N[currentLang] || I18N.es;
    if(!t) return; // i18n not loaded yet

    // Empty state when no quedadas match filters
    if (filtered.length === 0) {
        const isEN = currentLang === 'en';
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div class="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                </div>
                <h3 class="text-white font-bold text-lg mb-2">${isEN ? 'No runs nearby' : 'No hay quedadas cerca'}</h3>
                <p class="text-gray-400 text-sm mb-6 max-w-xs">${isEN ? 'Be the first to create a run in your area and meet other runners!' : 'Se el primero en crear una quedada en tu zona y conocer otros runners!'}</p>
                <button onclick="openModal('modal-crear')" class="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
                    ${isEN ? '+ Create a run' : '+ Crear quedada'}
                </button>
            </div>`;
        return;
    }

    html += renderGroup(groups.hoy, t.dateToday, '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>', 'text-orange-400');
    html += renderGroup(groups.manana, t.dateTomorrow, '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', 'text-blue-400');
    html += renderGroup(groups.semana, t.dateThisWeek, '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', 'text-green-400');
    html += renderGroup(groups.proximas, t.dateLater, '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', 'text-gray-400');

    list.innerHTML = html;

    // Cargar clima para cada quedada (asíncrono)
    loadWeatherForQuedadas(filtered);

    // 🎯 Cargar recomendaciones inteligentes + misión activa
    loadSmartRecommendations();
    loadActiveMission();
}

// Cargar clima para las quedadas visibles

async function loadWeatherForQuedadas(quedadasList) {
    for (const q of quedadasList) {
        if (!q.lat || !q.lng || !q.fecha) continue;
        const weatherEl = document.getElementById(`weather-${q.id}`);
        if (!weatherEl) continue;

        const weather = await getWeather(q.lat, q.lng, q.fecha);
        if (weather) {
            // Mostrar pronóstico de forma consistente
            const badgeClass = weather.condition === 'bad' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              weather.condition === 'warn' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-green-500/20 text-green-400 border-green-500/30';
            const t = I18N[currentLang] || I18N.es;
            weatherEl.innerHTML = `
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${badgeClass}">
                    <span>${weather.icon}</span>
                    <span>${weather.text}</span>
                    <span class="text-gray-500 text-[10px]">${t.weatherForecast}</span>
                </div>`;
        }
    }
}

// ===================== DETALLE DE QUEDADA =====================
let detailMap = null;
let detailMarker = null;


function openQuedadaDetail(id) {
    const q = quedadas.find(x => x.id === id);
    if (!q) { showToast('Quedada no encontrada', 'error'); return; }

    // Obtener traducciones
    const t = I18N[currentLang] || I18N.es;

    const asistentesInfo = Array.isArray(q.asistentes_info) ? q.asistentes_info : [];
    const asistentes = Array.isArray(q.asistentes) ? q.asistentes : asistentesInfo.map(a => a.user_id);
    const isJoined = !!(currentUser && asistentes.includes(currentUser.id));
    // NOTA: Las quedadas seed NUNCA son "Tu quedada"
    const isCreator = !!(currentUser && q.creador_id && currentUser.id === q.creador_id && !q.es_seed);

    // Nivel badge colors con traducciones
    const nivelColors = {
        'Principiante': { bg: 'bg-green-500/20', text: 'text-green-400', desc: t.levelBeginnerDesc },
        'Intermedio': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', desc: t.levelIntermediateDesc },
        'Avanzado': { bg: 'bg-red-500/20', text: 'text-red-400', desc: t.levelAdvancedDesc },
        'Elite': { bg: 'bg-purple-500/20', text: 'text-purple-400', desc: t.levelEliteDesc },
        'Todos': { bg: 'bg-orange-500/20', text: 'text-orange-400', desc: t.levelAllDesc }
    };
    const nivelStyle = nivelColors[q.nivel] || nivelColors['Todos'];
    
    // Rellenar datos
    document.getElementById('detail-titulo').textContent = q.titulo;
    document.getElementById('detail-ciudad').textContent = q.ciudad;
    document.getElementById('detail-fecha').textContent = formatDate(q.fecha);
    document.getElementById('detail-hora').textContent = formatHora(q.hora);
    document.getElementById('detail-distancia').textContent = q.distancia || 'No especificada';
    document.getElementById('detail-ritmo').textContent = q.ritmo || t.detailFree;
    document.getElementById('detail-ubicacion').textContent = q.ubicacion;
    
    // Nivel badge en header
    const nivelBadge = document.getElementById('detail-nivel-badge');
    nivelBadge.textContent = q.nivel;
    nivelBadge.className = `inline-block px-3 py-1 rounded-full text-xs font-black ${nivelStyle.bg} ${nivelStyle.text}`;
    
    // Nivel en sección
    const nivelEl = document.getElementById('detail-nivel');
    nivelEl.textContent = q.nivel;
    nivelEl.className = `px-4 py-2 rounded-full font-black text-sm ${nivelStyle.bg} ${nivelStyle.text}`;
    document.getElementById('detail-nivel-desc').textContent = nivelStyle.desc;
    
    // Descripción
    const descWrap = document.getElementById('detail-descripcion-wrap');
    const descEl = document.getElementById('detail-descripcion');
    if (q.descripcion && q.descripcion.trim()) {
        descEl.textContent = q.descripcion;
        descWrap.classList.remove('hidden');
    } else {
        descWrap.classList.add('hidden');
    }

    // 🌦️ Cargar meteo en detalle
    loadDetailWeather(q.lat || 40.4168, q.lng || -3.7038, q.fecha);

    // Participantes - contar por estado
    const detailConfirmed = asistentesInfo.filter(a => a.status === 'confirmed' || !a.status).length;
    const detailMaybe = asistentesInfo.filter(a => a.status === 'maybe').length;
    const detailInterested = asistentesInfo.filter(a => a.status === 'interested').length;

    document.getElementById('detail-count').innerHTML = `
        <span class="flex items-center gap-2">
            ${detailConfirmed > 0 ? `<span class="text-green-400 text-xs" title="${t.detailConfirmed}"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> ${detailConfirmed}${q.max_participantes ? '/' + q.max_participantes : ''}</span>` : ''}
            ${detailMaybe > 0 ? `<span class="text-yellow-400 text-xs" title="${t.detailMaybe}"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${detailMaybe}</span>` : ''}
            ${detailInterested > 0 ? `<span class="text-blue-400 text-xs" title="${t.detailInterested}"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> ${detailInterested}</span>` : ''}
            ${asistentes.length === 0 ? '<span class="text-gray-500">(0)</span>' : ''}
            ${q.max_participantes ? `<span class="text-xs text-gray-500">(máx. ${q.max_participantes})</span>` : ''}
        </span>`;

    const partList = document.getElementById('detail-participantes');
    partList.innerHTML = asistentesInfo.length ? asistentesInfo.map(a => {
        const isMe = currentUser && a.user_id === currentUser.id;
        const isOrg = a.user_id === q.creador_id;
        const nombre = a.nombre || 'Runner';
        const apellido = a.apellidos ? a.apellidos.charAt(0) + '.' : '';
        const initials = ((a.nombre || '').charAt(0) + (a.apellidos || '').charAt(0)).toUpperCase() || 'R';
        const photo = a.photo_url || '';
        const statusBadge = getStatusBadge(a.status || 'confirmed');
        return `
        <div class="flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-slate-700/30'}">
            ${photo
                ? `<img src="${escapeHtml(photo)}" class="w-8 h-8 rounded-full object-cover border ${isMe ? 'border-orange-500' : 'border-slate-600'}" alt="Avatar" loading="lazy" />`
                : `<div class="w-8 h-8 rounded-full ${isMe ? 'bg-orange-500' : 'bg-slate-600'} flex items-center justify-center font-bold text-white text-xs">${initials}</div>`
            }
            <div class="flex-1 min-w-0">
                <div class="font-bold text-white text-sm truncate">${nombre} ${apellido} ${isMe ? `<span class="text-orange-400 text-xs">(${t.detailYou})</span>` : ''}${isOrg ? ' <span class="text-orange-400"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></span>' : ''}</div>
            </div>
            <span class="text-sm" title="${statusBadge.text}">${statusBadge.icon}</span>
        </div>`;
    }).join('') : `<div class="text-gray-500 text-center py-2 text-sm">${t.detailBeFirst}</div>`;

    // 💬 Cargar comentarios
    loadQuedadaComments(id);

    // Creador - usar datos del join directo si estan disponibles
    // Para quedadas seed, usar organizador_nombre y organizador_foto
    const creador = q.creador || {};
    const creadorInfoFallback = asistentesInfo.find(a => a.user_id === q.creador_id);
    const creadorEl = document.getElementById('detail-creador');
    const esSeedDetail = q.es_seed === true;

    const cNombre = esSeedDetail && q.organizador_nombre ? q.organizador_nombre.split(' ')[0] : (creador.nombre || creadorInfoFallback?.nombre || 'Runner');
    const cApellidos = esSeedDetail && q.organizador_nombre ? (q.organizador_nombre.split(' ').slice(1).join(' ') || '') : (creador.apellidos || creadorInfoFallback?.apellidos || '');
    const cPhoto = esSeedDetail && q.organizador_foto ? q.organizador_foto : (creador.photo_url || creadorInfoFallback?.photo_url || '');
    const cInitials = ((cNombre).charAt(0) + (cApellidos).charAt(0)).toUpperCase() || 'R';
    const cRating = creador.organizer_rating;
    const cReviews = creador.total_reviews || 0;
    const cOrganized = creador.total_organized || 0;
    const cVerified = creador.verification_badge || false;
    const cPremium = creadorInfoFallback?.es_premium || creador?.es_premium || false;

    // Mostrar organizador: con link clickable si tiene perfil real
    var creadorHasProfile = q.creador_id && !esSeedDetail;
    var creadorInnerHtml = `
        ${cPremium ? '<div class="premium-avatar-border">' : ''}
        ${cPhoto
            ? `<img src="${escapeHtml(cPhoto)}" class="w-12 h-12 rounded-full object-cover border-2 ${cPremium ? 'border-slate-900' : 'border-orange-500'} group-hover:ring-2 group-hover:ring-orange-500/50 transition" alt="Organizador" loading="lazy" />`
            : `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-lg group-hover:ring-2 group-hover:ring-orange-500/50 transition">${cInitials}</div>`
        }
        ${cPremium ? '</div>' : ''}
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-white ${creadorHasProfile ? 'group-hover:text-orange-400' : ''} transition">${cNombre} ${cApellidos ? cApellidos.charAt(0) + '.' : ''}</span>
                ${cVerified ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">✓ ${t.detailVerified}</span>` : ''}
            </div>
            <div class="flex items-center gap-3 mt-1 flex-wrap">
                ${cRating ? `<span class="text-sm text-yellow-400 font-bold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> ${cRating.toFixed(1)} <span class="text-gray-500 font-normal">(${cReviews} ${cReviews === 1 ? t.detailReview : t.detailReviews})</span></span>` : `<span class="text-xs text-gray-500">${t.detailNoReviews}</span>`}
                ${cOrganized > 0 ? `<span class="text-xs text-gray-400">• ${cOrganized} ${cOrganized === 1 ? t.detailRunOrganized : t.detailRunsOrganized}</span>` : ''}
            </div>
        </div>`;

    if(creadorHasProfile){
        creadorEl.innerHTML = `<a href="#perfil/${q.creador_id}" onclick="event.preventDefault();closeModal('modal-quedada-detail');openUserProfile('${q.creador_id}')" class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition group flex-1 min-w-0" title="Ver perfil de ${escapeHtml(cNombre)}" role="link">${creadorInnerHtml}</a>`;
    } else {
        creadorEl.innerHTML = `<div class="flex items-center gap-3 flex-1 min-w-0">${creadorInnerHtml}</div>`;
    }
    
    // Links a mapas
    const lat = q.lat || 40.4168;
    const lng = q.lng || -3.7038;
    document.getElementById('detail-gmaps').href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    document.getElementById('detail-amaps').href = `https://maps.apple.com/?q=${lat},${lng}`;
    
    // Botón de acción - ahora con separación clara
    const actionBtn = document.getElementById('detail-action-btn');
    const leaveDetailBtn = document.getElementById('detail-leave-btn');

    // Crear botón de abandonar si no existe
    if (!leaveDetailBtn) {
        const newLeaveBtn = document.createElement('button');
        newLeaveBtn.id = 'detail-leave-btn';
        newLeaveBtn.className = 'hidden px-4 py-3 rounded-xl font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-sm';
        newLeaveBtn.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> ${t.detailLeave}`;
        actionBtn.parentNode.insertBefore(newLeaveBtn, actionBtn.nextSibling);
    }

    const leaveBtnEl = document.getElementById('detail-leave-btn');

    if (!currentUser) {
        actionBtn.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> ' + t.detailRegisterToJoin;
        actionBtn.className = 'flex-1 min-w-[200px] py-3 rounded-xl font-black text-base bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 transition';
        actionBtn.onclick = () => { closeModal('modal-quedada-detail'); openModal('modal-register'); };
        if (leaveBtnEl) leaveBtnEl.classList.add('hidden');
    } else if (isCreator) {
        // El creador ve "Tu quedada" con opción de editar/eliminar
        actionBtn.innerHTML = `<span class="flex items-center justify-center gap-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> ${t.detailYourRun}</span>`;
        actionBtn.className = 'flex-1 min-w-[180px] py-3 rounded-xl font-black text-base bg-orange-500/20 text-orange-400 border-2 border-orange-500/40 cursor-default';
        actionBtn.onclick = null;

        // Botón de eliminar para el creador
        if (leaveBtnEl) {
            leaveBtnEl.classList.remove('hidden');
            leaveBtnEl.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> ${t.detailDeleteRun}`;
            leaveBtnEl.className = 'px-4 py-3 rounded-xl font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-sm';
            leaveBtnEl.onclick = () => {
                document.getElementById('leave-quedada-id').value = id;
                const confirmText = document.getElementById('leave-confirm-text');
                confirmText.innerHTML = '<span class="text-yellow-400 font-bold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Eres el creador de esta quedada.</span><br>¿Estás seguro de que quieres eliminarla? Esta acción no se puede deshacer.';
                closeModal('modal-quedada-detail');
                openModal('modal-leave-confirm');
            };
        }
    } else if (isJoined) {
        // Obtener estado actual del usuario
        const myParticipation = asistentesInfo.find(a => a.user_id === currentUser.id);
        const myStatus = myParticipation?.status || 'confirmed';
        const statusBadge = getStatusBadge(myStatus);

        // Botón principal: mostrar estado actual y permitir cambiarlo
        actionBtn.innerHTML = `<span class="flex items-center justify-center gap-2">${statusBadge.icon} ${statusBadge.text} <span class="text-xs opacity-70">(${t.detailChange})</span></span>`;
        actionBtn.className = `flex-1 min-w-[180px] py-3 rounded-xl font-black text-base border-2 ${statusBadge.class} hover:opacity-80 transition`;
        actionBtn.onclick = () => { closeModal('modal-quedada-detail'); openAttPropertyModal(id); };

        // Botón secundario: abandonar (visible y distintivo)
        if (leaveBtnEl) {
            leaveBtnEl.classList.remove('hidden');
            leaveBtnEl.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> ${t.detailLeave}`;
            leaveBtnEl.className = 'px-4 py-3 rounded-xl font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-sm';
            leaveBtnEl.onclick = () => {
                document.getElementById('leave-quedada-id').value = id;
                const confirmText = document.getElementById('leave-confirm-text');
                confirmText.textContent = currentLang === 'en' ? 'Are you sure you want to leave this run?' : '¿Seguro que quieres abandonar esta quedada?';
                closeModal('modal-quedada-detail');
                openModal('modal-leave-confirm');
            };
        }
    } else if (q.max_participantes && detailConfirmed >= q.max_participantes) {
        // Quedada completa
        actionBtn.innerHTML = `<span class="flex items-center justify-center gap-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg> Completa (${detailConfirmed}/${q.max_participantes})</span>`;
        actionBtn.className = 'flex-1 min-w-[200px] py-3 rounded-xl font-black text-base bg-red-500/20 text-red-400 border-2 border-red-500/40 cursor-not-allowed';
        actionBtn.onclick = null;
        if (leaveBtnEl) leaveBtnEl.classList.add('hidden');
    } else {
        actionBtn.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> ' + t.detailJoinRun;
        actionBtn.className = 'flex-1 min-w-[200px] py-3 rounded-xl font-black text-base bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 transition';
        actionBtn.onclick = () => { closeModal('modal-quedada-detail'); openAttendanceModal(id); };
        if (leaveBtnEl) leaveBtnEl.classList.add('hidden');
    }

    // Función helper para abrir modal de asistencia desde detalle
    window.openAttPropertyModal = function(qId) {
        openAttendanceModal(qId);
    };

    // Botón de valorar (solo si quedada pasada, usuario participó, y no es el creador)
    const rateBtn = document.getElementById('detail-rate-btn');
    const today = new Date().toISOString().split('T')[0];
    const isPast = q.fecha < today;
    const canRate = currentUser && isPast && isJoined && !isCreator;

    if (canRate) {
        rateBtn.classList.remove('hidden');
        rateBtn.onclick = () => { closeModal('modal-quedada-detail'); openRatingModal(id); };
    } else {
        rateBtn.classList.add('hidden');
    }

    // Abrir modal
    openModal('modal-quedada-detail');
    // Deep link: actualizar URL
    try{ history.pushState({cj:'quedada',id:id}, '', '#quedada/' + id); }catch(_){}

    // Inicializar mapa después de abrir el modal
    ensureLeaflet().then(() => setTimeout(() => {
        const mapContainer = document.getElementById('detail-map');
        if (!mapContainer) return;

        if (detailMap) {
            detailMap.remove();
            detailMap = null;
        }

        detailMap = L.map('detail-map', { zoomControl: false, scrollWheelZoom: false, attributionControl: false }).setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ''
        }).addTo(detailMap);

        const icon = L.divIcon({
            html: `<div style="background:linear-gradient(135deg,#f97316,#ea580c);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="font-size:14px"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></span></div>`,
            className: '', iconSize: [32, 32], iconAnchor: [16, 16]
        });
        detailMarker = L.marker([lat, lng], { icon }).addTo(detailMap);

        // PREMIUM: Show GPS route polyline if available
        if (q.ruta_coords && Array.isArray(q.ruta_coords) && q.ruta_coords.length >= 2) {
            try {
                const routeLatLngs = q.ruta_coords.map(c => [c.lat || c[0], c.lng || c[1]]);
                L.polyline(routeLatLngs, {
                    color: '#f97316',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '10, 6',
                    lineCap: 'round'
                }).addTo(detailMap);
                // Fit map to show full route
                const bounds = L.latLngBounds(routeLatLngs);
                detailMap.fitBounds(bounds.pad(0.15));
            } catch(routeErr) {
                console.warn('Error rendering route:', routeErr);
            }
        }

        setTimeout(() => detailMap.invalidateSize(), 100);
    }, 200));

    // PREMIUM: Show post-run button for past quedadas (premium users)
    const postRunBtn = document.getElementById('detail-postrun-btn');
    if (!postRunBtn) {
        // Create post-run button if not exists
        const rateBtn = document.getElementById('detail-rate-btn');
        if (rateBtn) {
            const btn = document.createElement('button');
            btn.id = 'detail-postrun-btn';
            btn.className = 'hidden px-4 py-3 rounded-xl font-bold bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition flex items-center justify-center gap-2 text-sm';
            btn.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg> Registrar mi rendimiento';
            rateBtn.parentNode.insertBefore(btn, rateBtn);
        }
    }
    const postRunBtnEl = document.getElementById('detail-postrun-btn');
    const today2 = new Date().toISOString().split('T')[0];
    const isPast2 = q.fecha < today2;
    const canPostRun = currentUser && isPast2 && isJoined && isUserPremium;
    if (postRunBtnEl) {
        if (canPostRun) {
            postRunBtnEl.classList.remove('hidden');
            postRunBtnEl.onclick = () => { closeModal('modal-quedada-detail'); openPostRunModal(id); };
        } else {
            postRunBtnEl.classList.add('hidden');
        }
    }

    // Show private badge in detail
    const detailPrivateBadge = document.getElementById('detail-private-badge');
    if (q.is_private) {
        if (!detailPrivateBadge) {
            const badge = document.createElement('span');
            badge.id = 'detail-private-badge';
            badge.className = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30';
            badge.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Privada';
            const nivelBadgeEl = document.getElementById('detail-nivel-badge');
            if (nivelBadgeEl && nivelBadgeEl.parentNode) {
                nivelBadgeEl.parentNode.insertBefore(badge, nivelBadgeEl.nextSibling);
            }
        } else {
            detailPrivateBadge.classList.remove('hidden');
        }
    } else if (detailPrivateBadge) {
        detailPrivateBadge.classList.add('hidden');
    }
}

function renderCityChips(){
    const wrap = document.getElementById('city-chips');
    if(!wrap) return;

    // Obtener bandera del país del usuario (using unified COUNTRY_CODE_FLAGS)
    const countryFlag = COUNTRY_CODE_FLAGS[userCountry] || '🌍';

    // Obtener traducciones — guard against i18n not loaded yet
    const t = I18N[currentLang] || I18N.es;
    if(!t) return;

    // Filtros simplificados: Mi ciudad → Mi país → Mundial
    const filterOptions = [
        {label: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ' + (t.geoMyCity || 'Mi ciudad'), value: 'city'},
        {label: countryFlag + ' ' + (t.geoMyCountry || 'Mi país'), value: 'country'},
        {label: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ' + (t.geoWorldwide || 'Mundial'), value: 'all'}
    ];

    wrap.innerHTML = '';
    const mkChip = (label, value, active=false) => {
        const div = document.createElement('div');
        div.className = 'chip px-6 py-2.5 rounded-full bg-slate-800 text-sm font-bold whitespace-nowrap' + (active ? ' active' : '');
        div.innerHTML = label;
        div.onclick = () => filterBy(value, div);
        return div;
    };
    filterOptions.forEach(opt => wrap.appendChild(mkChip(opt.label, opt.value, currentFilter===opt.value)));
}

// ========== CONFIGURACIÓN DE NOTIFICACIONES (BIENVENIDA) ==========

async function filterBy(filter, el){
    currentFilter = filter;
    // Activar botón de localización para filtro ciudad
    setLocateBtnActive(filter === 'city');

    // UI
    document.querySelectorAll('#city-chips .chip').forEach(c=>c.classList.remove('active'));
    if(el) el.classList.add('active');

    // Si no tenemos ubicación, obtenerla
    if (!userLoc) {
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });
            userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            // Detectar país del usuario
            try {
                await detectUserCountry(userLoc.lat, userLoc.lng);
                renderCityChips(); // Actualizar bandera
            } catch(e) {}
        } catch (e) {
            console.warn('No se pudo obtener ubicación:', e);
            if(filter === 'city') {
                showToast('Activa la ubicación para ver tu ciudad', 'warning');
            }
        }
    }

    // Manejar los 3 filtros: city, country, all
    if(filter === 'city' && map){
        // Mi ciudad: centrar en ubicación del usuario con zoom cercano
        geoFilterMode = 'country';
        if(userLoc) {
            try{ map.invalidateSize(true); }catch(e){}
            try{ map.flyTo([userLoc.lat, userLoc.lng], 12, {duration: 0.8}); }catch(e){ map.setView([userLoc.lat, userLoc.lng], 12); }
        } else {
            // Sin ubicación, mostrar el país
            const center = getCountryCenter(userCountry);
            try{ map.flyTo([center.lat, center.lng], center.zoom, {duration: 0.8}); }catch(e){}
        }
    }
    else if(filter === 'country' && map){
        // Mi país: centrar en la capital del país con zoom 5 (~300km visible)
        geoFilterMode = 'country';
        const center = getCountryCenter(userCountry);
        try{ map.invalidateSize(true); }catch(e){}
        try{ map.flyTo([center.lat, center.lng], 5, {duration: 0.8}); }catch(e){ map.setView([center.lat, center.lng], 5); }
    }
    else if(filter === 'all'){
        // Mundial: mostrar mapa del mundo completo
        geoFilterMode = 'all';
        if(map){
            try{ map.invalidateSize(true); }catch(e){}
            map.setView([20, 0], 2);
        }
    }

    renderQuedadas();
    updateMarkers();
}

// ========== SISTEMA DE PÁGINA DE CIUDAD ==========
let currentCiudad = null;
let ciudadQuedadas = [];
let ciudadRunners = [];

function openCiudadView(ciudad) {
    if (!ciudad) return;
    currentCiudad = ciudad;

    // Actualizar URL sin recargar
    const url = new URL(window.location.href);
    url.searchParams.set('ciudad', ciudad);
    window.history.pushState({ ciudad: ciudad }, '', url);

    // Mostrar vista
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-ciudad').classList.add('active');

    // Actualizar títulos
    document.getElementById('ciudad-nombre').textContent = ciudad;
    document.getElementById('ciudad-nombre-sub').textContent = ciudad;

    // Cargar datos
    loadCiudadData(ciudad);
}

function closeCiudadView() {
    currentCiudad = null;

    // Limpiar URL
    const url = new URL(window.location.href);
    url.searchParams.delete('ciudad');
    window.history.pushState({}, '', url);

    // Volver a la vista correcta
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    if (currentUser) {
        document.getElementById('view-app').classList.add('active');
    } else {
        document.getElementById('view-landing').classList.add('active');
    }
}

function switchCiudadTab(tab) {
    // Actualizar chips
    document.querySelectorAll('#view-ciudad .chip').forEach(c => c.classList.remove('active'));
    document.getElementById('ciudad-tab-' + tab).classList.add('active');

    // Mostrar contenido
    document.querySelectorAll('.ciudad-tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('ciudad-content-' + tab).classList.remove('hidden');
}

async function loadCiudadData(ciudad) {
    const sb = await getSupabaseClientOrToast(10000, true);
    if (!sb) return;

    try {
        // Cargar quedadas de la ciudad
        const { data: quedadasData, error: qError } = await window.supabaseClient
            .from('quedadas')
            .select('id,titulo,ciudad,ubicacion,direccion,lat,lng,fecha,hora,nivel,distancia,ritmo,descripcion,creador_id,created_at,participantes(user_id,status,profiles!participantes_user_id_fkey_profiles(id,nombre,apellidos,photo_url))')
            .ilike('ciudad', ciudad)
            .gte('fecha', new Date().toISOString().split('T')[0])
            .order('fecha', { ascending: true });

        if (qError) throw qError;
        ciudadQuedadas = quedadasData || [];

        // Cargar runners de la ciudad (buscar en ubicacion que contenga el nombre de la ciudad)
        const { data: runnersData, error: rError } = await window.supabaseClient
            .from('profiles')
            .select('id, nombre, apellidos, photo_url, nivel, ubicacion, verified_level, verification_badge, organizer_rating, total_reviews')
            .ilike('ubicacion', `*${ciudad}*`)
            .limit(50);

        if (rError) throw rError;
        ciudadRunners = runnersData || [];

        // Actualizar stats
        document.getElementById('ciudad-stat-quedadas').textContent = ciudadQuedadas.length;
        document.getElementById('ciudad-stat-runners').textContent = ciudadRunners.length;

        // Calcular nivel más común
        const niveles = ciudadRunners.map(r => r.nivel).filter(Boolean);
        if (niveles.length > 0) {
            const nivelCount = {};
            niveles.forEach(n => nivelCount[n] = (nivelCount[n] || 0) + 1);
            const topNivel = Object.entries(nivelCount).sort((a, b) => b[1] - a[1])[0][0];
            const nivelEmoji = { 'Principiante': '<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span>', 'Intermedio': '<span style="width:8px;height:8px;border-radius:50%;background:#eab308;display:inline-block"></span>', 'Avanzado': '<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span>', 'Elite': '<span style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;display:inline-block"></span>' };
            document.getElementById('ciudad-stat-nivel').textContent = (nivelEmoji[topNivel] || '') + ' ' + (topNivel || '-');
        } else {
            document.getElementById('ciudad-stat-nivel').textContent = '-';
        }

        // Renderizar quedadas
        renderCiudadQuedadas();

        // Renderizar runners
        renderCiudadRunners();

    } catch (err) {
        console.error('Error cargando datos de ciudad:', err);
        showToast('Error al cargar datos', 'error');
    }
}

function renderCiudadQuedadas() {
    const container = document.getElementById('ciudad-lista-quedadas');
    const noData = document.getElementById('ciudad-no-quedadas');

    if (!ciudadQuedadas || ciudadQuedadas.length === 0) {
        container.innerHTML = '';
        noData.classList.remove('hidden');
        return;
    }

    noData.classList.add('hidden');

    // Reusar la lógica de renderQuedadas pero simplificada
    container.innerHTML = ciudadQuedadas.map(q => {
        const creador = q.creador || {};
        const participantes = q.participantes || [];
        const confirmedCount = participantes.filter(p => p.status === 'confirmed').length;
        const maybeCount = participantes.filter(p => p.status === 'maybe').length;
        const interestedCount = participantes.filter(p => p.status === 'interested').length;

        const isJoined = currentUser && participantes.some(p => p.user_id === currentUser.id);
        // NOTA: Las quedadas seed NUNCA son "Tu quedada"
        const isCreator = currentUser && q.creador_id === currentUser.id && !q.es_seed;

        const nivelColors = {
            'Principiante': 'bg-green-500/20 text-green-400',
            'Intermedio': 'bg-yellow-500/20 text-yellow-400',
            'Avanzado': 'bg-red-500/20 text-red-400',
            'Elite': 'bg-purple-500/20 text-purple-400',
            'Todos': 'bg-slate-500/20 text-slate-300'
        };
        const nivelClass = nivelColors[q.nivel] || nivelColors['Todos'];

        // Rating del organizador
        let ratingHtml = '';
        if (creador.organizer_rating) {
            ratingHtml = `<span class="text-yellow-400"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> ${creador.organizer_rating}</span>`;
            if (creador.total_reviews) {
                ratingHtml += `<span class="text-gray-500">(${creador.total_reviews})</span>`;
            }
        }

        // Badge verificado
        let verifiedBadge = '';
        if (creador.verification_badge) {
            verifiedBadge = '<span class="text-blue-400 ml-1" title="Nivel verificado">✓</span>';
        }

        return `
        <div class="card-quedada p-5 rounded-2xl cursor-pointer ${isJoined ? 'joined ring-2 ring-orange-500/50' : ''}" onclick="openQuedadaDetail('${q.id}')">
            ${isJoined ? '<div class="joined-badge absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">✓ Apuntado</div>' : ''}
            <div class="flex items-start justify-between mb-3">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${nivelClass}">${q.nivel || 'Todos'}</span>
                <span class="text-gray-500 text-sm">${formatDate(q.fecha)}</span>
            </div>
            <h3 class="font-bold text-lg mb-2">${q.titulo}</h3>
            <div class="space-y-1 text-sm text-gray-400">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    <span>${q.ubicacion || q.ciudad || 'Sin ubicación'}</span>
                </div>
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>${formatHora(q.hora)}</span>
                </div>
                ${q.distancia ? `<div class="flex items-center gap-2"><span class="text-orange-500"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></span><span>${q.distancia} km</span></div>` : ''}
            </div>
            <div class="flex items-center gap-2 mt-3 text-sm">
                <span class="text-green-400" title="Confirmados"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> ${confirmedCount}</span>
                ${maybeCount > 0 ? `<span class="text-yellow-400" title="Posiblemente"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${maybeCount}</span>` : ''}
                ${interestedCount > 0 ? `<span class="text-blue-400" title="Interesados"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> ${interestedCount}</span>` : ''}
            </div>
            <div class="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
                <img src="${creador.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((creador.nombre || 'U') + ' ' + (creador.apellidos || ''))}" alt="${creador.nombre || 'Organizador'}" class="w-8 h-8 rounded-full object-cover border-2 border-slate-600">
                <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-500">Organiza</div>
                    <div class="text-sm font-bold truncate">
                        ${creador.nombre || 'Anónimo'} ${verifiedBadge}
                        ${ratingHtml}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderCiudadRunners() {
    const container = document.getElementById('ciudad-lista-runners');
    const noData = document.getElementById('ciudad-no-runners');

    if (!ciudadRunners || ciudadRunners.length === 0) {
        container.innerHTML = '';
        noData.classList.remove('hidden');
        return;
    }

    noData.classList.add('hidden');

    container.innerHTML = ciudadRunners.map(r => {
        const nivelColors = {
            'Principiante': 'bg-green-500/20 text-green-400',
            'Intermedio': 'bg-yellow-500/20 text-yellow-400',
            'Avanzado': 'bg-red-500/20 text-red-400',
            'Elite': 'bg-purple-500/20 text-purple-400'
        };
        const nivelClass = nivelColors[r.nivel] || 'bg-slate-500/20 text-slate-300';

        let verifiedBadge = '';
        if (r.verification_badge) {
            verifiedBadge = '<span class="text-blue-400 ml-1" title="Nivel verificado">✓</span>';
        }

        let ratingHtml = '';
        if (r.organizer_rating) {
            ratingHtml = `<div class="text-xs text-yellow-400 mt-1"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> ${r.organizer_rating} (${r.total_reviews || 0} reseñas)</div>`;
        }

        return `
        <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-orange-500/30 transition">
            <div class="flex items-center gap-3">
                <img src="${r.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((r.nombre || 'U') + ' ' + (r.apellidos || ''))}" alt="${r.nombre}" class="w-12 h-12 rounded-full object-cover border-2 border-slate-600">
                <div class="flex-1 min-w-0">
                    <div class="font-bold truncate">${r.nombre || 'Runner'} ${r.apellidos || ''} ${verifiedBadge}</div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold ${nivelClass}">${r.nivel || 'Sin nivel'}</span>
                    ${ratingHtml}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Detectar parámetro ciudad al cargar la página
function checkCiudadParam() {
    const params = new URLSearchParams(window.location.search);
    const ciudad = params.get('ciudad');
    if (ciudad) {
        // Esperar a que cargue la app y luego abrir la vista de ciudad
        setTimeout(() => openCiudadView(ciudad), 500);
    }
}

// Manejar navegación del historial (Atrás/Adelante)
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.ciudad) {
        openCiudadView(event.state.ciudad);
    } else if (currentCiudad) {
        closeCiudadView();
    }
    // Deep link modals: cerrar si el usuario pulsa Atrás
    if(event.state && event.state.cj === 'quedada' && event.state.id){
        openQuedadaDetail(event.state.id);
    } else if(event.state && event.state.cj === 'perfil' && event.state.id){
        openUserProfile(event.state.id);
    } else if(event.state && event.state.cj === 'ranking'){
        openRankingModal();
    } else {
        // Si volvemos a un estado sin cj, cerrar modales de deep link
        try{ var _qdEl=document.getElementById('modal-quedada-detail'); if(_qdEl&&_qdEl.classList.contains('active')) closeModal('modal-quedada-detail'); }catch(_){}
        try{ var _upEl=document.getElementById('modal-user-profile'); if(_upEl&&_upEl.classList.contains('active')) closeModal('modal-user-profile'); }catch(_){}
        try{ var _rkEl=document.getElementById('modal-ranking'); if(_rkEl&&_rkEl.classList.contains('active')) closeModal('modal-ranking'); }catch(_){}
        // Cerrar preview si está abierto (landing sin login)
        try{ var _qpEl=document.getElementById('modal-quedada-preview'); if(_qpEl&&!_qpEl.classList.contains('hidden')) _qpEl.classList.add('hidden'); }catch(_){}
    }
});

// ========== SISTEMA DE CONFIRMACIÓN DE ASISTENCIA ==========

function openAttendanceModal(quedadaId) {
    if (!currentUser) {
        showToast(I18N[currentLang]?.needRegister || 'Debes registrarte', 'error');
        openModal('modal-register');
        return;
    }

    // PREMIUM: Private quedada — require access code first
    const qCheck = quedadas.find(x => x.id === quedadaId);
    if (qCheck && qCheck.is_private && qCheck.access_code) {
        const asistCheck = Array.isArray(qCheck.asistentes_info) ? qCheck.asistentes_info : [];
        const alreadyIn = asistCheck.some(a => a.user_id === currentUser.id);
        const isQCreator = qCheck.creador_id === currentUser.id;
        if (!alreadyIn && !isQCreator) {
            // Show private code modal instead
            document.getElementById('private-join-quedada-id').value = quedadaId;
            document.getElementById('private-join-code').value = '';
            openModal('modal-private-code');
            return;
        }
    }

    document.getElementById('attendance-quedada-id').value = quedadaId;

    // Buscar la quedada y verificar si el usuario ya está apuntado
    const q = quedadas.find(x => x.id === quedadaId);
    const asistentesInfo = q ? (Array.isArray(q.asistentes_info) ? q.asistentes_info : []) : [];
    const myParticipation = asistentesInfo.find(a => a.user_id === currentUser.id);
    const isJoined = !!myParticipation;
    const currentStatus = myParticipation?.status || 'confirmed';

    document.getElementById('attendance-is-joined').value = isJoined ? 'true' : 'false';

    // Elementos del modal
    const iconEl = document.getElementById('attendance-icon');
    const titleEl = document.getElementById('attendance-title');
    const subtitleEl = document.getElementById('attendance-subtitle');
    const currentStatusEl = document.getElementById('attendance-current-status');
    const currentIconEl = document.getElementById('attendance-current-icon');
    const currentTextEl = document.getElementById('attendance-current-text');
    const leaveBtn = document.getElementById('btn-leave-quedada');

    // Ocultar indicadores de estado actual
    document.getElementById('check-confirmed').classList.add('hidden');
    document.getElementById('check-maybe').classList.add('hidden');
    document.getElementById('check-interested').classList.add('hidden');

    if (isJoined) {
        // Usuario ya está apuntado - mostrar opciones de cambio
        titleEl.textContent = 'Cambiar mi estado';
        subtitleEl.textContent = 'Actualiza tu nivel de compromiso';

        // Mostrar estado actual
        const statusBadge = getStatusBadge(currentStatus);
        currentStatusEl.classList.remove('hidden');
        currentStatusEl.className = `mt-3 px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-bold ${statusBadge.class}`;
        currentIconEl.innerHTML = statusBadge.icon;
        currentTextEl.textContent = `Estado actual: ${statusBadge.text}`;

        // Marcar el estado actual
        document.getElementById(`check-${currentStatus}`).classList.remove('hidden');

        // Mostrar botón de abandonar
        leaveBtn.classList.remove('hidden');

        // Cambiar icono del header según estado
        const statusIcons = { confirmed: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>', maybe: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', interested: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>' };
        iconEl.innerHTML = `<span class="text-3xl">${statusIcons[currentStatus] || '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'}</span>`;
    } else {
        // Usuario no está apuntado - mostrar opciones para unirse
        titleEl.textContent = '¿Cómo de seguro estás?';
        subtitleEl.textContent = 'Ayuda al organizador a planificar';
        currentStatusEl.classList.add('hidden');
        leaveBtn.classList.add('hidden');
        iconEl.innerHTML = '<span class="text-3xl"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></span>';
    }

    openModal('modal-attendance');
}

// Abrir modal de confirmación para abandonar (desde modal de asistencia)
function openLeaveConfirmModal() {
    const quedadaId = document.getElementById('attendance-quedada-id').value;
    if (!quedadaId) return;

    document.getElementById('leave-quedada-id').value = quedadaId;

    // Verificar si es el creador (no aplica a quedadas seed)
    const q = quedadas.find(x => x.id === quedadaId);
    const isCreator = !!(currentUser && q && q.creador_id && currentUser.id === q.creador_id && !q.es_seed);

    const confirmText = document.getElementById('leave-confirm-text');
    if (isCreator) {
        confirmText.innerHTML = '<span class="text-yellow-400 font-bold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Eres el creador de esta quedada.</span><br>Si la abandonas y no queda nadie, se eliminará automáticamente.';
    } else {
        confirmText.textContent = '¿Seguro que quieres abandonar esta quedada?';
    }

    closeModal('modal-attendance');
    openModal('modal-leave-confirm');
}

// Abrir modal de confirmación para abandonar (desde tarjeta de quedada)
function openLeaveConfirmFromCard(quedadaId) {
    if (!quedadaId || !currentUser) return;

    document.getElementById('leave-quedada-id').value = quedadaId;

    // Verificar si es el creador (no aplica a quedadas seed)
    const q = quedadas.find(x => x.id === quedadaId);
    const isCreator = !!(currentUser && q && q.creador_id && currentUser.id === q.creador_id && !q.es_seed);

    const confirmText = document.getElementById('leave-confirm-text');
    if (isCreator) {
        confirmText.innerHTML = '<span class="text-yellow-400 font-bold"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Eres el creador de esta quedada.</span><br>Si la abandonas y no queda nadie, se eliminará automáticamente.';
    } else {
        confirmText.textContent = '¿Seguro que quieres abandonar esta quedada?';
    }

    openModal('modal-leave-confirm');
}

// Confirmar abandono de quedada
async function confirmLeaveQuedada() {
    const quedadaId = document.getElementById('leave-quedada-id').value;
    if (!quedadaId || !currentUser) return;

    closeModal('modal-leave-confirm');

    const sb = await getSupabaseClientOrToast(12000, true);
    if (!sb) return;

    try {
        // Intentar usar RPC primero
        let rpcSuccess = false;
        try {
            const { data: rpcData, error: rpcErr } = await window.supabaseClient
              .rpc('cancelar_participacion', { p_quedada_id: quedadaId });

            if (!rpcErr) {
                rpcSuccess = true;
                showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
            }
        } catch(rpcE) {
            console.warn('RPC no disponible, usando delete directo:', rpcE);
        }

        // Fallback: delete directo si RPC no funciona
        if (!rpcSuccess) {
            const { error: delErr } = await window.supabaseClient
              .from('participantes')
              .delete()
              .eq('quedada_id', quedadaId)
              .eq('user_id', currentUser.id);

            if (delErr) {
                console.error('Error saliendo:', delErr);
                showToast(delErr.message,'error');
                return;
            }

            showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
        }

        await loadQuedadas();
    } catch(e) {
        CJ.handleApiError(e, 'leaveQuedada');
    }
}

async function confirmAttendance(status) {
    const quedadaId = document.getElementById('attendance-quedada-id').value;
    console.log('confirmAttendance llamada:', { status, quedadaId, currentUser: currentUser?.id });

    if (!quedadaId) {
        console.error('No hay quedadaId');
        showToast('Error: No se encontró la quedada', 'error');
        return;
    }
    if (!currentUser) {
        console.error('No hay usuario');
        showToast('Debes iniciar sesión', 'error');
        openModal('modal-login');
        return;
    }

    closeModal('modal-attendance');

    const sb = await getSupabaseClientOrToast(12000, true);
    if (!sb) {
        console.error('No se pudo conectar a Supabase');
        return;
    }

    try {
        // Verificar si la quedada tiene límite de participantes y está llena
        const q = quedadas.find(x => x.id === quedadaId);
        if (q && q.max_participantes) {
            const asistentesInfo = Array.isArray(q.asistentes_info) ? q.asistentes_info : [];
            const confirmedCount = asistentesInfo.filter(a => a.status === 'confirmed' || !a.status).length;
            const alreadyJoined = currentUser && asistentesInfo.some(a => a.user_id === currentUser.id);
            if (!alreadyJoined && confirmedCount >= q.max_participantes && status === 'confirmed') {
                showToast('Esta quedada está completa (máximo ' + q.max_participantes + ' runners)', 'error');
                return;
            }
        }

        // Verificar si ya está apuntado
        const { data: exists, error: checkError } = await window.supabaseClient
            .from('participantes')
            .select('id, status')
            .eq('quedada_id', quedadaId)
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (checkError) {
            console.error('Error verificando participación:', checkError);
            throw checkError;
        }

        console.log('Participación existente:', exists);

        if (exists) {
            // Actualizar estado existente
            const { error } = await window.supabaseClient
                .from('participantes')
                .update({ status: status })
                .eq('id', exists.id);

            if (error) {
                console.error('Error actualizando:', error);
                throw error;
            }
            showToast(getStatusMessage(status, 'updated', quedadaId), 'success');
        } else {
            // Crear nueva participación
            console.log('Insertando nueva participación:', { quedada_id: quedadaId, user_id: currentUser.id, status });
            const { data: insertData, error } = await window.supabaseClient
                .from('participantes')
                .insert({ quedada_id: quedadaId, user_id: currentUser.id, status: status })
                .select();

            if (error) {
                console.error('Error insertando:', error);
                throw error;
            }
            console.log('Insertado:', insertData);
            showConfetti(); // 🎉 Celebración al unirse

            // Vibración háptica en móviles (feedback físico)
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            // 🎯 Dopamine feedback: show enriched toast with other participants
            try {
                const sb2 = window.supabaseClient;
                if (sb2) {
                    const { data: others } = await sb2
                        .from('participantes')
                        .select('user_id')
                        .eq('quedada_id', quedadaId)
                        .eq('status', 'confirmed')
                        .neq('user_id', currentUser.id)
                        .limit(3);

                    let dopamineMsg = currentLang === 'en' ? '🎉 You\'re in!' : '🎉 ¡Ya estás dentro!';
                    if (others && others.length > 0) {
                        const otherIds = others.map(o => o.user_id);
                        const { data: profiles } = await sb2
                            .from('profiles')
                            .select('id, nombre')
                            .in('id', otherIds);
                        if (profiles && profiles.length > 0) {
                            const names = profiles.map(p => p.nombre).filter(Boolean);
                            if (names.length === 1) {
                                dopamineMsg += currentLang === 'en' ? ` ${names[0]} is also going.` : ` ${names[0]} también asistirá.`;
                            } else if (names.length > 1) {
                                dopamineMsg += currentLang === 'en'
                                    ? ` ${names[0]} and ${names.length - 1} more are also going.`
                                    : ` ${names[0]} y ${names.length - 1} más también asistirán.`;
                            }
                        }
                    }
                    dopamineMsg += currentLang === 'en' ? ' We\'ll remind you before it starts.' : ' Te avisaremos antes de salir.';
                    showToast(dopamineMsg, 'success');
                } else {
                    showToast(getStatusMessage(status, 'joined', quedadaId), 'success');
                }
            } catch (dErr) {
                console.warn('Dopamine toast error:', dErr);
                showToast(getStatusMessage(status, 'joined', quedadaId), 'success');
            }

            // Update active mission card if user just joined the mission quedada
            try { loadActiveMission(); } catch(_) {}

            // Incrementar contador de joins y verificar si mostrar prompt de notificaciones
            if (typeof incrementJoinCount === 'function') {
                const joinCount = incrementJoinCount();
                if (joinCount === 1 && typeof checkShowNotificationPrompt === 'function') {
                    checkShowNotificationPrompt();
                }
            }
        }

        await loadQuedadas();
    } catch (err) {
        console.error('Error en confirmAttendance:', err);
        showToast('Error: ' + (err.message || 'No se pudo actualizar'), 'error');
    }
}

function getStatusMessage(status, action, quedadaId = null) {
    // Obtener número de runners en la quedada para mensaje más informativo
    let runnerCount = 0;
    if (quedadaId) {
        const q = quedadas.find(x => x.id === quedadaId);
        if (q && q.asistentes_ids) {
            runnerCount = q.asistentes_ids.length;
        }
    }

    const runnersText = runnerCount > 0 ? ` (${runnerCount + 1} runners confirmados)` : '';

    const messages = {
        confirmed: {
            joined: `🎉 ¡Confirmado! Te esperamos${runnersText}`,
            updated: '✅ Estado: Confirmado - ¡Nos vemos allí!'
        },
        maybe: {
            joined: '🤔 Apuntado como "Posiblemente" - Confirma cuando puedas',
            updated: '🤔 Estado: Posiblemente - El organizador lo tendrá en cuenta'
        },
        interested: {
            joined: '👀 Marcado como interesado - Te avisaremos de novedades',
            updated: '👀 Estado: Interesado'
        }
    };
    return messages[status]?.[action] || 'Actualizado';
}

function getStatusBadge(status) {
    const badges = {
        confirmed: { icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>', text: 'Confirmado', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
        maybe: { icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', text: 'Posiblemente', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        interested: { icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>', text: 'Interesado', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    };
    return badges[status] || badges.confirmed;
}

async function toggleJoin(id){
    if(!currentUser){
        showToast(I18N[currentLang]?.needRegister || 'Debes registrarte','error');
        openModal('modal-register');
        return;
    }
    const sb = await getSupabaseClientOrToast(12000, true);
    if(!sb) return;

    const q = Array.isArray(quedadas) ? quedadas.find(x => x.id === id) : null;
    if(!q) { showToast('Quedada no encontrada', 'error'); return; }

    // NOTA: Las quedadas seed NUNCA son "Tu quedada"
    const isCreator = !!(q.creador_id && currentUser.id === q.creador_id && !q.es_seed);

    try {
        // comprobar si ya está apuntado
        const { data: exists, error: eExists } = await window.supabaseClient
          .from('participantes')
          .select('id')
          .eq('quedada_id', id)
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if(eExists){
            console.error('Error verificando participación:', eExists);
            showToast(eExists.message,'error');
            return;
        }

        if(exists){
            // SALIR de la quedada
            const msg = isCreator
              ? (currentLang==='en'?'If you leave as host and no one remains, the run will be deleted. Continue?':(currentLang==='pt'?'Se saíres como criador e não ficar ninguém, o encontro será apagado. Continuar?':'Si sales como creador y no queda nadie, la quedada se eliminará. ¿Continuar?'))
              : (I18N[currentLang]?.confirmLeave || (currentLang==='en'?'Are you sure you want to leave this run?':(currentLang==='pt'?'Tens a certeza que queres sair deste encontro?':'¿Seguro que deseas cancelar esta quedada?')));
            if(!window.confirm(msg)) return;

            // Intentar usar RPC primero, si falla usar delete directo
            let rpcSuccess = false;
            try {
                const { data: rpcData, error: rpcErr } = await window.supabaseClient
                  .rpc('cancelar_participacion', { p_quedada_id: id });

                if(!rpcErr){
                    rpcSuccess = true;
                    showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
                }
            } catch(rpcE) {
                console.warn('RPC no disponible, usando delete directo:', rpcE);
            }

            // Fallback: delete directo si RPC no funciona
            if(!rpcSuccess){
                const { error: delErr } = await window.supabaseClient
                  .from('participantes')
                  .delete()
                  .eq('quedada_id', id)
                  .eq('user_id', currentUser.id);

                if(delErr){ 
                    console.error('Error saliendo:', delErr);
                    showToast(delErr.message,'error'); 
                    return; 
                }
                
                showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
            }

        } else {
            // UNIRSE a la quedada
            console.log('Uniéndose a quedada:', id);
            const { error: eIns } = await window.supabaseClient
              .from('participantes')
              .insert([{ quedada_id: id, user_id: currentUser.id }]);

            if(eIns){
                console.error('Error uniéndose:', eIns);
                showToast(eIns.message,'error');
                return;
            }
            showToast(I18N[currentLang]?.joined || (currentLang==='en'?'You joined the run':(currentLang==='pt'?'Juntaste-te ao encontro':'¡Te has unido a la quedada!')),'success');
            showConfetti(); // 🎉 Celebración
        }

        await loadQuedadas();
    } catch(e) {
        CJ.handleApiError(e, 'toggleJoin');
    }
}


async function saveQuedada(){
    const btn = document.querySelector('#modal-crear button[onclick="saveQuedada()"]');
    const btnText = btn ? btn.textContent : '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg> Publicar';

    if(!currentUser){showToast('Debes registrarte','error');closeModal('modal-crear');openModal('modal-register');return;}

    // PREMIUM: Verificar límite de quedadas para usuarios gratis
    if (!isUserPremium) {
        const userQuedadasThisMonth = getUserQuedadasThisMonth();
        if (userQuedadasThisMonth >= 3) {
            closeModal('modal-crear');
            openModal('modal-limit-reached');
            return;
        }
    }

    // Estado loading
    if(btn){ btn.disabled = true; btn.textContent = 'Publicando...'; }
    
    try {
        const sb = await getSupabaseClientOrToast(12000, true);
        if(!sb) { if(btn){ btn.disabled = false; btn.textContent = btnText; } return; }

        const titulo = document.getElementById('q-titulo').value.trim();
        const ciudad = document.getElementById('q-ciudad').value.trim();
        const ubicacion = document.getElementById('q-ubicacion').value.trim();
        const fecha = document.getElementById('q-fecha').value;
        const hora = document.getElementById('q-hora').value;
        const distancia = document.getElementById('q-distancia').value.trim();
        const nivel = document.getElementById('q-nivel').value;
        const ritmo = document.getElementById('q-ritmo').value.trim();
        const descripcion = document.getElementById('q-descripcion').value.trim();
        const maxPartEl = document.getElementById('q-max-participantes');
        const maxParticipantes = maxPartEl && maxPartEl.value ? parseInt(maxPartEl.value, 10) : null;

        // Coordenadas del pin fijo (parseFloat handles 0 correctly via CJ.validate.coordinates)
        const lat = parseFloat(document.getElementById('q-lat').value) || (pinCoords?.lat) || null;
        const lng = parseFloat(document.getElementById('q-lng').value) || (pinCoords?.lng) || null;

        // Validaciones
        if(!titulo){
            showToast('Escribe un título para la quedada','error');
            if(btn){ btn.disabled = false; btn.textContent = btnText; }
            return;
        }
        if(!CJ.validate.coordinates(lat, lng)){
            showToast('Selecciona una ubicación en el mapa','error');
            if(btn){ btn.disabled = false; btn.textContent = btnText; }
            return;
        }
        if(!fecha || !hora){
            showToast('Indica fecha y hora de la quedada','error');
            if(btn){ btn.disabled = false; btn.textContent = btnText; }
            return;
        }
        // Validar que la fecha sea futura
        if(!CJ.validate.futureDate(fecha + 'T' + hora)){
            showToast(currentLang === 'en' ? 'Date and time must be in the future' : 'La fecha y hora deben ser futuras','error');
            if(btn){ btn.disabled = false; btn.textContent = btnText; }
            return;
        }
        if(!distancia){
            showToast('Indica la distancia aproximada','error');
            if(btn){ btn.disabled = false; btn.textContent = btnText; }
            return;
        }

        // Ubicación final
        const ubicacionTexto = document.getElementById('ubicacion-texto')?.textContent || 'Ubicación personalizada';
        const ubicacionFinal = ubicacion ? `${ubicacion} · ${ubicacionTexto}` : ubicacionTexto;
        const ciudadFinal = ciudad || ubicacionTexto.split('·')[0].trim() || 'Ubicación personalizada';

        console.log('Creando quedada...', { titulo, ciudadFinal, fecha, hora, lat, lng });

        // Obtener país seleccionado o detectar del usuario
        const paisCode = document.getElementById('q-country')?.value || userCountry || 'ES';

        // Campos adicionales: terreno, desnivel, amenities
        // NOTA: Estos campos están preparados pero pendientes de agregar a la BD
        const terreno = document.getElementById('q-terreno')?.value || null;
        const desnivel = document.getElementById('q-desnivel')?.value || null;
        let amenities = null;
        try {
            const amenitiesRaw = document.getElementById('q-amenities')?.value;
            if (amenitiesRaw) amenities = JSON.parse(amenitiesRaw);
        } catch (e) { amenities = null; }

        // Crear objeto base de quedada
        const quedadaData = {
            titulo,
            ciudad: ciudadFinal,
            ubicacion: ubicacionFinal,
            direccion: null,
            lat,
            lng,
            fecha,
            hora,
            nivel,
            distancia,
            ritmo: ritmo || null,
            descripcion: descripcion || null,
            creador_id: currentUser.id,
            pais: paisCode
        };

        // Max participantes — Premium: sin límite, Gratis: máx 15
        if (isUserPremium) {
            if (maxParticipantes && maxParticipantes >= 2) {
                quedadaData.max_participantes = maxParticipantes;
            }
            // Premium sin valor = sin límite (no se envía campo)
        } else {
            // Free users: enforce max 15
            if (maxParticipantes && maxParticipantes >= 2 && maxParticipantes <= 15) {
                quedadaData.max_participantes = maxParticipantes;
            } else {
                quedadaData.max_participantes = 15;
            }
        }

        // PREMIUM: Quedada privada
        if (isUserPremium) {
            const isPrivate = document.getElementById('q-is-private')?.checked || false;
            if (isPrivate) {
                quedadaData.is_private = true;
                const accessCode = document.getElementById('q-access-code')?.value?.trim();
                if (accessCode) quedadaData.access_code = accessCode;
            }

            // PREMIUM: Recurrencia
            const recurrence = document.getElementById('q-recurrence')?.value;
            if (recurrence) quedadaData.recurrence = recurrence;

            // PREMIUM: Ruta GPS
            try {
                const rutaCoordsRaw = document.getElementById('q-ruta-coords')?.value;
                if (rutaCoordsRaw) {
                    const rutaCoords = JSON.parse(rutaCoordsRaw);
                    if (Array.isArray(rutaCoords) && rutaCoords.length >= 2) {
                        quedadaData.ruta_coords = rutaCoords;
                    }
                }
            } catch(e) {
                console.warn('Route data parse error:', e);
                showToast(currentLang === 'en' ? 'Route data could not be saved' : 'No se pudo guardar la ruta', 'error');
            }
        }

        // Intentar añadir campos extra (terreno, desnivel, amenities)
        // Solo se incluyen si tienen valor - la BD ignorará si las columnas no existen
        // TODO: Descomentar cuando se agreguen las columnas a Supabase:
        // if (terreno) quedadaData.terreno = terreno;
        // if (desnivel) quedadaData.desnivel = desnivel;
        // if (amenities && amenities.length > 0) quedadaData.amenities = amenities;

        let { data, error } = await window.supabaseClient
          .from('quedadas')
          .insert([quedadaData])
          .select()
          .single();

        // Fallback: if premium columns cause error, retry without them
        if (error && (error.message?.includes('is_private') || error.message?.includes('access_code') || error.message?.includes('recurrence') || error.message?.includes('ruta_coords'))) {
            console.warn('Premium columns not in DB yet, retrying without:', error.message);
            delete quedadaData.is_private;
            delete quedadaData.access_code;
            delete quedadaData.recurrence;
            delete quedadaData.ruta_coords;
            const fallback = await window.supabaseClient.from('quedadas').insert([quedadaData]).select().single();
            data = fallback.data;
            error = fallback.error;
        }

        if(error){
            console.error('Error creando quedada:', error);
            showToast(error.message,'error');
            if(btn){ btn.disabled = false; btn.textContent = btnText; }
            return; 
        }

        console.log('Quedada creada:', data);

        // El creador queda apuntado automáticamente
        const { error: errPart } = await window.supabaseClient
          .from('participantes')
          .insert([{ quedada_id: data.id, user_id: currentUser.id }]);
        
        if(errPart) console.warn('Error añadiendo participante:', errPart.message);

        closeModal('modal-crear');
        showToast('¡Quedada creada! 🎉');
        showConfetti(); // 🎉 Celebración

        // Limpiar borrador guardado
        try{ localStorage.removeItem('cj_draft_quedada'); }catch(_){}

        // Limpiar formulario
        pinCoords = null;
        placeCenter = null;
        ['q-titulo','q-ubicacion','q-fecha','q-hora','q-distancia','q-ritmo','q-descripcion','q-buscar-lugar','q-max-participantes'].forEach(fid => {
            const el = document.getElementById(fid);
            if(el) el.value = '';
        });
        document.getElementById('q-ciudad').value = '';
        document.getElementById('q-lat').value = '';
        document.getElementById('q-lng').value = '';
        document.getElementById('ubicacion-texto').textContent = 'Mueve el mapa para seleccionar ubicación...';

        // Limpiar terreno, desnivel y amenities
        resetTerrenoAmenities();

        // Limpiar campos Premium
        const privateToggle = document.getElementById('q-is-private');
        if (privateToggle) { privateToggle.checked = false; togglePrivateFields(); }
        const recurrenceToggle = document.getElementById('q-recurrence-toggle');
        if (recurrenceToggle) { recurrenceToggle.checked = false; toggleRecurrenceFields(); }
        const rutaToggle = document.getElementById('q-ruta-toggle');
        if (rutaToggle) { rutaToggle.checked = false; toggleRouteDrawing(); }
        const accessCode = document.getElementById('q-access-code');
        if (accessCode) accessCode.value = '';
        routeDrawingActive = false;
        routePoints = [];
        updateRouteDisplay();

        await loadQuedadas();
        
        // Enviar notificaciones a usuarios cercanos
        sendPushToNearbyUsers(data);
    } catch(e) {
        CJ.handleApiError(e, 'saveQuedada');
    } finally {
        if(btn){ btn.disabled = false; btn.textContent = btnText; }
    }
}

// Enviar notificación a usuarios cercanos cuando se crea quedada
async function sendPushToNearbyUsers(quedada) {
    if (!quedada || !quedada.lat || !quedada.lng) return;
    
    try {
        // Llamar a Edge Function notify-nearby-users (push + email)
        const response = await fetch('https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/notify-nearby-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await window.supabaseClient.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
                quedada_id: quedada.id,
                quedada_titulo: quedada.titulo,
                quedada_ciudad: quedada.ciudad,
                quedada_lat: quedada.lat,
                quedada_lng: quedada.lng,
                fecha: quedada.fecha,
                hora: quedada.hora,
                creador_id: currentUser.id
            })
        });
        
        if (response.ok) {
            console.log('Notificaciones enviadas a usuarios cercanos');
        }
    } catch (e) {
        console.warn('Error enviando notificaciones:', e);
        // No mostrar error al usuario, es secundario
    }
}

// ============== FUNCIONES PREMIUM: CREAR QUEDADA ==============

// Toggle campos de quedada privada

function togglePrivateFields() {
    const isPrivate = document.getElementById('q-is-private')?.checked;
    const section = document.getElementById('private-code-section');
    if (section) section.classList.toggle('hidden', !isPrivate);
    // Auto-generate code if empty
    if (isPrivate && !document.getElementById('q-access-code')?.value) {
        generateAccessCode();
    }
}

// Toggle campos de recurrencia
function toggleRecurrenceFields() {
    const isRecurrent = document.getElementById('q-recurrence-toggle')?.checked;
    const section = document.getElementById('recurrence-section');
    if (section) section.classList.toggle('hidden', !isRecurrent);
    if (!isRecurrent) {
        document.getElementById('q-recurrence').value = '';
        document.querySelectorAll('.recurrence-btn').forEach(b => {
            b.classList.remove('border-orange-500', 'text-orange-400', 'bg-orange-500/20');
        });
    }
}

// Seleccionar frecuencia de recurrencia
function selectRecurrence(freq) {
    document.getElementById('q-recurrence').value = freq;
    document.querySelectorAll('.recurrence-btn').forEach(b => {
        b.classList.remove('border-orange-500', 'text-orange-400', 'bg-orange-500/20');
        b.classList.add('border-slate-600/50', 'text-gray-400');
    });
    const btn = document.getElementById('recurrence-' + freq);
    if (btn) {
        btn.classList.add('border-orange-500', 'text-orange-400', 'bg-orange-500/20');
        btn.classList.remove('border-slate-600/50', 'text-gray-400');
    }
}

// Generar código de acceso aleatorio
function generateAccessCode() {
    const words = ['runner','sprint','maraton','trail','pista','ruta','grupo','equipo','carrera','meta'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;
    const code = word + num;
    const input = document.getElementById('q-access-code');
    if (input) input.value = code;
}

// Toggle route drawing mode
let routeDrawingActive = false;
let routePoints = [];
let routePolyline = null;
let routeMarkers = [];

function toggleRouteDrawing() {
    const isActive = document.getElementById('q-ruta-toggle')?.checked;
    const section = document.getElementById('route-drawing-section');
    if (section) section.classList.toggle('hidden', !isActive);

    routeDrawingActive = isActive;
    if (!isActive) {
        clearRouteDrawing();
    }
}

function addRoutePoint(latlng) {
    if (!routeDrawingActive) return;
    routePoints.push({ lat: latlng.lat, lng: latlng.lng });
    updateRouteDisplay();
}

function undoLastRoutePoint() {
    if (routePoints.length > 0) {
        routePoints.pop();
        updateRouteDisplay();
    }
}

function clearRouteDrawing() {
    routePoints = [];
    updateRouteDisplay();
}

function updateRouteDisplay() {
    // Update hidden input
    const input = document.getElementById('q-ruta-coords');
    if (input) input.value = routePoints.length >= 2 ? JSON.stringify(routePoints) : '';

    // Update points counter
    const counter = document.getElementById('route-points-count');
    if (counter) counter.textContent = routePoints.length + ' puntos';

    // Update polyline on crear map
    if (typeof mapCrear !== 'undefined' && mapCrear) {
        // Remove existing route elements
        if (routePolyline) { mapCrear.removeLayer(routePolyline); routePolyline = null; }
        routeMarkers.forEach(m => mapCrear.removeLayer(m));
        routeMarkers = [];

        if (routePoints.length >= 2) {
            routePolyline = L.polyline(routePoints.map(p => [p.lat, p.lng]), {
                color: '#f97316', weight: 4, opacity: 0.8, dashArray: '10, 6'
            }).addTo(mapCrear);
        }

        // Add small circle markers for each point
        routePoints.forEach((p, i) => {
            const m = L.circleMarker([p.lat, p.lng], {
                radius: i === 0 ? 6 : (i === routePoints.length - 1 ? 6 : 3),
                color: '#f97316',
                fillColor: i === 0 ? '#22c55e' : (i === routePoints.length - 1 ? '#ef4444' : '#f97316'),
                fillOpacity: 0.8,
                weight: 2
            }).addTo(mapCrear);
            routeMarkers.push(m);
        });
    }
}

// Count user's quedadas created this month (for Free limit enforcement)

function getUserQuedadasThisMonth() {
    if (!currentUser) return 0;
    return quedadas.filter(q => {
        if (q.creador_id !== currentUser.id) return false;
        if (q.es_seed) return false; // No contar quedadas seed/demo
        const qDate = new Date(q.created_at || q.fecha);
        const now = new Date();
        return qDate.getMonth() === now.getMonth() && qDate.getFullYear() === now.getFullYear();
    }).length;
}

// Update quedada counter badge in crear modal header
function updateQuedadaCounter() {
    const counterEl = document.getElementById('crear-quedada-counter');
    const counterText = document.getElementById('crear-counter-text');
    const badge = document.getElementById('crear-counter-badge');
    if (!counterEl || !counterText || !badge) return;

    if (isUserPremium) {
        counterEl.classList.add('hidden');
        return;
    }

    const count = getUserQuedadasThisMonth();
    counterEl.classList.remove('hidden');
    const remaining = 3 - count;

    // Reset classes
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border';

    if (remaining <= 0) {
        counterText.textContent = '3/3 — límite alcanzado';
        badge.classList.add('bg-red-500/15', 'text-red-400', 'border-red-500/30');
    } else if (remaining === 1) {
        counterText.textContent = count + '/3 este mes — ¡última quedada!';
        badge.classList.add('bg-yellow-500/15', 'text-yellow-400', 'border-yellow-500/30');
    } else {
        counterText.textContent = count + '/3 este mes';
        badge.classList.add('bg-orange-500/15', 'text-orange-400', 'border-orange-500/30');
    }
}

// Update Premium UI in crear modal based on premium status
function updatePremiumCrearUI() {
    const lock = document.getElementById('crear-premium-lock');
    const maxPartHint = document.getElementById('max-part-hint');
    const maxPartPremiumHint = document.getElementById('max-part-premium-hint');
    const maxPartInput = document.getElementById('q-max-participantes');

    if (isUserPremium) {
        if (lock) lock.classList.add('hidden');
        if (maxPartHint) maxPartHint.textContent = 'Sin limite (Premium)';
        if (maxPartPremiumHint) maxPartPremiumHint.classList.add('hidden');
        if (maxPartInput) { maxPartInput.placeholder = 'Sin limite'; maxPartInput.max = 500; }
    } else {
        if (lock) lock.classList.remove('hidden');
        if (maxPartHint) maxPartHint.textContent = 'Plan Gratis: max. 15';
        if (maxPartPremiumHint) maxPartPremiumHint.classList.remove('hidden');
        if (maxPartInput) { maxPartInput.placeholder = '15'; maxPartInput.max = 15; }
    }
}

// --- Alert Preferences (Premium) — save to DB ---

async function toggleAlertPreference() {
    const isOn = document.getElementById('alert-toggle')?.checked;
    const section = document.getElementById('alert-radius-section');
    if (section) section.classList.toggle('hidden', !isOn);

    // Save to DB
    if (currentUser && isUserPremium) {
        try {
            const sb = await getSupabaseClientOrToast(5000, false);
            if (sb) {
                await sb.from('profiles').update({ alert_new_quedadas: !!isOn }).eq('id', currentUser.id);
                currentUser.alert_new_quedadas = !!isOn;
            }
        } catch(_) { CJ.handleApiError(_, 'toggleAlert', {silent:true}); }
    }
}

async function selectAlertRadius(km) {
    const el = document.getElementById('alert-radius-value');
    if (el) el.value = km;
    [10, 25, 50].forEach(r => {
        const btn = document.getElementById('alert-radius-' + r);
        if (btn) {
            if (r === km) {
                btn.classList.add('border-orange-500', 'text-orange-400', 'bg-orange-500/20');
                btn.classList.remove('border-slate-600/50', 'text-gray-400');
            } else {
                btn.classList.remove('border-orange-500', 'text-orange-400', 'bg-orange-500/20');
                btn.classList.add('border-slate-600/50', 'text-gray-400');
            }
        }
    });

    // Save to DB
    if (currentUser && isUserPremium) {
        try {
            const sb = await getSupabaseClientOrToast(5000, false);
            if (sb) {
                await sb.from('profiles').update({ alert_radius_km: km }).eq('id', currentUser.id);
                currentUser.alert_radius_km = km;
            }
        } catch(_) { CJ.handleApiError(_, 'saveAlertRadius', {silent:true}); }
    }
}

async function loadAlertPreferences() {
    if (!currentUser) return;

    // Load from DB if premium
    if (isUserPremium) {
        try {
            const sb = await getSupabaseClientOrToast(5000, false);
            if (sb) {
                const { data } = await sb.from('profiles')
                    .select('alert_new_quedadas, alert_radius_km')
                    .eq('id', currentUser.id)
                    .single();
                if (data) {
                    currentUser.alert_new_quedadas = data.alert_new_quedadas;
                    currentUser.alert_radius_km = data.alert_radius_km;
                }
            }
        } catch(_) { CJ.handleApiError(_, 'loadAlertPrefs', {silent:true}); }
    }

    const toggle = document.getElementById('alert-toggle');
    if (toggle) toggle.checked = !!currentUser.alert_new_quedadas;
    toggleAlertPreference();
    selectAlertRadius(currentUser.alert_radius_km || 25);
}

// --- Verification Flow (Premium) ---
function showVerificationBanner() {
    const banner = document.getElementById('verification-banner');
    if (!banner) return;
    // Show if premium + not already verified
    if (isUserPremium && currentUser && !currentUser.verification_badge) {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

async function openVerificationFlow() {
    if (!currentUser || !isUserPremium) {
        openPremiumSales();
        return;
    }

    const t = I18N[currentLang] || I18N.es;

    // Simple prompt-based flow (can be enhanced to a modal later)
    const evidence = prompt(currentLang === 'en'
        ? 'Paste a link to your Strava profile or a recent race result to verify your level:'
        : 'Pega un enlace a tu perfil de Strava o un resultado de carrera reciente para verificar tu nivel:');

    if (!evidence || !evidence.trim()) return;

    try {
        const sb = await getSupabaseClientOrToast(5000, false);
        if (!sb) return;

        const { error } = await sb.from('level_verifications').insert({
            user_id: currentUser.id,
            verification_type: evidence.includes('strava') ? 'strava_link' : 'race_photo',
            evidence_url: evidence.trim(),
            claimed_level: currentUser.nivel || 'Intermedio',
            status: 'pending'
        });

        if (error) {
            showToast('Error al enviar verificación', 'error');
            return;
        }

        showToast(currentLang === 'en'
            ? '✅ Verification submitted! We\'ll review it soon.'
            : '✅ Verificación enviada. La revisaremos pronto.', 'success');

        const banner = document.getElementById('verification-banner');
        if (banner) banner.classList.add('hidden');
    } catch (e) {
        console.warn('Verification error:', e);
    }
}

// Verify private code to join quedada
function verifyPrivateCode() {
    const quedadaId = document.getElementById('private-join-quedada-id')?.value;
    const code = document.getElementById('private-join-code')?.value?.trim();

    if (!quedadaId || !code) {
        showToast('Introduce el codigo de acceso', 'error');
        return;
    }

    const q = quedadas.find(x => x.id === quedadaId);
    if (!q) {
        showToast('Quedada no encontrada', 'error');
        return;
    }

    if (code.toLowerCase() === (q.access_code || '').toLowerCase()) {
        closeModal('modal-private-code');
        // Code correct — open normal attendance modal
        document.getElementById('attendance-quedada-id').value = quedadaId;
        // Now call the regular attendance modal flow (bypass the private check)
        const asistentesInfo = q ? (Array.isArray(q.asistentes_info) ? q.asistentes_info : []) : [];
        const myParticipation = asistentesInfo.find(a => a.user_id === currentUser.id);
        const isJoined = !!myParticipation;
        document.getElementById('attendance-is-joined').value = isJoined ? 'true' : 'false';
        // Directly confirm attendance
        confirmAttendance('confirmed');
        showToast('Codigo correcto. ¡Bienvenido!', 'success');
    } else {
        showToast('Codigo incorrecto', 'error');
        document.getElementById('private-join-code').value = '';
    }
}

// ============== POST-RUN TRACKING (Premium) ==============


function openPostRunModal(quedadaId) {
    const q = quedadas.find(x => x.id === quedadaId);
    if (!q) return;

    document.getElementById('postrun-quedada-id').value = quedadaId;
    document.getElementById('postrun-ritmo-min').value = '';
    document.getElementById('postrun-ritmo-sec').value = '';
    document.getElementById('postrun-distancia').value = '';
    document.getElementById('postrun-esfuerzo').value = '5';
    document.getElementById('postrun-esfuerzo-label').textContent = '5/10';
    document.getElementById('postrun-notas').value = '';

    // Pre-fill distance from quedada info
    if (q.distancia) {
        const dist = parseFloat(q.distancia);
        if (dist > 0) document.getElementById('postrun-distancia').value = dist;
    }

    openModal('modal-post-run');
}

async function savePostRunData() {
    const quedadaId = document.getElementById('postrun-quedada-id')?.value;
    if (!quedadaId || !currentUser) return;

    const ritmoMin = document.getElementById('postrun-ritmo-min')?.value;
    const ritmoSec = document.getElementById('postrun-ritmo-sec')?.value;
    const distancia = parseFloat(document.getElementById('postrun-distancia')?.value) || null;
    const esfuerzo = parseInt(document.getElementById('postrun-esfuerzo')?.value) || null;
    const notas = document.getElementById('postrun-notas')?.value?.trim() || null;

    const ritmoReal = ritmoMin ? `${ritmoMin}:${(ritmoSec || '0').toString().padStart(2, '0')} min/km` : null;

    if (!ritmoReal && !distancia) {
        showToast('Introduce al menos el ritmo o la distancia', 'error');
        return;
    }

    try {
        const sb = await getSupabaseClientOrToast(8000, true);
        if (!sb) return;

        const updateData = { completed_at: new Date().toISOString() };
        if (ritmoReal) updateData.ritmo_real = ritmoReal;
        if (distancia) updateData.distancia_real = distancia;
        if (esfuerzo) updateData.valoracion_esfuerzo = esfuerzo;
        if (notas) updateData.notas_post = notas;

        const { error } = await window.supabaseClient
            .from('participantes')
            .update(updateData)
            .eq('quedada_id', quedadaId)
            .eq('user_id', currentUser.id);

        if (error) {
            console.warn('Error saving post-run:', error);
            showToast('Error guardando registro: ' + error.message, 'error');
            return;
        }

        closeModal('modal-post-run');
        showToast('🏁 ¡Registro guardado! Sigue asi', 'success');
        showConfetti();
    } catch (e) {
        console.error('Error en savePostRunData:', e);
        showToast('Error: ' + e.message, 'error');
    }
}

// ============== SISTEMA PREMIUM ==============

    // ─── Expose to window ────────────────────────────────
    window.loadQuedadaComments = loadQuedadaComments;
    window.postComment = postComment;
    window.openShareModal = openShareModal;
    window.getShareText = getShareText;
    window.smartShare = smartShare;
    window.shareCorrerJuntos = shareCorrerJuntos;
    window.shareWhatsApp = shareWhatsApp;
    window.shareTwitter = shareTwitter;
    window.copyShareLink = copyShareLink;
    window.isQuedadaLive = isQuedadaLive;
    window.getWeather = getWeather;
    window.loadDetailWeather = loadDetailWeather;
    window.getRunningTip = getRunningTip;
    window.isQuedadaPasada = isQuedadaPasada;
    window.getUserName = getUserName;
    window.viewOrganizerProfile = viewOrganizerProfile;
    window.showOrganizerModal = showOrganizerModal;
    window.loadQuedadas = loadQuedadas;
    window.injectEventSchema = injectEventSchema;
    window.renderQuedadas = renderQuedadas;
    window.loadWeatherForQuedadas = loadWeatherForQuedadas;
    window.openQuedadaDetail = openQuedadaDetail;
    window.renderCityChips = renderCityChips;
    window.filterBy = filterBy;
    window.openCiudadView = openCiudadView;
    window.closeCiudadView = closeCiudadView;
    window.switchCiudadTab = switchCiudadTab;
    window.loadCiudadData = loadCiudadData;
    window.renderCiudadQuedadas = renderCiudadQuedadas;
    window.renderCiudadRunners = renderCiudadRunners;
    window.checkCiudadParam = checkCiudadParam;
    window.openAttendanceModal = openAttendanceModal;
    window.openLeaveConfirmModal = openLeaveConfirmModal;
    window.openLeaveConfirmFromCard = openLeaveConfirmFromCard;
    window.confirmLeaveQuedada = confirmLeaveQuedada;
    window.confirmAttendance = confirmAttendance;
    window.getStatusMessage = getStatusMessage;
    window.getStatusBadge = getStatusBadge;
    window.toggleJoin = toggleJoin;
    window.saveQuedada = saveQuedada;
    window.sendPushToNearbyUsers = sendPushToNearbyUsers;
    window.togglePrivateFields = togglePrivateFields;
    window.toggleRecurrenceFields = toggleRecurrenceFields;
    window.selectRecurrence = selectRecurrence;
    window.generateAccessCode = generateAccessCode;
    window.toggleRouteDrawing = toggleRouteDrawing;
    window.addRoutePoint = addRoutePoint;
    window.undoLastRoutePoint = undoLastRoutePoint;
    window.clearRouteDrawing = clearRouteDrawing;
    window.updateRouteDisplay = updateRouteDisplay;
    window.getUserQuedadasThisMonth = getUserQuedadasThisMonth;
    window.updateQuedadaCounter = updateQuedadaCounter;
    window.updatePremiumCrearUI = updatePremiumCrearUI;
    window.toggleAlertPreference = toggleAlertPreference;
    window.selectAlertRadius = selectAlertRadius;
    window.loadAlertPreferences = loadAlertPreferences;
    window.showVerificationBanner = showVerificationBanner;
    window.openVerificationFlow = openVerificationFlow;
    window.verifyPrivateCode = verifyPrivateCode;
    window.openPostRunModal = openPostRunModal;
    window.savePostRunData = savePostRunData;
})();
