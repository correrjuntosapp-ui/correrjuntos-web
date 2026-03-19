// ========================= MAP CORE MODULE =========================
// Leaflet map initialization, markers, geocoding, crear modal map.
// Loaded AFTER state.js, ui.js.
(function() {
    'use strict';

let _leafletP = null;

// Fetch with AbortController timeout for geocoding calls
function fetchWithTimeout(url, opts, ms) {
    ms = ms || 5000;
    var ctrl = new AbortController();
    var id = setTimeout(function(){ ctrl.abort(); }, ms);
    opts = Object.assign({}, opts, { signal: ctrl.signal });
    return fetch(url, opts).finally(function(){ clearTimeout(id); });
}

function toggleMapSize() {
    const wrapper = document.getElementById('map-wrapper');
    const btn = document.getElementById('btn-toggle-map');
    const icon = document.getElementById('toggle-map-icon');
    const text = document.getElementById('toggle-map-text');
    const t = I18N[currentLang] || I18N.es;

    if (mapState === 'normal' || mapState === 'expanded') {
        // Minimizar
        wrapper.classList.remove('expanded');
        wrapper.classList.add('minimized');
        wrapper.style.height = '120px';
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>';
        text.textContent = currentLang === 'en' ? 'Expand' : 'Expandir';
        mapState = 'minimized';
    } else {
        // Volver a normal (responsivo según pantalla)
        wrapper.classList.remove('minimized');
        wrapper.style.height = ''; // Dejar que CSS maneje la altura según breakpoint
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>';
        text.textContent = currentLang === 'en' ? 'Minimize' : 'Minimizar';
        mapState = 'normal';
    }

    // Invalidar tamaño del mapa para que se redibuje
    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 350);
}

// ========== PREMIUM: MAPA FULLSCREEN ==========
// isMapFullscreen → via AppState shim

function toggleFullscreenMap() {
    const mapEl = document.getElementById('map');
    const btn = document.getElementById('btn-fullscreen-map');
    const icon = document.getElementById('fullscreen-icon');

    isMapFullscreen = !isMapFullscreen;

    if (isMapFullscreen) {
        mapEl.classList.add('map-fullscreen');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
        btn.style.position = 'fixed';
        btn.style.zIndex = '501';
    } else {
        mapEl.classList.remove('map-fullscreen');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>';
        btn.style.position = 'absolute';
        btn.style.zIndex = '30';
    }

    if (map) setTimeout(() => map.invalidateSize(), 100);
}

// Cerrar fullscreen con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMapFullscreen) toggleFullscreenMap();
});

// ========== BOTTOM NAV HIGHLIGHT ==========
window.updateBottomNavHighlight = function(active) {
    ['home','map','social','profile'].forEach(tab => {
        const btn = document.getElementById('app-nav-' + tab);
        if (!btn) return;
        if (tab === active) {
            btn.style.color = '#f97316';
            btn.style.background = 'rgba(249,115,22,.1)';
        } else {
            btn.style.color = '#94a3b8';
            btn.style.background = 'transparent';
        }
    });
};

// ========== SCROLL TO MAP ==========
window.scrollToMap = function() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Expand map if minimized
        if (mapState === 'minimized') toggleMapSize();
    }
};

// ========== NIVEL COLOR (matches mobile QuedadaMarker) ==========

function getNivelColor(nivel) {
    switch ((nivel || '').toLowerCase()) {
        case 'principiante': return '#22c55e';
        case 'intermedio': return '#eab308';
        case 'avanzado': return '#ef4444';
        case 'elite': return '#8b5cf6';
        default: return '#f97316';
    }
}

// ========== FLOATING CARD (map marker click) ==========
let floatingCardQuedada = null;

window.showFloatingCard = function(quedadaId) {
    const q = (quedadas || []).find(x => x.id === quedadaId);
    if (!q) return;
    floatingCardQuedada = q;

    const card = document.getElementById('map-floating-card');
    if (!card) return;

    const t = I18N[currentLang] || I18N.es;
    const nivelColor = getNivelColor(q.nivel);
    const asistentes = Array.isArray(q.asistentes) ? q.asistentes : (Array.isArray(q.asistentes_info) ? q.asistentes_info.map(a => a.user_id) : []);
    const isJoined = currentUser && asistentes.includes(currentUser.id);
    const isCreator = currentUser && q.creador_id === currentUser.id;
    const participantCount = asistentes.length;

    // Header
    const header = card.querySelector('#fc-header');
    let statusHtml = '';
    if (isJoined) {
        statusHtml = `<span style="padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;background:rgba(34,197,94,.15);color:#22c55e">${t.fc_joined || 'Apuntado'} &#10003;</span>`;
    } else if (isCreator) {
        statusHtml = `<span style="padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;background:rgba(249,115,22,.15);color:#f97316">${t.fc_organizer || 'Organizador'}</span>`;
    }
    header.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex:1">
            <span style="padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;background:${nivelColor}20;color:${nivelColor}">${escapeHtml(q.nivel || 'Todos')}</span>
            ${statusHtml}
        </div>
        <button onclick="dismissFloatingCard()" style="width:28px;height:28px;border-radius:14px;background:rgba(255,255,255,.1);border:none;color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px" aria-label="Cerrar">&times;</button>
    `;

    // Title
    card.querySelector('#fc-title').textContent = q.titulo || '';

    // Info
    const info = card.querySelector('#fc-info');
    const distText = q.distancia ? `<span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> ${q.distancia} ${t.fc_km || 'km'}</span>` : '';
    info.innerHTML = `
        <span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> ${formatDateShort(q.fecha)}</span>
        <span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${formatHora(q.hora)}</span>
        <span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${escapeHtml(q.ciudad || q.ubicacion || '')}</span>
        <span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${participantCount} ${t.fc_runners || 'runners'}</span>
        ${distText}
    `;

    // Actions
    const actions = card.querySelector('#fc-actions');
    const viewBtn = `<button onclick="dismissFloatingCard();openQuedadaDetail('${q.id}')" style="flex:1;padding:11px;border-radius:10px;border:1.5px solid rgba(249,115,22,.4);background:transparent;color:#f97316;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s">${t.fc_view_event || 'Ver quedada'}</button>`;

    if (isJoined || isCreator) {
        actions.innerHTML = viewBtn;
    } else {
        actions.innerHTML = `
            ${viewBtn}
            <button onclick="toggleJoin('${q.id}');dismissFloatingCard()" style="flex:1;padding:11px;border-radius:10px;border:none;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(249,115,22,.3);transition:all .2s">${t.fc_join_event || 'Unirme'}</button>
        `;
    }

    // Show with animation
    card.classList.remove('hidden');
    card.style.transform = 'translateY(100%)';
    card.style.opacity = '0';
    requestAnimationFrame(() => {
        card.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s';
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
    });

    // Pan map slightly up
    if (map && q.lat && q.lng) {
        map.setView([q.lat - 0.003, q.lng], map.getZoom(), { animate: true });
    }
};

window.dismissFloatingCard = function() {
    const card = document.getElementById('map-floating-card');
    if (!card || card.classList.contains('hidden')) return;
    card.style.transition = 'transform .2s ease-in, opacity .15s';
    card.style.transform = 'translateY(100%)';
    card.style.opacity = '0';
    setTimeout(() => {
        card.classList.add('hidden');
        floatingCardQuedada = null;
    }, 200);
};

// ========== PREMIUM: ANIMACIÓN BIENVENIDA ==========

function ensureLeaflet() {
    if (typeof L !== 'undefined') return Promise.resolve();
    if (_leafletP) return _leafletP;
    _leafletP = new Promise((resolve, reject) => {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
        const js = document.createElement('script');
        js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        js.integrity = 'sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH';
        js.crossOrigin = 'anonymous';
        js.onload = resolve;
        js.onerror = reject;
        document.head.appendChild(js);
    });
    return _leafletP;
}

/* === html2canvas lazy loader === */
let _h2cP = null;
function ensureHtml2Canvas() {
    if (typeof html2canvas !== 'undefined') return Promise.resolve();
    if (_h2cP) return _h2cP;
    _h2cP = new Promise((resolve, reject) => {
        const js = document.createElement('script');
        js.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        js.integrity = 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H';
        js.crossOrigin = 'anonymous';
        js.onload = resolve;
        js.onerror = reject;
        document.head.appendChild(js);
    });
    return _h2cP;
}

let currentTileLayer = null;

function initMap(){
    if(map) return;
    // Centrar mapa: 1) ciudad del perfil, 2) geolocalización, 3) país
    var center = getCountryCenter(userCountry);
    if(window.currentUser && window.currentUser.ciudad){
        var cityCoords = getCityCenterByName(window.currentUser.ciudad);
        if(cityCoords) center = {lat: cityCoords.lat, lng: cityCoords.lng, zoom: 12};
    } else if(userLoc){
        center = {lat: userLoc.lat, lng: userLoc.lng, zoom: 12};
    }
    map=L.map('map',{zoomControl:false}).setView([center.lat, center.lng], center.zoom);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" title="A JavaScript library for interactive maps" target="_blank" rel="noopener noreferrer">Leaflet</a>');
    L.control.zoom({position:'bottomright'}).addTo(map);
    map.on('click', function(){ dismissFloatingCard(); });
    updateMapTiles();
    renderCityChips();
    updateMarkers();
    renderQuedadas();
}

// Recentrar mapa cuando cambie el país o el modo de filtro
function recenterMap() {
    if (!map) return;
    if (geoFilterMode === 'all') {
        // Vista mundial
        map.setView([20, 0], 2);
    } else {
        const center = getCountryCenter(userCountry);
        map.setView([center.lat, center.lng], center.zoom);
    }
}
function updateMapTiles() {
    if (!map) return;
    const isLight = document.body.classList.contains('light-mode');
    const tileUrl = isLight
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    if (currentTileLayer) map.removeLayer(currentTileLayer);
    currentTileLayer = L.tileLayer(tileUrl, {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
    }).addTo(map);
    // Remove legacy CSS filter (now using proper dark tiles)
    const mapContainer = document.getElementById('map');
    if (mapContainer) mapContainer.style.filter = 'none';
}

// ====== NEAR ME (GPS) ======
// userLoc, userCountry, geoFilterMode → via AppState shims
var userMarker = null;

// Coordenadas centrales y zoom por país
const COUNTRY_CENTERS = {
    'ES': { lat: 40.4168, lng: -3.7038, zoom: 6 },      // Madrid
    'PT': { lat: 38.7223, lng: -9.1393, zoom: 7 },      // Lisboa
    'AR': { lat: -34.6037, lng: -58.3816, zoom: 5 },    // Buenos Aires
    'MX': { lat: 19.4326, lng: -99.1332, zoom: 5 },     // Ciudad de México
    'CO': { lat: 4.7110, lng: -74.0721, zoom: 6 },      // Bogotá
    'PE': { lat: -12.0464, lng: -77.0428, zoom: 6 },    // Lima
    'CL': { lat: -33.4489, lng: -70.6693, zoom: 5 },    // Santiago
    'EC': { lat: -0.1807, lng: -78.4678, zoom: 7 },     // Quito
    'VE': { lat: 10.4806, lng: -66.9036, zoom: 6 },     // Caracas
    'UY': { lat: -34.9011, lng: -56.1645, zoom: 7 },    // Montevideo
    'PY': { lat: -25.2637, lng: -57.5759, zoom: 7 },    // Asunción
    'BO': { lat: -16.5000, lng: -68.1500, zoom: 6 },    // La Paz
    'CR': { lat: 9.9281, lng: -84.0907, zoom: 8 },      // San José
    'PA': { lat: 8.9824, lng: -79.5199, zoom: 8 },      // Panamá
    'GT': { lat: 14.6349, lng: -90.5069, zoom: 8 },     // Guatemala
    'HN': { lat: 14.0723, lng: -87.1921, zoom: 8 },     // Tegucigalpa
    'SV': { lat: 13.6929, lng: -89.2182, zoom: 9 },     // San Salvador
    'NI': { lat: 12.1150, lng: -86.2362, zoom: 8 },     // Managua
    'CU': { lat: 23.1136, lng: -82.3666, zoom: 7 },     // La Habana
    'DO': { lat: 18.4861, lng: -69.9312, zoom: 8 },     // Santo Domingo
    'PR': { lat: 18.4655, lng: -66.1057, zoom: 9 },     // San Juan
    'US': { lat: 39.8283, lng: -98.5795, zoom: 4 },     // Centro EEUU
    'FR': { lat: 46.6034, lng: 1.8883, zoom: 6 },       // Francia
    'IT': { lat: 41.8719, lng: 12.5674, zoom: 6 },      // Roma
    'DE': { lat: 51.1657, lng: 10.4515, zoom: 6 },      // Alemania
    'GB': { lat: 51.5074, lng: -0.1278, zoom: 6 },      // Londres
    'BR': { lat: -14.2350, lng: -51.9253, zoom: 4 },    // Brasil
    'PH': { lat: 12.8797, lng: 121.7740, zoom: 6 },     // Filipinas
    'GQ': { lat: 1.6508, lng: 10.2679, zoom: 8 },       // Guinea Ecuatorial
    'DEFAULT': { lat: 20, lng: 0, zoom: 2 }             // Vista mundial
};


function getCountryCenter(countryCode) {
    return COUNTRY_CENTERS[countryCode] || COUNTRY_CENTERS['DEFAULT'];
}

// Mapeo de códigos de país a nombres
const COUNTRY_CODE_MAP = {
    'ES': ['España', 'Spain', 'ES'],
    'PT': ['Portugal', 'PT'],
    'AR': ['Argentina', 'AR'],
    'MX': ['México', 'Mexico', 'MX'],
    'CO': ['Colombia', 'CO'],
    'PE': ['Perú', 'Peru', 'PE'],
    'CL': ['Chile', 'CL'],
    'EC': ['Ecuador', 'EC'],
    'VE': ['Venezuela', 'VE'],
    'UY': ['Uruguay', 'UY'],
    'PY': ['Paraguay', 'PY'],
    'BO': ['Bolivia', 'BO'],
    'CR': ['Costa Rica', 'CR'],
    'PA': ['Panamá', 'Panama', 'PA'],
    'GT': ['Guatemala', 'GT'],
    'HN': ['Honduras', 'HN'],
    'SV': ['El Salvador', 'SV'],
    'NI': ['Nicaragua', 'NI'],
    'CU': ['Cuba', 'CU'],
    'DO': ['República Dominicana', 'Dominican Republic', 'DO'],
    'PR': ['Puerto Rico', 'PR'],
    'US': ['Estados Unidos', 'United States', 'USA', 'US'],
    'FR': ['Francia', 'France', 'FR'],
    'IT': ['Italia', 'Italy', 'IT'],
    'DE': ['Alemania', 'Germany', 'DE'],
    'GB': ['Reino Unido', 'United Kingdom', 'UK', 'GB'],
    'BR': ['Brasil', 'Brazil', 'BR'],
    'PH': ['Filipinas', 'Philippines', 'PH'],
    'GQ': ['Guinea Ecuatorial', 'Equatorial Guinea', 'GQ']
};

function matchesCountry(quedadaPais, userCountryCode) {
    if (!quedadaPais || !userCountryCode) return true; // Si no hay país, mostrar
    const validNames = COUNTRY_CODE_MAP[userCountryCode] || [userCountryCode];
    return validNames.some(name =>
        quedadaPais.toLowerCase() === name.toLowerCase() ||
        quedadaPais.toUpperCase() === name.toUpperCase()
    );
}

function setGeoFilterMode(mode) {
    geoFilterMode = mode;
    renderQuedadas();
    updateMarkers();
    recenterMap();
    // Actualizar botones visuales
    document.querySelectorAll('.geo-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
}

// Actualizar UI de filtro geográfico con bandera y nombre del país
function updateGeoFilterUI() {
    const flagEl = document.getElementById('geo-country-flag');
    const nameEl = document.getElementById('geo-country-name');
    if (flagEl) {
        flagEl.textContent = COUNTRY_CODE_FLAGS[userCountry] || '🌍';
    }
    if (nameEl) {
        const names = COUNTRY_CODE_MAP[userCountry];
        nameEl.textContent = names ? names[0] : '';
    }
}
const NEAR_RADIUS_KM = 8;

// Detectar país del usuario usando reverse geocoding
async function detectUserCountry(lat, lng) {
    try {
        const resp = await fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${currentLang||'es'}`, {}, 5000);
        const data = await resp.json();
        if (data && data.address && data.address.country_code) {
            userCountry = data.address.country_code.toUpperCase();
            console.log('País detectado:', userCountry);
            // Actualizar selector de país si existe
            const countrySel = document.getElementById('q-country');
            if (countrySel) countrySel.value = userCountry;
        }
    } catch (e) {
        console.warn('Error detectando país:', e);
    }
}

function haversineKm(aLat,aLng,bLat,bLng){
    const R=6371;
    const dLat=(bLat-aLat)*Math.PI/180;
    const dLng=(bLng-aLng)*Math.PI/180;
    const s1=Math.sin(dLat/2), s2=Math.sin(dLng/2);
    const aa=s1*s1 + Math.cos(aLat*Math.PI/180)*Math.cos(bLat*Math.PI/180)*s2*s2;
    return 2*R*Math.asin(Math.min(1,Math.sqrt(aa)));
}

function setLocateBtnActive(active){
    const b=document.getElementById('btn-locate');
    if(!b) return;
    b.classList.toggle('active', !!active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
}

function locateMe(){
    if(!map){ ensureLeaflet().then(initMap).then(locateMe); return; }
    if(!('geolocation' in navigator)){
        showToast(currentLang==='en'?'Geolocation not supported':(currentLang==='pt'?'Geolocalização não suportada':'Geolocalización no soportada'),'error');
        return;
    }
    setLocateBtnActive(true);
    navigator.geolocation.getCurrentPosition((pos)=>{
        userLoc = {lat: pos.coords.latitude, lng: pos.coords.longitude};

        // Detectar país del usuario (async)
        detectUserCountry(userLoc.lat, userLoc.lng);

        // center map
        map.invalidateSize(true);
        map.flyTo([userLoc.lat,userLoc.lng], 14, {animate:true, duration:0.7});
        setTimeout(()=>map.invalidateSize(true), 80);

        // marker
        if(userMarker){ try{ map.removeLayer(userMarker);}catch(_){} }
        userMarker = L.circleMarker([userLoc.lat,userLoc.lng],{
            radius:8,
            color:'#ffffff',
            weight:2,
            fillColor:'#f97316',
            fillOpacity:0.85
        }).addTo(map).bindPopup(currentLang==='en'?'You are here':(currentLang==='pt'?'Estás aqui':'Estás aquí'));

        // activate filter
        currentFilter = 'near25'; // Activar filtro cercano por defecto
        renderCityChips();
        renderQuedadas();
        updateMarkers();
        showToast(currentLang==='en'?'Showing nearby meetups':(currentLang==='pt'?'A mostrar encontros próximos':'Mostrando quedadas cercanas'));
    }, (err)=>{
        setLocateBtnActive(false);
        const msg = err && err.code===1 ? (currentLang==='en'?'Location permission denied':(currentLang==='pt'?'Permissão de localização negada':'Permiso de ubicación denegado'))
                  : (currentLang==='en'?'Unable to get your location':(currentLang==='pt'?'Não foi possível obter a tua localização':'No se pudo obtener tu ubicación'));
        showToast(msg,'error');
    }, {enableHighAccuracy:true, timeout:8000, maximumAge:60000});
}


function updateMarkers(){
    if(!map) return;
    markers.forEach(m=>map.removeLayer(m));
    markers=[];
    let filtered;

    // Primero filtrar por país del usuario (si no está en modo mundial)
    let quedadasPais = quedadas;
    if (geoFilterMode === 'country' && userCountry) {
        quedadasPais = quedadas.filter(q => matchesCountry(q.pais, userCountry));
    }

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

    filtered.forEach(q=>{
        const nivelColor = getNivelColor(q.nivel);
        const horaStr = q.hora ? q.hora.split(':').slice(0,2).join(':') : '';
        const icon=L.divIcon({
            html:`<div style="background:${nivelColor};display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:10px;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25);white-space:nowrap;cursor:pointer"><span style="font-size:11px"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></span><span style="color:white;font-size:12px;font-weight:800">${horaStr}</span></div>`,
            className:'cj-marker',iconSize:[null,null],iconAnchor:[30,20]
        });
        const m=L.marker([q.lat,q.lng],{icon}).addTo(map);
        m.on('click', function(){ openQuedadaDetail(q.id); });
        markers.push(m);
    });

    // NO recentrar el mapa aquí - el recentrado se hace en filterBy()
    // Solo dejamos el mapa donde filterBy() lo posicionó
}



// ===================== CALLEJERO (Nominatim) =====================
let addressDebounceCrear = null;
let lastAddressResultsCrear = [];

function getCrearCountryCode(){
    // Ahora soporta búsqueda mundial - retorna vacío para no restringir
    return '';
}

function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}


function renderAddressSuggestionsCrear(results){
    const box = document.getElementById('q-address-suggestions');
    if(!box) return;
    lastAddressResultsCrear = Array.isArray(results) ? results : [];

    if(!lastAddressResultsCrear.length){
        box.innerHTML = `<div class="px-4 py-3 text-sm text-white/70">Sin resultados. Prueba con calle + número.</div>`;
        box.classList.remove('hidden');
        return;
    }

    box.innerHTML = lastAddressResultsCrear.map((r, i) => {
        const type = (r.type || r.addresstype || '').replace(/_/g,' ');
        const badge = type ? `<span class="address-suggest-badge">${escapeHtml(type)}</span>` : '';
        return `
            <div class="address-suggest-item" onclick="selectAddressResultCrear(${i})">
                <div style="flex:1;min-width:0;">
                    <div class="address-suggest-main">${escapeHtml(r.display_name || '')}</div>
                </div>
                ${badge}
            </div>`;
    }).join('');

    box.classList.remove('hidden');
}

function closeAddressSuggestionsCrear(){
    const box = document.getElementById('q-address-suggestions');
    if(box) box.classList.add('hidden');
}

async function fetchAddressSuggestionsCrear(q){
    const cc = getCrearCountryCode();
    const chosenCity = (document.getElementById('q-ciudad')?.value || '').trim();
    const qFinal = chosenCity ? `${q}, ${chosenCity}` : q;
    // Try to bias search around current map bounds (more precise callejero)
    let viewbox = '';
    if(window.mapCrear && typeof mapCrear.getBounds === 'function'){
        const b = mapCrear.getBounds();
        viewbox = `&bounded=1&viewbox=${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
    }
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6${viewbox}&accept-language=${currentLang||'es'}&q=${encodeURIComponent(qFinal)}`;
    const res = await fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 5000);
    if(!res.ok) throw new Error('nominatim');
    return await res.json();
}

function onAddressInputCrear(){
    const input = document.getElementById('q-direccion');
    if(!input) return;
    const q = input.value.trim();

    if(addressDebounceCrear) clearTimeout(addressDebounceCrear);
    if(q.length < 3){
        closeAddressSuggestionsCrear();
        return;
    }

    addressDebounceCrear = setTimeout(async () => {
        try{
            const results = await fetchAddressSuggestionsCrear(q);
            renderAddressSuggestionsCrear(results);
        }catch(e){
            const box = document.getElementById('q-address-suggestions');
            if(box){
                box.innerHTML = `<div class="px-4 py-3 text-sm text-white/70">No se pudo cargar el callejero. Comprueba tu conexión.</div>`;
                box.classList.remove('hidden');
            }
        }
    }, 250);
}

function selectAddressResultCrear(i){
    const r = lastAddressResultsCrear[i];
    if(!r) return;

    const input = document.getElementById('q-direccion');
    if(input) input.value = r.display_name || '';

    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if(Number.isFinite(lat) && Number.isFinite(lng)){
        pinCoords = { lat, lng };
        // keep placeCenter if already chosen
        updateMapCrear(false);
    }

    closeAddressSuggestionsCrear();
}

async function tryFillAddressFromCoords(lat, lng){
    const input = document.getElementById('q-direccion');
    if(!input) return;
    try{
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=${currentLang||'es'}&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
        const res = await fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, 5000);
        if(!res.ok) throw new Error('reverse');
        const data = await res.json();
        if(data && data.display_name) input.value = data.display_name;
    }catch(e){
        // silent
    }
}

// Close suggestions on outside click
document.addEventListener('click', (ev) => {
    const box = document.getElementById('q-address-suggestions');
    const input = document.getElementById('q-direccion');
    if(!box || !input) return;
    if(ev.target === input || box.contains(ev.target)) return;
    closeAddressSuggestionsCrear();
});


function openModalCrear(){
    if(!currentUser){showToast('Debes registrarte','error');openModal('modal-register');return;}
    // PREMIUM v1: Free = 1 quedada activa max, Premium = ilimitadas
    if (!isUserPremium) {
        const activeCount = getActiveQuedadasCount();
        const maxAllowed = PLAN_FEATURES[userPlan]?.maxActiveMeetups ?? 1;
        if (activeCount >= maxAllowed) {
            openPremiumModal('create_meetup_limit');
            if (typeof gtag === 'function') { gtag('event', 'premium_feature_blocked', { feature: 'create_meetup_limit' }); gtag('event', 'create_meetup_blocked'); }
            return;
        }
    }
    openModal('modal-crear');
    setTimeout(()=>ensureLeaflet().then(initMapCrear),200);
    restoreDraftQuedada();
    updatePremiumCrearUI();
    updateQuedadaCounter();
}
function restoreDraftQuedada(){
    try{
        var raw=localStorage.getItem('cj_draft_quedada');
        if(!raw) return;
        var d=JSON.parse(raw);
        // Solo restaurar si el borrador tiene <24h
        if(Date.now()-d.ts > 86400000){ localStorage.removeItem('cj_draft_quedada'); return; }
        // Solo restaurar si el formulario está vacío
        if(document.getElementById('q-titulo')?.value) return;
        if(d.titulo) document.getElementById('q-titulo').value = d.titulo;
        if(d.fecha) document.getElementById('q-fecha').value = d.fecha;
        if(d.horaH){ var hSel=document.getElementById('q-hora-h'); if(hSel) hSel.value = d.horaH; }
        if(d.horaM){ var mSel=document.getElementById('q-hora-m'); if(mSel) mSel.value = d.horaM; }
        if(d.nivel) document.getElementById('q-nivel').value = d.nivel;
        if(d.distancia) document.getElementById('q-distancia-num').value = d.distancia;
        if(d.ritmoMin) document.getElementById('q-ritmo-min').value = d.ritmoMin;
        if(d.ritmoSec) document.getElementById('q-ritmo-sec').value = d.ritmoSec;
        if(d.descripcion) document.getElementById('q-descripcion').value = d.descripcion;
        if(d.ubicacion) document.getElementById('q-ubicacion').value = d.ubicacion;
        if(d.maxParticipantes){ var mpEl=document.getElementById('q-max-participantes'); if(mpEl) mpEl.value = d.maxParticipantes; }
        try{ actualizarHoraCompleta(); }catch(_){}
        try{ updateCrearProgress(); }catch(_){}
        showToast('Borrador restaurado','info');
    }catch(_){}
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
function updateCrearProgress() {
    // Campos obligatorios (peso 15% cada uno = 75% total)
    const camposObligatorios = [
        { field: document.getElementById('q-titulo')?.value?.trim(), weight: 15 },
        { field: pinCoords?.lat, weight: 15 },
        { field: document.getElementById('q-fecha')?.value, weight: 15 },
        { field: document.getElementById('q-hora')?.value, weight: 15 },
        { field: document.getElementById('q-distancia')?.value?.trim(), weight: 15 }
    ];

    // Campos opcionales (peso 5% cada uno = 25% total)
    const camposOpcionales = [
        { field: document.getElementById('q-nivel')?.value !== 'Todos', weight: 5 },
        { field: document.getElementById('q-ritmo')?.value?.trim(), weight: 5 },
        { field: document.getElementById('q-descripcion')?.value?.trim(), weight: 10 },
        { field: document.getElementById('q-ubicacion')?.value?.trim(), weight: 5 }
    ];

    let percent = 0;

    // Sumar campos obligatorios
    camposObligatorios.forEach(c => {
        if (c.field) percent += c.weight;
    });

    // Sumar campos opcionales (bonus)
    camposOpcionales.forEach(c => {
        if (c.field) percent += c.weight;
    });

    // Asegurar que no pase de 100
    percent = Math.min(percent, 100);

    const bar = document.getElementById('crear-progress-bar');
    const text = document.getElementById('crear-progress-text');

    if (bar) {
        bar.style.width = `${percent}%`;
        // Cambiar color según progreso
        if (percent >= 75) {
            bar.className = 'h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300';
        } else if (percent >= 50) {
            bar.className = 'h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300';
        } else {
            bar.className = 'h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300';
        }
    }
    if (text) {
        text.textContent = `${percent}%`;
        if (percent >= 75) {
            text.className = 'text-xs text-green-400 font-semibold';
        } else {
            text.className = 'text-xs text-gray-400 font-semibold';
        }
    }

    // Actualizar preview si hay datos
    updatePreviewCrear();

    // Autosave borrador en localStorage
    try {
        var draft = {
            titulo: document.getElementById('q-titulo')?.value || '',
            fecha: document.getElementById('q-fecha')?.value || '',
            horaH: document.getElementById('q-hora-h')?.value || '',
            horaM: document.getElementById('q-hora-m')?.value || '',
            nivel: document.getElementById('q-nivel')?.value || '',
            distancia: document.getElementById('q-distancia-num')?.value || '',
            ritmoMin: document.getElementById('q-ritmo-min')?.value || '',
            ritmoSec: document.getElementById('q-ritmo-sec')?.value || '',
            descripcion: document.getElementById('q-descripcion')?.value || '',
            ubicacion: document.getElementById('q-ubicacion')?.value || '',
            maxParticipantes: document.getElementById('q-max-participantes')?.value || '',
            ts: Date.now()
        };
        localStorage.setItem('cj_draft_quedada', JSON.stringify(draft));
    } catch(_) {}
}

// ⏰ Actualizar hora completa desde selects separados

function actualizarHoraCompleta() {
    const h = document.getElementById('q-hora-h')?.value || '';
    const m = document.getElementById('q-hora-m')?.value || '';
    const horaInput = document.getElementById('q-hora');

    if (h && m) {
        horaInput.value = `${h}:${m}`;
    } else {
        horaInput.value = '';
    }

    updateCrearProgress();
}

// 📏 Actualizar distancia con validación
function actualizarDistancia() {
    const numInput = document.getElementById('q-distancia-num');
    const distInput = document.getElementById('q-distancia');
    const hint = document.getElementById('distancia-hint');

    const val = parseFloat(numInput?.value) || 0;

    if (val > 0 && val <= 100) {
        distInput.value = `${val} km`;
        hint.textContent = '✓ Distancia válida';
        hint.className = 'text-xs text-green-400 mt-1';
    } else if (val > 100) {
        distInput.value = '';
        hint.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Máximo 100 km';
        hint.className = 'text-xs text-orange-400 mt-1';
    } else {
        distInput.value = '';
        hint.textContent = 'Entre 1 y 100 km';
        hint.className = 'text-xs text-gray-500 mt-1';
    }

    updateCrearProgress();
}

// 🏃 Actualizar ritmo con validación
function actualizarRitmo() {
    const minInput = document.getElementById('q-ritmo-min');
    const secInput = document.getElementById('q-ritmo-sec');
    const ritmoInput = document.getElementById('q-ritmo');
    const hint = document.getElementById('ritmo-hint');

    const min = parseInt(minInput?.value) || 0;
    const sec = parseInt(secInput?.value) || 0;

    if (min >= 3 && min <= 10) {
        const secStr = sec.toString().padStart(2, '0');
        ritmoInput.value = `${min}:${secStr} min/km`;

        // Feedback según el ritmo
        if (min <= 4) {
            hint.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg> Ritmo de élite';
            hint.className = 'text-xs text-purple-400 mt-1';
        } else if (min <= 5) {
            hint.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Ritmo avanzado';
            hint.className = 'text-xs text-red-400 mt-1';
        } else if (min <= 6) {
            hint.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg> Ritmo intermedio';
            hint.className = 'text-xs text-yellow-400 mt-1';
        } else {
            hint.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> Ritmo principiante';
            hint.className = 'text-xs text-green-400 mt-1';
        }
    } else if (min > 0) {
        ritmoInput.value = '';
        hint.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Ritmo entre 3:00 y 10:00 min/km';
        hint.className = 'text-xs text-orange-400 mt-1';
    } else {
        ritmoInput.value = '';
        hint.textContent = 'Ritmo típico: 4:00 (élite) - 7:00 (principiante)';
        hint.className = 'text-xs text-gray-500 mt-1';
    }

    updateCrearProgress();
}

// 📍 Animación del pin cuando se selecciona ubicación

function animatePinCrear() {
    const pin = document.getElementById('pin-fijo');
    if (pin) {
        pin.classList.add('pin-bounce');
        setTimeout(() => pin.classList.remove('pin-bounce'), 500);
    }
}

// 🗺️ REVERSE GEOCODING MEJORADO - Precisión a nivel de calle
async function hacerReverseGeocodingClic(lat, lng) {
    console.log('🗺️ INICIANDO REVERSE GEOCODING:', lat, lng);
    const textoEl = document.getElementById('ubicacion-texto');
    const searchInput = document.getElementById('q-city-search');

    try {
        // Zoom 18 = máxima precisión (nivel edificio/calle)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${currentLang||'es'}`;
        console.log('🗺️ Llamando a:', url);

        const res = await fetchWithTimeout(url, {
            headers: { 'User-Agent': 'CorrerJuntos/1.0' }
        }, 5000);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log('🗺️ RESPUESTA NOMINATIM COMPLETA:', JSON.stringify(data.address, null, 2));

        if (data && data.address) {
            const a = data.address;

            // === EXTRAER DATOS CON MÁXIMA PRECISIÓN ===
            // Nombre específico del lugar (parque, playa, edificio, etc.)
            const nombreLugar = a.amenity || a.tourism || a.leisure || a.building || a.name || '';

            // Calle con número si existe
            const calle = a.road || a.pedestrian || a.footway || a.path || a.way || '';
            const numero = a.house_number || '';
            const calleCompleta = numero ? `${calle} ${numero}` : calle;

            // Barrio/zona
            const barrio = a.suburb || a.neighbourhood || a.quarter || a.hamlet || '';

            // Ciudad/Pueblo
            const pueblo = a.village || a.town || a.city || a.municipality || '';

            // Provincia
            const provincia = a.province || a.state || a.county || '';

            console.log('🗺️ DATOS EXTRAÍDOS:', { nombreLugar, calleCompleta, barrio, pueblo, provincia });

            // === CONSTRUIR TEXTO BADGE (máximo detalle) ===
            // Prioridad: Lugar específico > Calle > Barrio > Pueblo
            let partes = [];

            // Primero: nombre específico O calle
            if (nombreLugar && nombreLugar !== pueblo) {
                partes.push(nombreLugar);
            } else if (calleCompleta) {
                partes.push(calleCompleta);
            }

            // Segundo: barrio (si no está ya incluido)
            if (barrio && !partes.includes(barrio)) {
                partes.push(barrio);
            }

            // Tercero: pueblo + provincia
            if (pueblo) {
                if (provincia && provincia !== pueblo) {
                    partes.push(`${pueblo}, ${provincia}`);
                } else {
                    partes.push(pueblo);
                }
            } else if (provincia) {
                partes.push(provincia);
            }

            // Formatear: "Calle Mayor 15, Centro · Punta Umbría, Huelva"
            let ubicacionBadge = partes.slice(0, 2).join(', ');
            if (partes.length > 2) {
                ubicacionBadge += ' · ' + partes.slice(2).join(' · ');
            }

            const textoFinal = ubicacionBadge || 'Ubicación seleccionada';
            console.log('🗺️ TEXTO FINAL BADGE:', textoFinal);

            // === ACTUALIZAR UI ===
            // Badge con ubicación detallada
            if (textoEl) textoEl.textContent = textoFinal;

            // Campo de búsqueda: solo ciudad + provincia para búsquedas futuras
            const textoBusqueda = pueblo ? (provincia ? `${pueblo}, ${provincia}` : pueblo) : provincia || '';
            if (searchInput && textoBusqueda) {
                searchInput.value = textoBusqueda;
                console.log('🗺️ CAMPO BÚSQUEDA ACTUALIZADO:', textoBusqueda);
            }

            // Campos ocultos
            document.getElementById('q-ciudad').value = pueblo || provincia || 'Ubicación personalizada';
            document.getElementById('q-admin1').value = provincia || '';

            // Toast con información útil
            const toastText = calleCompleta || nombreLugar || barrio || pueblo || 'Ubicación';
            showToast(`🏃 ${toastText} seleccionado`, 'success');

        } else {
            console.log('🗺️ Sin address en respuesta');
            if (textoEl) textoEl.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            showToast('🏃 Ubicación marcada', 'success');
        }

        updateCrearProgress();

    } catch (e) {
        console.error('🗺️ ERROR REVERSE GEOCODING:', e);
        if (textoEl) textoEl.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        showToast('🏃 Ubicación marcada', 'success');
        updateCrearProgress();
    }
}

// 📍 Usar mi ubicación actual
function useMyLocationCrear() {
    const btn = document.getElementById('btn-my-location-crear');
    if (!navigator.geolocation) {
        showToast('Tu navegador no soporta geolocalización', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>';

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (mapCrear) {
                mapCrear.setView([lat, lng], 16);
            }
            btn.disabled = false;
            btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span class="hidden sm:inline">Mi ubicación</span>';
            showToast('Ubicación actualizada', 'success');
        },
        (err) => {
            btn.disabled = false;
            btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span class="hidden sm:inline">Mi ubicación</span>';
            const msg = err.code === 1 ? 'Permiso de ubicación denegado' : 'No se pudo obtener tu ubicación';
            showToast(msg, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// 📝 Contador de caracteres descripción

function updateDescCounter() {
    const desc = document.getElementById('q-descripcion');
    const counter = document.getElementById('desc-counter');
    if (desc && counter) {
        const len = desc.value.length;
        counter.textContent = `${len}/500`;
        counter.className = len > 450 ? 'text-xs text-orange-400' : 'text-xs text-gray-500';
    }
    updateCrearProgress();
}

// 💡 Agregar snippet a descripción
function addDescSnippet(snippet) {
    const desc = document.getElementById('q-descripcion');
    if (desc) {
        const current = desc.value.trim();
        desc.value = current ? `${current} ${snippet}` : snippet;
        updateDescCounter();
    }
}

// ========== TERRENO, DESNIVEL Y AMENITIES ==========
let selectedTerreno = '';
let selectedDesnivel = '';
let selectedAmenities = [];

function selectTerreno(value) {
    document.querySelectorAll('.terreno-btn').forEach(btn => {
        btn.classList.remove('active', 'border-orange-500', 'bg-orange-500/20', 'text-orange-400');
        btn.classList.add('border-slate-600/50', 'text-gray-400');
    });

    if (selectedTerreno === value) {
        selectedTerreno = '';
    } else {
        selectedTerreno = value;
        const btn = document.getElementById(`terreno-${value}`);
        if (btn) {
            btn.classList.remove('border-slate-600/50', 'text-gray-400');
            btn.classList.add('active', 'border-orange-500', 'bg-orange-500/20', 'text-orange-400');
        }
    }
    document.getElementById('q-terreno').value = selectedTerreno;
    updateCrearProgress();
}

function selectDesnivel(value) {
    document.querySelectorAll('.desnivel-btn').forEach(btn => {
        btn.classList.remove('active', 'border-orange-500', 'bg-orange-500/20', 'text-orange-400');
        btn.classList.add('border-slate-600/50', 'text-gray-400');
    });

    if (selectedDesnivel === value) {
        selectedDesnivel = '';
    } else {
        selectedDesnivel = value;
        const btn = document.getElementById(`desnivel-${value}`);
        if (btn) {
            btn.classList.remove('border-slate-600/50', 'text-gray-400');
            btn.classList.add('active', 'border-orange-500', 'bg-orange-500/20', 'text-orange-400');
        }
    }
    document.getElementById('q-desnivel').value = selectedDesnivel;
    updateCrearProgress();
}

function toggleAmenity(value) {
    const idx = selectedAmenities.indexOf(value);
    const btn = document.getElementById(`amenity-${value}`);

    if (idx > -1) {
        selectedAmenities.splice(idx, 1);
        if (btn) {
            btn.classList.remove('active', 'border-blue-500', 'bg-blue-500/20', 'text-blue-400');
            btn.classList.add('border-slate-600/50', 'text-gray-400');
        }
    } else {
        selectedAmenities.push(value);
        if (btn) {
            btn.classList.remove('border-slate-600/50', 'text-gray-400');
            btn.classList.add('active', 'border-blue-500', 'bg-blue-500/20', 'text-blue-400');
        }
    }
    document.getElementById('q-amenities').value = JSON.stringify(selectedAmenities);
    updateCrearProgress();
}

function resetTerrenoAmenities() {
    selectedTerreno = '';
    selectedDesnivel = '';
    selectedAmenities = [];
    document.querySelectorAll('.terreno-btn, .desnivel-btn, .amenity-btn').forEach(btn => {
        btn.classList.remove('active', 'border-orange-500', 'border-blue-500', 'bg-orange-500/20', 'bg-blue-500/20', 'text-orange-400', 'text-blue-400');
        btn.classList.add('border-slate-600/50', 'text-gray-400');
    });
    if (document.getElementById('q-terreno')) document.getElementById('q-terreno').value = '';
    if (document.getElementById('q-desnivel')) document.getElementById('q-desnivel').value = '';
    if (document.getElementById('q-amenities')) document.getElementById('q-amenities').value = '';
}

// 🎯 Actualizar sugerencia de ritmo según nivel
function updateRitmoSugerido() {
    const nivel = document.getElementById('q-nivel')?.value;
    const ritmoInput = document.getElementById('q-ritmo');
    const hint = document.getElementById('nivel-hint');

    const ritmos = {
        'Principiante': { placeholder: 'Ej: 6:30-7:00 min/km', hint: 'Ideal para quienes empiezan o prefieren ritmo relajado' },
        'Intermedio': { placeholder: 'Ej: 5:30-6:00 min/km', hint: 'Para runners con experiencia moderada' },
        'Avanzado': { placeholder: 'Ej: 4:30-5:00 min/km', hint: 'Ritmo exigente para runners experimentados' },
        'Todos': { placeholder: 'Ej: 5:30 min/km (flexible)', hint: 'Abierto a todos los niveles - ¡nadie se queda atrás!' }
    };

    const config = ritmos[nivel] || ritmos['Todos'];
    if (ritmoInput) ritmoInput.placeholder = config.placeholder;
    if (hint) hint.textContent = config.hint;

    updateCrearProgress();
}

// 👁️ Toggle preview
function togglePreviewCrear() {
    const preview = document.getElementById('quedada-preview');
    if (preview) {
        preview.classList.toggle('hidden');
        if (!preview.classList.contains('hidden')) {
            updatePreviewCrear();
            preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// 👁️ Actualizar preview
function updatePreviewCrear() {
    const titulo = document.getElementById('q-titulo')?.value || 'Título de la quedada';
    const nivel = document.getElementById('q-nivel')?.value || 'Todos';
    const fecha = document.getElementById('q-fecha')?.value;
    const hora = document.getElementById('q-hora')?.value;
    const ubicacion = document.getElementById('ubicacion-texto')?.textContent || 'Ubicación';
    const distancia = document.getElementById('q-distancia')?.value || '--';
    const ritmo = document.getElementById('q-ritmo')?.value || '--';

    const levelColors = {
        'Principiante': 'bg-green-500/20 text-green-400',
        'Intermedio': 'bg-yellow-500/20 text-yellow-400',
        'Avanzado': 'bg-red-500/20 text-red-400',
        'Todos': 'bg-orange-500/20 text-orange-400'
    };

    const previewTitulo = document.getElementById('preview-titulo');
    const previewNivel = document.getElementById('preview-nivel');
    const previewFecha = document.getElementById('preview-fecha');
    const previewUbicacion = document.getElementById('preview-ubicacion');
    const previewDistancia = document.getElementById('preview-distancia');
    const previewRitmo = document.getElementById('preview-ritmo');

    if (previewTitulo) previewTitulo.textContent = titulo || 'Título de la quedada';
    if (previewNivel) {
        previewNivel.textContent = nivel;
        previewNivel.className = `px-2 py-1 rounded-full text-xs font-bold ${levelColors[nivel] || levelColors['Todos']}`;
    }
    if (previewFecha) {
        let fechaStr = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Sin fecha';
        if (fecha) {
            const d = new Date(fecha + 'T00:00:00');
            fechaStr = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> ${d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}`;
        }
        if (hora) fechaStr += ` <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${hora}`;
        previewFecha.textContent = fechaStr;
    }
    if (previewUbicacion) previewUbicacion.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${ubicacion !== 'Selecciona en el mapa...' ? ubicacion : 'Sin ubicación'}`;
    if (previewDistancia) previewDistancia.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> ${distancia || '--'} km`;
    if (previewRitmo) previewRitmo.innerHTML = `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> ${ritmo || '--'}`;
}

// Observar cambios en TODOS los campos del formulario crear quedada
document.addEventListener('DOMContentLoaded', () => {
    const fields = ['q-titulo', 'q-fecha', 'q-hora-h', 'q-hora-m', 'q-distancia-num', 'q-ritmo-min', 'q-ritmo-sec', 'q-nivel', 'q-descripcion', 'q-ubicacion', 'q-max-participantes'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateCrearProgress);
            el.addEventListener('change', updateCrearProgress);
        }
    });
});

// Autosave directo: guardar borrador al escribir en cualquier campo del modal crear
function saveDraftQuedada(){
    try {
        var draft = {
            titulo: document.getElementById('q-titulo')?.value || '',
            fecha: document.getElementById('q-fecha')?.value || '',
            horaH: document.getElementById('q-hora-h')?.value || '',
            horaM: document.getElementById('q-hora-m')?.value || '',
            nivel: document.getElementById('q-nivel')?.value || '',
            distancia: document.getElementById('q-distancia-num')?.value || '',
            ritmoMin: document.getElementById('q-ritmo-min')?.value || '',
            ritmoSec: document.getElementById('q-ritmo-sec')?.value || '',
            descripcion: document.getElementById('q-descripcion')?.value || '',
            ubicacion: document.getElementById('q-ubicacion')?.value || '',
            maxParticipantes: document.getElementById('q-max-participantes')?.value || '',
            ts: Date.now()
        };
        // Solo guardar si hay al menos un campo con contenido
        if(draft.titulo || draft.fecha || draft.descripcion || draft.ubicacion){
            localStorage.setItem('cj_draft_quedada', JSON.stringify(draft));
        }
    } catch(_) {}
}

// Delegación de eventos: capturar CUALQUIER input/change dentro del modal crear
document.addEventListener('DOMContentLoaded', () => {
    var modalCrear = document.getElementById('modal-crear');
    if(modalCrear){
        modalCrear.addEventListener('input', function(e){
            if(e.target.matches('input, select, textarea')){ saveDraftQuedada(); }
        });
        modalCrear.addEventListener('change', function(e){
            if(e.target.matches('input, select, textarea')){ saveDraftQuedada(); }
        });
    }
});

// ===================== MAPA CON PIN FIJO (estilo Uber/Google Maps) =====================

function initMapCrear(){
  if(mapCrear){ 
    mapCrear.invalidateSize(); 
    return; 
  }
  
  // Intentar obtener ubicación del usuario, si no, usar España centro
  let startLat = 40.4167, startLng = -3.7038, startZoom = 6;
  
  // Si el usuario tiene ubicación guardada, usarla
  if(userLoc && userLoc.lat && userLoc.lng) {
    startLat = userLoc.lat;
    startLng = userLoc.lng;
    startZoom = 14;
  }
  
  mapCrear = L.map('map-crear', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([startLat, startLng], startZoom);
  mapCrear.attributionControl.setPrefix('<a href="https://leafletjs.com" title="A JavaScript library for interactive maps" target="_blank" rel="noopener noreferrer">Leaflet</a>');

  // Tiles: light/dark según tema actual
  var isLight = document.body.classList.contains('light-mode');
  L.tileLayer(isLight
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 19
  }).addTo(mapCrear);
  
  // Actualizar ubicación cuando el mapa deja de moverse (arrastrar)
  mapCrear.on('moveend', function(){
    const center = mapCrear.getCenter();
    pinCoords = { lat: center.lat, lng: center.lng };
    document.getElementById('q-lat').value = center.lat;
    document.getElementById('q-lng').value = center.lng;
    reverseGeocode(center.lat, center.lng);
  });

  // 🆕 CLIC EN EL MAPA - Centrar en el punto clicado o dibujar ruta
  mapCrear.on('click', function(e){
    const { lat, lng } = e.latlng;

    // PREMIUM: Route drawing mode - add point instead of centering
    if (routeDrawingActive) {
        addRoutePoint(e.latlng);
        return; // Don't move the pin
    }

    console.log('🗺️ CLIC EN MAPA:', lat, lng); // DEBUG

    // Animar el pin antes de mover
    animatePinCrear();

    // Actualizar coordenadas inmediatamente
    pinCoords = { lat, lng };
    document.getElementById('q-lat').value = lat;
    document.getElementById('q-lng').value = lng;

    // Mostrar "buscando..." mientras se obtiene el nombre
    const textoEl = document.getElementById('ubicacion-texto');
    if (textoEl) {
      textoEl.textContent = '⏳ Buscando ubicación...';
      console.log('🗺️ Mostrando "Buscando ubicación..."'); // DEBUG
    }

    // Centrar mapa (sin animación para que sea más rápido)
    mapCrear.setView([lat, lng], mapCrear.getZoom() < 14 ? 15 : mapCrear.getZoom(), { animate: false });

    // Llamar reverse geocoding directamente
    hacerReverseGeocodingClic(lat, lng);
  });

  // Disparar reverse geocode inicial si hay ubicación
  setTimeout(() => {
    const center = mapCrear.getCenter();
    pinCoords = { lat: center.lat, lng: center.lng };
    document.getElementById('q-lat').value = center.lat;
    document.getElementById('q-lng').value = center.lng;
    if(startZoom >= 10) {
      reverseGeocode(center.lat, center.lng);
    }
  }, 500);
  
  // Intentar geolocalización automática
  if(navigator.geolocation && !userLoc) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapCrear.setView([lat, lng], 14);
      },
      () => { /* ignorar error */ },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }
}

// Reverse geocoding con Nominatim (gratuito) - MEJORADO con precisión calle
let reverseGeocodeTimeout = null;
function reverseGeocode(lat, lng) {
  clearTimeout(reverseGeocodeTimeout);
  const textoEl = document.getElementById('ubicacion-texto');
  const searchInput = document.getElementById('q-city-search');
  textoEl.textContent = '⏳ Buscando ubicación...';

  reverseGeocodeTimeout = setTimeout(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${currentLang||'es'}`;
      const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0' }}, 5000);
      const data = await res.json();

      if(data && data.address) {
        const a = data.address;

        // === EXTRAER DATOS CON MÁXIMA PRECISIÓN ===
        const nombreLugar = a.amenity || a.tourism || a.leisure || a.building || a.name || '';
        const calle = a.road || a.pedestrian || a.footway || a.path || a.way || '';
        const numero = a.house_number || '';
        const calleCompleta = numero ? `${calle} ${numero}` : calle;
        const barrio = a.suburb || a.neighbourhood || a.quarter || a.hamlet || '';
        const pueblo = a.village || a.town || a.city || a.municipality || '';
        const provincia = a.province || a.state || a.county || '';

        // === CONSTRUIR TEXTO BADGE (máximo detalle) ===
        let partes = [];

        if (nombreLugar && nombreLugar !== pueblo) {
            partes.push(nombreLugar);
        } else if (calleCompleta) {
            partes.push(calleCompleta);
        }

        if (barrio && !partes.includes(barrio)) {
            partes.push(barrio);
        }

        if (pueblo) {
            if (provincia && provincia !== pueblo) {
                partes.push(`${pueblo}, ${provincia}`);
            } else {
                partes.push(pueblo);
            }
        } else if (provincia) {
            partes.push(provincia);
        }

        let ubicacionBadge = partes.slice(0, 2).join(', ');
        if (partes.length > 2) {
            ubicacionBadge += ' · ' + partes.slice(2).join(' · ');
        }

        textoEl.textContent = ubicacionBadge || 'Ubicación seleccionada';
        updateCrearProgress();

        // Auto-rellenar campo de búsqueda
        const textoBusqueda = pueblo ? (provincia ? `${pueblo}, ${provincia}` : pueblo) : provincia || '';
        if (searchInput && textoBusqueda) {
            searchInput.value = textoBusqueda;
        }

        // Guardar ciudad y admin1
        document.getElementById('q-ciudad').value = pueblo || provincia || 'Ubicación personalizada';
        document.getElementById('q-admin1').value = provincia || '';

      } else {
        textoEl.textContent = 'Ubicación seleccionada';
        document.getElementById('q-ciudad').value = 'Ubicación personalizada';
      }
    } catch(e) {
      console.warn('Reverse geocode error:', e);
      textoEl.textContent = 'Ubicación seleccionada';
      document.getElementById('q-ciudad').value = 'Ubicación personalizada';
    }
  }, 600); // Debounce de 600ms
}

// Buscar lugar (opcional)
let searchPlaceTimeout = null;
function onSearchPlaceCrear() {
  clearTimeout(searchPlaceTimeout);
  const input = document.getElementById('q-buscar-lugar');
  const suggestions = document.getElementById('q-lugar-suggestions');
  const query = (input?.value || '').trim();
  
  if(query.length < 3) {
    suggestions.classList.add('hidden');
    return;
  }
  
  searchPlaceTimeout = setTimeout(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=${currentLang||'es'}`;
      const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0' }}, 5000);
      const data = await res.json();
      
      if(data && data.length > 0) {
        suggestions.innerHTML = data.map(item => `
          <div class="p-3 hover:bg-orange-500/20 cursor-pointer border-b border-slate-700 last:border-0" 
               onclick="selectSearchPlace(${item.lat}, ${item.lon}, '${escapeHtml(item.display_name).replace(/'/g, "\\'")}')">
            <div class="text-white text-sm font-medium">${escapeHtml(item.display_name.split(',')[0])}</div>
            <div class="text-gray-500 text-xs truncate">${escapeHtml(item.display_name)}</div>
          </div>
        `).join('');
        suggestions.classList.remove('hidden');
      } else {
        suggestions.innerHTML = '<div class="p-3 text-gray-500 text-sm">No se encontraron resultados</div>';
        suggestions.classList.remove('hidden');
      }
    } catch(e) {
      console.warn('Search error:', e);
      suggestions.classList.add('hidden');
    }
  }, 400);
}

function selectSearchPlace(lat, lng, name) {
  document.getElementById('q-lugar-suggestions').classList.add('hidden');
  document.getElementById('q-buscar-lugar').value = '';
  
  if(mapCrear) {
    mapCrear.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
  }
}

function updateMapCrear(forceCountry=false){
  // Ya no necesitamos esta función compleja, el mapa se actualiza solo
  if(!mapCrear) return;
  mapCrear.invalidateSize(true);
}

// ===================== LANDING PAGE: SOCIAL PROOF STATS =====================
// Landing stats: Use static HTML values (1.2K+, 850+, 55+, 12) — no Supabase fetch

    // ─── Expose to window ────────────────────────────────
    window.toggleMapSize = toggleMapSize;
    window.toggleFullscreenMap = toggleFullscreenMap;
    window.getNivelColor = getNivelColor;
    window.ensureLeaflet = ensureLeaflet;
    window.ensureHtml2Canvas = ensureHtml2Canvas;
    window.initMap = initMap;
    window.recenterMap = recenterMap;
    window.updateMapTiles = updateMapTiles;
    window.getCountryCenter = getCountryCenter;
    window.matchesCountry = matchesCountry;
    window.setGeoFilterMode = setGeoFilterMode;
    window.updateGeoFilterUI = updateGeoFilterUI;
    window.detectUserCountry = detectUserCountry;
    window.haversineKm = haversineKm;
    window.setLocateBtnActive = setLocateBtnActive;
    window.locateMe = locateMe;
    window.updateMarkers = updateMarkers;
    window.getCrearCountryCode = getCrearCountryCode;
    window.renderAddressSuggestionsCrear = renderAddressSuggestionsCrear;
    window.closeAddressSuggestionsCrear = closeAddressSuggestionsCrear;
    window.fetchAddressSuggestionsCrear = fetchAddressSuggestionsCrear;
    window.onAddressInputCrear = onAddressInputCrear;
    window.selectAddressResultCrear = selectAddressResultCrear;
    window.tryFillAddressFromCoords = tryFillAddressFromCoords;
    window.openModalCrear = openModalCrear;
    window.restoreDraftQuedada = restoreDraftQuedada;
    window.updateCrearProgress = updateCrearProgress;
    window.actualizarHoraCompleta = actualizarHoraCompleta;
    window.actualizarDistancia = actualizarDistancia;
    window.actualizarRitmo = actualizarRitmo;
    window.animatePinCrear = animatePinCrear;
    window.hacerReverseGeocodingClic = hacerReverseGeocodingClic;
    window.useMyLocationCrear = useMyLocationCrear;
    window.updateDescCounter = updateDescCounter;
    window.addDescSnippet = addDescSnippet;
    window.selectTerreno = selectTerreno;
    window.selectDesnivel = selectDesnivel;
    window.toggleAmenity = toggleAmenity;
    window.resetTerrenoAmenities = resetTerrenoAmenities;
    window.updateRitmoSugerido = updateRitmoSugerido;
    window.togglePreviewCrear = togglePreviewCrear;
    window.updatePreviewCrear = updatePreviewCrear;
    window.saveDraftQuedada = saveDraftQuedada;
    window.initMapCrear = initMapCrear;
    window.reverseGeocode = reverseGeocode;
    window.onSearchPlaceCrear = onSearchPlaceCrear;
    window.selectSearchPlace = selectSearchPlace;
    window.updateMapCrear = updateMapCrear;
})();
