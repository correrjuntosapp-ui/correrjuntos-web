// CorrerJuntos App — externalized 2026-02-23

        // Lazy-load helper (available to all scopes)
        function lazyLoadScript(src) {
            if (document.querySelector('script[src="'+src+'"]')) return;
            var s = document.createElement('script');
            s.src = src; s.async = true;
            document.head.appendChild(s);
        }

        // C1: Load strava.js on-demand (returns promise)
        function ensureStravaLoaded() {
            return new Promise(function(resolve) {
                if (typeof window.connectStrava === 'function' && window._stravaRealLoaded) { resolve(); return; }
                lazyLoadScript('/js/strava.js');
                var attempts = 0;
                var check = setInterval(function() {
                    attempts++;
                    if (typeof window.handleStravaCallback === 'function' || attempts > 50) {
                        clearInterval(check);
                        window._stravaRealLoaded = true;
                        resolve();
                    }
                }, 100);
            });
        }

        // C2: Load push.js on-demand (returns promise)
        function ensurePushLoaded() {
            return new Promise(function(resolve) {
                if (typeof window.requestPushPermission === 'function') { resolve(); return; }
                lazyLoadScript('/js/push.js');
                var attempts = 0;
                var check = setInterval(function() {
                    attempts++;
                    if (typeof window.requestPushPermission === 'function' || attempts > 50) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
            });
        }

        // C5: Unified country-code → flag map (was duplicated 3x)
        const COUNTRY_CODE_FLAGS = {
            'ES': '🇪🇸', 'PT': '🇵🇹', 'AR': '🇦🇷', 'MX': '🇲🇽', 'CO': '🇨🇴', 'PE': '🇵🇪',
            'CL': '🇨🇱', 'EC': '🇪🇨', 'VE': '🇻🇪', 'UY': '🇺🇾', 'PY': '🇵🇾', 'BO': '🇧🇴',
            'CR': '🇨🇷', 'PA': '🇵🇦', 'GT': '🇬🇹', 'HN': '🇭🇳', 'SV': '🇸🇻', 'NI': '🇳🇮',
            'CU': '🇨🇺', 'DO': '🇩🇴', 'PR': '🇵🇷', 'US': '🇺🇸', 'FR': '🇫🇷', 'IT': '🇮🇹',
            'DE': '🇩🇪', 'GB': '🇬🇧', 'BR': '🇧🇷', 'PH': '🇵🇭', 'GQ': '🇬🇶'
        };

// ========================= MAIN APP =========================
        // CITIES, PROVINCIAS_ES, DISTRITOS_PT, POBLACIONES, LOCATIONS_ES_PT
        // → cargados desde /data/geo-data.js

        
        // ========== BUSCADOR DE UBICACIÓN CON AUTOCOMPLETADO ==========
        let ubicacionSearchTimeout = null;

        function searchUbicacionRegistro(query) {
            clearTimeout(ubicacionSearchTimeout);
            const dropdown = document.getElementById('reg-ubicacion-dropdown');

            if (!query || query.length < 2) {
                dropdown.classList.add('hidden');
                return;
            }

            ubicacionSearchTimeout = setTimeout(async () => {
                const normalizedQuery = norm(query);

                // Primero buscar en datos locales (España/Portugal)
                const localResults = locationsIndex
                    .filter(loc => loc.n_place.includes(normalizedQuery) || loc.n_admin1.includes(normalizedQuery))
                    .slice(0, 5);

                // También buscar en POBLACIONES
                const poblacionResults = [];
                for (const [provincia, poblaciones] of Object.entries(POBLACIONES)) {
                    for (const poblacion of poblaciones) {
                        if (norm(poblacion).includes(normalizedQuery)) {
                            poblacionResults.push({ place: poblacion, admin1: provincia, country: 'ES', type: 'town' });
                        }
                    }
                }

                // Combinar resultados locales
                let allResults = [...localResults];
                for (const pob of poblacionResults) {
                    if (!allResults.find(r => norm(r.place) === norm(pob.place))) {
                        allResults.push(pob);
                    }
                }

                // Si hay pocos resultados locales, buscar globalmente con Nominatim
                if (allResults.length < 4 && query.length >= 3) {
                    try {
                        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=es&featuretype=city`;
                        const res = await fetch(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0' }});
                        const data = await res.json();

                        for (const item of data) {
                            const parts = item.display_name.split(',').map(s => s.trim());
                            const place = parts[0] || query;
                            const admin1 = parts[1] || parts[2] || '';
                            const countryName = parts[parts.length - 1] || '';
                            const countryFlag = getCountryFlag(countryName);

                            if (!allResults.find(r => norm(r.place) === norm(place))) {
                                allResults.push({
                                    place: place,
                                    admin1: admin1,
                                    country: countryName,
                                    countryFlag: countryFlag,
                                    type: 'city',
                                    global: true
                                });
                            }
                        }
                    } catch(e) { console.warn('Nominatim search error:', e); }
                }

                // Ordenar: primero coincidencias exactas
                allResults.sort((a, b) => {
                    const aStartsWith = norm(a.place).startsWith(normalizedQuery) ? 0 : 1;
                    const bStartsWith = norm(b.place).startsWith(normalizedQuery) ? 0 : 1;
                    return aStartsWith - bStartsWith;
                });

                renderUbicacionDropdown(allResults.slice(0, 8));
            }, 250);
        }

        function getCountryFlag(countryName) {
            const flags = {
                'argentina': '🇦🇷', 'bolivia': '🇧🇴', 'brasil': '🇧🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴',
                'costa rica': '🇨🇷', 'cuba': '🇨🇺', 'ecuador': '🇪🇨', 'el salvador': '🇸🇻',
                'españa': '🇪🇸', 'spain': '🇪🇸', 'estados unidos': '🇺🇸', 'united states': '🇺🇸',
                'guatemala': '🇬🇹', 'honduras': '🇭🇳', 'méxico': '🇲🇽', 'mexico': '🇲🇽',
                'nicaragua': '🇳🇮', 'panamá': '🇵🇦', 'paraguay': '🇵🇾', 'perú': '🇵🇪', 'peru': '🇵🇪',
                'portugal': '🇵🇹', 'puerto rico': '🇵🇷', 'república dominicana': '🇩🇴',
                'uruguay': '🇺🇾', 'venezuela': '🇻🇪', 'francia': '🇫🇷', 'france': '🇫🇷',
                'italia': '🇮🇹', 'italy': '🇮🇹', 'alemania': '🇩🇪', 'germany': '🇩🇪',
                'reino unido': '🇬🇧', 'united kingdom': '🇬🇧', 'filipinas': '🇵🇭', 'philippines': '🇵🇭'
            };
            return flags[(countryName || '').toLowerCase()] || '🌍';
        }

        // → moved to js/modules/ui.js (15 lines)

        function renderUbicacionDropdown(results) {
            const dropdown = document.getElementById('reg-ubicacion-dropdown');

            if (results.length === 0) {
                dropdown.innerHTML = '<div class="p-4 text-gray-400 text-center">No se encontraron resultados</div>';
                dropdown.classList.remove('hidden');
                return;
            }

            dropdown.innerHTML = results.map(loc => {
                const flag = loc.global ? (loc.countryFlag || '🌍') : (loc.country === 'PT' ? '🇵🇹' : '🇪🇸');
                const typeLabel = loc.type === 'city' ? 'Ciudad' : loc.type === 'town' ? 'Pueblo' : loc.type === 'province' || loc.type === 'district' ? 'Provincia' : '';
                const pais = loc.global ? loc.country : (loc.country === 'PT' ? 'Portugal' : 'España');

                return `
                    <div class="p-3 hover:bg-slate-700 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-700 last:border-0"
                         onclick="selectUbicacionRegistro('${escapeInlineArg(loc.place)}', '${escapeInlineArg(loc.admin1)}', '${escapeInlineArg(pais)}')">
                        <span class="text-2xl">${flag}</span>
                        <div class="flex-1">
                            <div class="font-semibold text-white">${escapeLocationText(loc.place)}</div>
                            <div class="text-xs text-gray-400">${escapeLocationText(loc.admin1)} - ${escapeLocationText(typeLabel)}</div>
                        </div>
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                `;
            }).join('');

            dropdown.classList.remove('hidden');
        }

        function selectUbicacionRegistro(poblacion, provincia, pais) {
            const searchInput = document.getElementById('reg-ubicacion-search');
            const dropdown = document.getElementById('reg-ubicacion-dropdown');

            // Mostrar selección en el input
            searchInput.value = `${poblacion}, ${provincia}`;

            // Guardar valores en campos ocultos
            document.getElementById('reg-pais').value = pais;
            document.getElementById('reg-ciudad').value = provincia;
            document.getElementById('reg-poblacion').value = poblacion;

            // Ocultar dropdown
            dropdown.classList.add('hidden');

            // Efecto visual de confirmación
            searchInput.classList.add('ring-2', 'ring-green-500');
            setTimeout(() => searchInput.classList.remove('ring-2', 'ring-green-500'), 1000);
        }

        function showUbicacionDropdown() {
            const query = document.getElementById('reg-ubicacion-search')?.value || '';
            if (query.length >= 2) {
                searchUbicacionRegistro(query);
            }
        }

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('reg-ubicacion-dropdown');
            const searchInput = document.getElementById('reg-ubicacion-search');
            if (dropdown && searchInput && !dropdown.contains(e.target) && e.target !== searchInput) {
                dropdown.classList.add('hidden');
            }
        });

        // Legacy stubs removed (Phase 6 cleanup)
        // LOCATIONS_ES_PT → cargado desde /data/geo-data.js
        let locationsIndex = [];

        function norm(s){
          return (s||'').toString().trim().toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g,'');
        }
        function buildLocationsIndex(){
          locationsIndex = LOCATIONS_ES_PT.map(x => ({...x, n_place:norm(x.place), n_admin1:norm(x.admin1)}));
        }
        
        function getCityCenterByName(name){
          const n = norm(name);
          // Prefer locations index (ES/PT) for accurate matches
          const hit = locationsIndex.find(x => x.n_place === n && (x.type==='city' || x.type==='town' || x.type==='district' || x.type==='province'));
          if(hit) return {lat: hit.lat, lng: hit.lng};
          // Fallback to predefined cities map (supports accents via normalization)
          for(const [k,v] of Object.entries(CITIES||{})){
            if(norm(k)===n) return v;
          }
          return null;
        }
function countryName(code){ return code==='PT' ? 'Portugal' : 'España'; }
        function typePill(item){
          if(item.type==='province') return currentLang==='en' ? 'Province' : (currentLang==='pt' ? 'Província' : 'Provincia');
          if(item.type==='district') return currentLang==='en' ? 'District' : (currentLang==='pt' ? 'Distrito' : 'Distrito');
          if(item.type==='town') return currentLang==='en' ? 'Town' : (currentLang==='pt' ? 'Vila' : 'Pueblo');
          return currentLang==='en' ? 'City' : (currentLang==='pt' ? 'Cidade' : 'Ciudad');
        }
        function formatSuggestion(item){
          const sub = item.admin1 ? `${item.admin1} • ${countryName(item.country)}` : countryName(item.country);
          return `<div class="suggest-item" data-place="${item.place.replace(/"/g,'&quot;')}" data-admin1="${(item.admin1||'').replace(/"/g,'&quot;')}" data-country="${item.country}" data-type="${item.type}" data-lat="${item.lat}" data-lng="${item.lng}">
                    <div>
                      <div class="suggest-main">${item.place}</div>
                      <div class="suggest-sub">${sub}</div>
                    </div>
                    <span class="suggest-pill">${typePill(item)}</span>
                  </div>`;
        }
        function hideSuggestionsCrear(){
          const box=document.getElementById('q-city-suggestions');
          if(!box) return;
          box.classList.add('hidden');
          box.innerHTML='';
        }
        function onCountryChangeCrear(){
          document.getElementById('q-ciudad').value='';
          document.getElementById('q-admin1').value='';
          const inp=document.getElementById('q-city-search');
          inp.value='';
          placeCenter=null;
          pinCoords=null;
          if(window.markerCrear && window.mapCrear){ try{ mapCrear.removeLayer(markerCrear);}catch(e){} markerCrear=null; }
          hideSuggestionsCrear();
          updateMapCrear(true);
        }
        function onPlaceInputCrear(){
          const country=document.getElementById('q-country').value||'ES';
          const q=norm(document.getElementById('q-city-search').value);
          const box=document.getElementById('q-city-suggestions');
          if(!box) return;
          if(!q){ hideSuggestionsCrear(); return; }
          const results = locationsIndex
            .filter(x=>x.country===country && (x.n_place.includes(q) || x.n_admin1.includes(q)))
            .slice(0, 12);
          if(!results.length){
            box.innerHTML = `<div class="p-3 text-sm text-gray-300">${currentLang==='en'?'No matches. You can keep typing and continue.':(currentLang==='pt'?'Sem resultados. Pode continuar a escrever e avançar.':'Sin coincidencias. Puedes seguir escribiendo y continuar.')}</div>`;
            box.classList.remove('hidden');
            return;
          }
          box.innerHTML = results.map(formatSuggestion).join('');
          box.classList.remove('hidden');
          box.querySelectorAll('.suggest-item').forEach(el=>{
            el.addEventListener('click', ()=>{
              const place=el.getAttribute('data-place')||'';
              const admin1=el.getAttribute('data-admin1')||'';
              const ctry=el.getAttribute('data-country')||country;
              const type=el.getAttribute('data-type')||'city';
              const lat=parseFloat(el.getAttribute('data-lat'));
              const lng=parseFloat(el.getAttribute('data-lng'));
              document.getElementById('q-city-search').value = place;
              document.getElementById('q-ciudad').value = place;
              document.getElementById('q-admin1').value = admin1;
              document.getElementById('q-country').value = ctry;
              // Selecting a place recenters the map but does not "pin" the exact meetup point.
              // Pin is set via street selection or map click.
              if(Number.isFinite(lat) && Number.isFinite(lng)){
                const z = (type==='province' || type==='district') ? 9 : (type==='town' ? 12 : 12);
                placeCenter = {lat, lng, z};
              } else {
                placeCenter = null;
              }
              pinCoords = null;
              if(window.markerCrear && window.mapCrear){ try{ mapCrear.removeLayer(markerCrear);}catch(e){} markerCrear=null; }
              hideSuggestionsCrear();
              updateMapCrear();
            });
          });
        }
        document.addEventListener('click', (e)=>{
          const box=document.getElementById('q-city-suggestions');
          const inp=document.getElementById('q-city-search');
          if(!box||!inp) return;
          if(!inp.parentElement.contains(e.target)) hideSuggestionsCrear();
        });
        // Close "Más" dropdown when clicking outside
        document.addEventListener('click', (e)=>{
          const dd=document.getElementById('nav-more-dropdown');
          const menu=document.getElementById('nav-more-menu');
          if(dd&&menu&&!dd.contains(e.target)) menu.classList.add('hidden');
        });

        // Auto-detectar idioma: URL param > localStorage > navegador
        function detectBrowserLanguage() {
            // Use the language detected early by the i18n loader in <head>
            if (window.__cjLang) return window.__cjLang;
            // Fallback: same logic as the <head> loader
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            const supported = ['es','en','pt','ru'];
            if (urlLang && supported.includes(urlLang)) {
                localStorage.setItem('cj_lang', urlLang);
                return urlLang;
            }
            const stored = localStorage.getItem('cj_lang');
            if (stored && supported.includes(stored)) return stored;
            // Bots (Google, Bing, etc.) must always see Spanish (the server-rendered default)
            if (/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent)) return 'es';
            const browserLang = (navigator.language || navigator.userLanguage || 'es').split('-')[0].toLowerCase();
            return supported.includes(browserLang) ? browserLang : 'es';
        }
        // State: initialized via AppState shims (js/modules/state.js)
        currentLang = detectBrowserLanguage();
        // Sincronizar lang del HTML con el idioma detectado
        document.documentElement.lang = currentLang;
        // map, markers, mapCrear, markerCrear, placeCenter, pinCoords → via AppState shims
        // currentUser, isUserPremium, userPlan → via AppState shims
        // PLAN_FEATURES, getEffectivePlan, can → defined in state.js

        function getActiveQuedadasCount() {
            if (!currentUser) return 0;
            const today = new Date().toISOString().split('T')[0];
            return quedadas.filter(q => q.creador_id === currentUser.id && !q.es_seed && q.fecha >= today).length;
        }

        // ====== GA4 TRACKING HELPERS ======
        function trackPremiumCTA(source) {
            if (typeof gtag === 'function') gtag('event', 'premium_cta_click', { source });
        }

        // ====== DASHBOARD V2 FUNCTIONS ======
        function updatePlanStatusBar() {
            const bar = document.getElementById('plan-status-bar');
            if (!bar || !currentUser) return;
            if (getEffectivePlan() === 'premium') { bar.classList.add('hidden'); return; }
            bar.classList.remove('hidden');
            const badge = document.getElementById('plan-status-badge');
            const counter = document.getElementById('plan-counter-value');
            const upgradeBtn = document.getElementById('plan-status-upgrade');
            const progressBar = document.getElementById('plan-progress-bar');
            const limitWarning = document.getElementById('plan-limit-warning');
            const count = getActiveQuedadasCount();
            const max = PLAN_FEATURES.free.maxActiveMeetups;
            if (badge) badge.textContent = 'Plan: Básico';
            if (counter) {
                counter.textContent = count + '/' + max;
                if (count >= max) counter.className = 'text-red-400 font-bold';
                else if (count === max - 1) counter.className = 'text-yellow-400 font-bold';
                else counter.className = 'text-white font-bold';
            }
            // Progress bar
            if (progressBar) {
                const pct = Math.min((count / max) * 100, 100);
                progressBar.style.width = pct + '%';
                if (count >= max) progressBar.className = 'h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500';
                else if (count === max - 1) progressBar.className = 'h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500';
                else progressBar.className = 'h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500';
            }
            // Limit warning
            if (limitWarning) {
                if (count >= max) limitWarning.classList.remove('hidden');
                else limitWarning.classList.add('hidden');
            }
            if (upgradeBtn) upgradeBtn.classList.toggle('hidden', count >= max);
        }

        function updateDashboardCrearCounter() {
            const el = document.getElementById('dashboard-crear-counter');
            const text = document.getElementById('crear-counter-text');
            if (!el || !currentUser) return;
            if (getEffectivePlan() === 'premium') { el.classList.add('hidden'); return; }
            el.classList.remove('hidden');
            const count = getActiveQuedadasCount();
            const max = PLAN_FEATURES.free.maxActiveMeetups;
            if (text) {
                if (count >= max) {
                    text.textContent = `${count}/${max} — límite alcanzado`;
                    text.className = 'text-sm text-red-400 font-semibold';
                } else if (count === max - 1) {
                    text.textContent = `${count}/${max} este mes — ¡última quedada!`;
                    text.className = 'text-sm text-yellow-400 font-semibold';
                } else {
                    text.textContent = `${count}/${max} este mes`;
                    text.className = 'text-sm text-white font-semibold';
                }
            }
        }

        function updateDynamicPremiumBanner() {
            const el = document.getElementById('premium-dashboard-cta');
            if (!el || !currentUser) return;
            if (getEffectivePlan() === 'premium') { el.classList.add('hidden'); return; }
            el.classList.remove('hidden');
            const titleEl = document.getElementById('premium-banner-title');
            const descEl = document.getElementById('premium-banner-desc');
            const btnEl = document.getElementById('premium-banner-btn');
            const iconEl = document.getElementById('premium-banner-icon');
            const created = (userStats && userStats.created) || 0;
            const joined = (userStats && userStats.quedadas) || 0;
            if (created >= 2) {
                if (iconEl) iconEl.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>';
                if (titleEl) titleEl.textContent = 'Crea sin límites y organiza tu comunidad';
                if (descEl) descEl.textContent = 'Ya has creado ' + created + ' quedadas. Desbloquea quedadas ilimitadas y lidera tu grupo.';
                if (btnEl) btnEl.textContent = 'Empieza tu prueba gratis — 7 días';
            } else if (joined >= 3) {
                if (iconEl) iconEl.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>';
                if (titleEl) titleEl.textContent = 'Encuentra runners compatibles y filtra mejor';
                if (descEl) descEl.textContent = 'Ya has corrido con ' + (userStats.runners || 0) + ' runners. Filtra por ritmo real y nivel.';
                if (btnEl) btnEl.textContent = 'Empieza tu prueba gratis — 7 días';
            } else {
                if (iconEl) iconEl.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>';
                if (titleEl) titleEl.textContent = 'Activa alertas personalizadas y no te pierdas ninguna quedada';
                if (descEl) descEl.textContent = 'Recibe notificaciones cuando aparezca una quedada perfecta para ti.';
                if (btnEl) btnEl.textContent = 'Empieza tu prueba gratis — 7 días';
            }
        }

        // C4: renderMatchingPreview → moved to /js/premium-features.js

        // C4: renderSmartAlertsPreview, PREMIUM_COPY, openPremiumModal → moved to /js/premium-features.js
        // currentFilter → via AppState shim; sidebarView/selectedCommunity/selectedTopic are local UI state
        var sidebarView='communities', selectedCommunity=null, selectedTopic=null;

        // Stripe config
        const STRIPE_PUBLISHABLE_KEY = (function() {
            var h = window.location.hostname;
            if (h === 'correrjuntos.com' || h === 'www.correrjuntos.com') {
                return 'pk_live_51StW9EFwc3v2109GUtuPNcUuNZdN0aH1ZHlw3rOde9KFj1UdENYrF6XjPYbCiBMfCBSYLiUpCr030X12FtG8MOq100DuCkZnit';
            }
            return 'pk_test_51StW9o2EEAYuDEQfbek6jATX57wFUQfZp6uczhIiPmccgSsKGlWZsg8E4MdmY1n9mTUUmi2QxzoxxFtxDtafblSf00u3inRfwR';
        })();

        // quedadas → via AppState shim
        const communities = [
  // ESPAÑA (CCAA)
  {id:1,name:"Andalucía Runners",ciudad:"Andalucía",members:312,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#f97316"},
  {id:2,name:"Aragón Runners",ciudad:"Aragón",members:124,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#ec4899"},
  {id:3,name:"Asturias Runners",ciudad:"Asturias",members:98,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#60a5fa"},
  {id:4,name:"Illes Balears Runners",ciudad:"Illes Balears",members:145,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#a78bfa"},
  {id:5,name:"Canarias Runners",ciudad:"Canarias",members:167,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#22c55e"},
  {id:6,name:"Cantabria Runners",ciudad:"Cantabria",members:76,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#f59e0b"},
  {id:7,name:"Castilla-La Mancha Runners",ciudad:"Castilla-La Mancha",members:132,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#38bdf8"},
  {id:8,name:"Castilla y León Runners",ciudad:"Castilla y León",members:118,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#34d399"},
  {id:9,name:"Cataluña Running",ciudad:"Cataluña",members:289,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#f43f5e"},
  {id:10,name:"Comunidad Valenciana Corre",ciudad:"Comunidad Valenciana",members:214,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#f97316"},
  {id:11,name:"Extremadura Runners",ciudad:"Extremadura",members:64,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#8b5cf6"},
  {id:12,name:"Galicia Running",ciudad:"Galicia",members:153,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#22c55e"},
  {id:13,name:"La Rioja Runners",ciudad:"La Rioja",members:41,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#60a5fa"},
  {id:14,name:"Madrid Runners",ciudad:"Comunidad de Madrid",members:245,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#ec4899"},
  {id:15,name:"Región de Murcia Runners",ciudad:"Región de Murcia",members:97,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#f59e0b"},
  {id:16,name:"Navarra Running",ciudad:"Navarra",members:58,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#38bdf8"},
  {id:17,name:"País Vasco Running",ciudad:"País Vasco",members:133,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#34d399"},

  // ESPAÑA (Ciudades autónomas)
  {id:18,name:"Ceuta Runners",ciudad:"Ceuta",members:35,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#a78bfa"},
  {id:19,name:"Melilla Runners",ciudad:"Melilla",members:30,icon:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',color:"#f43f5e"},

  // PORTUGAL
  {id:20,name:"Portugal Runners",ciudad:"Portugal",members:201,icon:"🇵🇹",color:"#22c55e"}
];
        let forumTopics = JSON.parse(localStorage.getItem('forumTopics'))||{1:[{id:1,title:"¿Mejores rutas?",author:"Carlos",replies:5,time:"5min",pinned:true}]};
        let forumMessages = JSON.parse(localStorage.getItem('forumMessages'))||{1:[{id:1,author:"Carlos",avatar:"🧔",content:"Casa de Campo",time:"5min",likes:3}]};

        
        // STORAGE_LANG, applyLanguageUI, updateMetaTags, changeLanguage → moved to js/modules/i18n-ui.js

        // ========== COOKIE CONSENT (CMP granular) ==========
        function showCookieBanner() {
            const banner = document.getElementById('cookie-banner');
            if (!banner) return;
            // Reset to main view (hide details)
            const details = document.getElementById('cookie-banner-details');
            if (details) details.classList.add('hidden');
            // Restore toggles to current saved prefs (or default checked)
            const saved = getConsentPrefs();
            const ta = document.getElementById('cookie-toggle-analytics');
            const tm = document.getElementById('cookie-toggle-marketing');
            const tf = document.getElementById('cookie-toggle-functional');
            if (ta) ta.checked = saved ? saved.analytics : true;
            if (tm) tm.checked = saved ? saved.marketing : true;
            if (tf) tf.checked = saved ? saved.functional : true;
            banner.style.display = '';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    banner.classList.remove('translate-y-full');
                    banner.classList.add('translate-y-0');
                });
            });
        }
        function closeCookieBanner() {
            const banner = document.getElementById('cookie-banner');
            if (!banner) return;
            banner.classList.remove('translate-y-0');
            banner.classList.add('translate-y-full');
            document.body.classList.add('cj-cookie-dismissed');
            setTimeout(() => { banner.style.display = 'none'; }, 500);
        }
        function toggleCookieDetails() {
            const details = document.getElementById('cookie-banner-details');
            if (details) details.classList.toggle('hidden');
        }
        function getConsentPrefs() {
            try {
                const raw = localStorage.getItem('cj_consent_prefs');
                return raw ? JSON.parse(raw) : null;
            } catch(e) { return null; }
        }
        function handleCookieConsent(choice) {
            let prefs;
            if (choice === 'accept-all') {
                prefs = { analytics: true, marketing: true, functional: true };
            } else if (choice === 'reject-all') {
                prefs = { analytics: false, marketing: false, functional: false };
            } else {
                // custom — read toggle states
                const ta = document.getElementById('cookie-toggle-analytics');
                const tm = document.getElementById('cookie-toggle-marketing');
                const tf = document.getElementById('cookie-toggle-functional');
                prefs = {
                    analytics: ta ? ta.checked : false,
                    marketing: tm ? tm.checked : false,
                    functional: tf ? tf.checked : false
                };
            }
            prefs.ts = Date.now();
            localStorage.setItem('cj_consent_prefs', JSON.stringify(prefs));
            localStorage.removeItem('cj_cookie_consent'); // clean up old key
            closeCookieBanner();
            // Apply consent
            if (typeof updateConsentMode === 'function') updateConsentMode(prefs);
            if (prefs.analytics) loadGA4();
            if (prefs.marketing) loadMetaPixel();
            if (prefs.functional) loadClarity();
        }
        // Open preferences from footer/modal — shows banner in detail mode
        function openCookiePreferences() {
            showCookieBanner();
            // Auto-expand the details panel
            setTimeout(() => {
                const details = document.getElementById('cookie-banner-details');
                if (details) details.classList.remove('hidden');
            }, 100);
        }
        // Show banner on load if no consent prefs yet
        (function() {
            const prefs = localStorage.getItem('cj_consent_prefs');
            const oldConsent = localStorage.getItem('cj_cookie_consent');
            if (!prefs && !oldConsent) {
                // Small delay so the page loads first
                setTimeout(showCookieBanner, 1500);
            } else {
                // User already consented — reduce footer padding
                document.body.classList.add('cj-cookie-dismissed');
            }
        })();

        // ========== NEWSLETTER SUBSCRIPTION ==========
        async function submitNewsletter(e) {
            e.preventDefault();
            const email = document.getElementById('newsletter-email').value.trim();
            const btn = document.getElementById('newsletter-btn');
            const form = document.getElementById('newsletter-form');
            const successDiv = document.getElementById('newsletter-success');
            const errorDiv = document.getElementById('newsletter-error');
            const t = I18N[currentLang] || I18N.es;

            if (!email) return;
            btn.disabled = true;
            btn.textContent = '...';
            successDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');

            try {
                const res = await fetch('/api/brevo-subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, lang: currentLang, source: 'landing' })
                });

                if (res.ok || res.status === 201) {
                    form.classList.add('hidden');
                    successDiv.classList.remove('hidden');
                    if (typeof gtag === 'function') gtag('event', 'newsletter_signup', { method: 'landing' });
                } else if (res.status === 409) {
                    // Duplicate email
                    document.getElementById('newsletter-success-msg').textContent = t.newsletterAlready;
                    form.classList.add('hidden');
                    successDiv.classList.remove('hidden');
                } else {
                    throw new Error('HTTP ' + res.status);
                }
            } catch (err) {
                errorDiv.classList.remove('hidden');
                console.error('Newsletter error:', err);
            } finally {
                btn.disabled = false;
                btn.textContent = t.newsletterBtn;
            }
        }

        // ========== TOAST → js/modules/toast.js ==========

        // ========== SKELETONS → js/modules/skeletons.js ==========

        // ========== CONFETTI → js/modules/confetti.js ==========

        // ========== DARK MODE → js/modules/darkmode.js ==========

        // ========== BADGES CONFIG → js/modules/badges.js ==========

        // → moved to js/modules/ui.js+quedadas.js+profile.js (427 lines)
        async function loadActiveMission() {
            const missionEl = document.getElementById('active-mission');
            const missionTitle = document.getElementById('mission-title');
            const missionCard = document.getElementById('mission-card');
            if (!missionEl || !missionCard) return;

            if (!currentUser) { missionEl.classList.add('hidden'); return; }

            try {
                const t = I18N[currentLang] || I18N.es;
                const todayStr = new Date().toISOString().split('T')[0];
                const nowMs = Date.now();
                const userLat = currentUser.lat || 40.4168;
                const userLng = currentUser.lng || -3.7038;
                const userNivel = currentUser.nivel || 'Todos los niveles';

                // 1. Check if user has an upcoming quedada they already joined
                const today = new Date();
                today.setHours(0,0,0,0);
                const myUpcoming = (quedadas || []).filter(q => {
                    const asistentes = Array.isArray(q.asistentes) ? q.asistentes : (Array.isArray(q.asistentes_info) ? q.asistentes_info.map(a => a.user_id) : []);
                    const isJoined = asistentes.includes(currentUser.id);
                    const qDate = new Date(q.fecha + 'T00:00:00');
                    return isJoined && qDate >= today;
                }).sort((a, b) => new Date(a.fecha + 'T' + (a.hora || '00:00')) - new Date(b.fecha + 'T' + (b.hora || '00:00')));

                if (myUpcoming.length > 0) {
                    // Show user's next quedada with countdown
                    const next = myUpcoming[0];
                    const nextDate = new Date(next.fecha + 'T' + (next.hora || '00:00'));
                    const diffMs = nextDate - nowMs;
                    const diffDays = Math.floor(diffMs / (1000*60*60*24));
                    const diffHours = Math.floor((diffMs % (1000*60*60*24)) / (1000*60*60));

                    let countdown = '';
                    if (diffDays > 0) countdown = currentLang === 'en' ? `In ${diffDays}d ${diffHours}h` : `Faltan ${diffDays}d ${diffHours}h`;
                    else if (diffHours > 0) countdown = currentLang === 'en' ? `In ${diffHours} hours` : `Faltan ${diffHours} horas`;
                    else countdown = currentLang === 'en' ? 'Starting soon!' : '¡Empieza pronto!';

                    const asistentes = Array.isArray(next.asistentes) ? next.asistentes : (Array.isArray(next.asistentes_info) ? next.asistentes_info.map(a => a.user_id) : []);
                    const confirmedCount = asistentes.length;

                    if (missionTitle) missionTitle.textContent = currentLang === 'en' ? 'Your next run' : 'Tu próxima quedada';
                    missionCard.innerHTML = `
                        <div class="bg-slate-800/60 rounded-xl p-4 cursor-pointer hover:bg-slate-700/60 transition-all" onclick="openQuedadaDetail('${next.id}')">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <div class="text-xs text-orange-400 font-bold mb-1 flex items-center gap-1"><svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${escapeHtml(next.ciudad || '')} · ${escapeHtml(next.ubicacion || '')}</div>
                                    <div class="text-sm font-bold text-white mb-1">${escapeHtml(next.titulo)}</div>
                                </div>
                                <span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold whitespace-nowrap">${countdown}</span>
                            </div>
                            <div class="flex flex-wrap gap-2 text-xs">
                                <span class="bg-slate-700/50 px-2 py-1 rounded-full text-gray-300 inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${formatDateShort(next.fecha)} · ${formatHora(next.hora)}</span>
                                <span class="bg-slate-700/50 px-2 py-1 rounded-full text-gray-300 inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> ${next.nivel || 'Todos'}</span>
                                <span class="bg-slate-700/50 px-2 py-1 rounded-full text-gray-300 inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${confirmedCount} runners</span>
                            </div>
                            <div class="mt-3">
                                <button class="w-full py-2.5 rounded-xl bg-slate-700 text-white text-sm font-bold hover:bg-slate-600 transition" onclick="event.stopPropagation(); openQuedadaDetail('${next.id}')">
                                    ${currentLang === 'en' ? 'View details' : 'Ver detalles'}
                                </button>
                            </div>
                        </div>`;
                    missionEl.classList.remove('hidden');
                    return;
                }

                // 2. No upcoming — find best recommendation
                const future = (quedadas || []).filter(q => q.fecha >= todayStr && !q.es_seed);
                if (!future.length) {
                    // 3. No quedadas at all — CTA to create
                    if (missionTitle) missionTitle.textContent = currentLang === 'en' ? 'Be the first!' : '¡Sé el primero!';
                    missionCard.innerHTML = `
                        <div class="bg-slate-800/60 rounded-xl p-4 text-center">
                            <p class="text-gray-400 text-sm mb-3">${currentLang === 'en' ? 'No upcoming runs in your area yet. Create one and others will join!' : 'Aún no hay quedadas en tu zona. ¡Crea una y otros se unirán!'}</p>
                            <button onclick="openModalCrear()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-orange-500/25 transition">
                                <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg> ${currentLang === 'en' ? 'Create a run' : 'Crear quedada'}
                            </button>
                        </div>`;
                    missionEl.classList.remove('hidden');
                    return;
                }

                // Score algorithm (same as smart recs)
                function haversineDist(lat1, lng1, lat2, lng2) {
                    const R = 6371;
                    const dLat = (lat2 - lat1) * Math.PI / 180;
                    const dLng = (lng2 - lng1) * Math.PI / 180;
                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
                              Math.sin(dLng/2) * Math.sin(dLng/2);
                    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                }
                const levelOrder = ['Principiante', 'Intermedio', 'Avanzado', 'Elite'];
                function isAdjacentLevel(a, b) {
                    const ia = levelOrder.indexOf(a);
                    const ib = levelOrder.indexOf(b);
                    if (ia < 0 || ib < 0) return false;
                    return Math.abs(ia - ib) <= 1;
                }

                const scored = future.map(q => {
                    let score = 0;
                    if (q.lat && q.lng) {
                        const dist = haversineDist(userLat, userLng, q.lat, q.lng);
                        score += Math.max(0, 40 - dist * 2);
                    }
                    if (q.nivel === userNivel || q.nivel === 'Todos los niveles') score += 30;
                    else if (isAdjacentLevel(userNivel, q.nivel)) score += 15;
                    const asistentes = Array.isArray(q.asistentes) ? q.asistentes : [];
                    const friendsGoing = asistentes.filter(id => userFollowingIds && userFollowingIds.has(id)).length;
                    score += Math.min(friendsGoing * 10, 20);
                    const daysAway = (new Date(q.fecha) - new Date()) / (1000 * 60 * 60 * 24);
                    score += Math.max(0, 10 - daysAway);
                    return { q, score, friendsGoing };
                }).sort((a, b) => b.score - a.score);

                const best = scored[0];
                if (!best) { missionEl.classList.add('hidden'); return; }

                const bq = best.q;
                const asistentes = Array.isArray(bq.asistentes) ? bq.asistentes : (Array.isArray(bq.asistentes_info) ? bq.asistentes_info.map(a => a.user_id) : []);
                const confirmedCount = asistentes.length;

                if (missionTitle) missionTitle.textContent = currentLang === 'en' ? 'We found a run for you' : 'Hemos encontrado una quedada para ti';

                // Social proof badges for new users (< 5 quedadas)
                const showBadges = userStats.quedadas < 5;
                const badgesHtml = showBadges ? `
                    <div class="flex flex-wrap gap-2 mt-3 text-xs text-gray-400" id="mission-social-badges">
                        <span class="bg-slate-700/50 px-2 py-1 rounded-full"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> ${currentLang === 'en' ? 'Relaxed group' : 'Grupo relajado'}</span>
                        <span class="bg-slate-700/50 px-2 py-1 rounded-full"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> ${currentLang === 'en' ? 'Adapted pace' : 'Ritmo adaptado'}</span>
                        <span class="bg-slate-700/50 px-2 py-1 rounded-full"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> ${currentLang === 'en' ? 'First-timers welcome' : 'Primera vez bienvenida'}</span>
                    </div>` : '';

                missionCard.innerHTML = `
                    <div class="bg-slate-800/60 rounded-xl p-4">
                        <div class="text-xs text-orange-400 font-bold mb-1 flex items-center gap-1"><svg class="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${escapeHtml(bq.ciudad || '')} · ${escapeHtml(bq.ubicacion || '')}</div>
                        <div class="text-sm font-bold text-white mb-1">${escapeHtml(bq.titulo)}</div>
                        <div class="flex flex-wrap gap-2 text-xs mb-3">
                            <span class="bg-slate-700/50 px-2 py-1 rounded-full text-gray-300 inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ${formatDateShort(bq.fecha)} · ${formatHora(bq.hora)}</span>
                            <span class="bg-slate-700/50 px-2 py-1 rounded-full text-gray-300 inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> ${bq.nivel || 'Todos'}</span>
                            <span class="bg-slate-700/50 px-2 py-1 rounded-full text-gray-300 inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${confirmedCount} runners</span>
                            ${bq.distancia ? `<span class="bg-slate-700/50 px-2 py-1 rounded-full text-gray-300 inline-flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> ${formatDistancia(bq.distancia)}</span>` : ''}
                        </div>
                        ${best.friendsGoing > 0 ? `<div class="text-xs text-green-400 mb-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg> ${best.friendsGoing} ${currentLang === 'en' ? 'friends going' : 'amigos van'}</div>` : ''}
                        <button onclick="openAttendanceModal('${bq.id}')" class="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all transform hover:scale-[1.02]">
                            ${currentLang === 'en' ? 'JOIN NOW' : 'UNIRME AHORA'}
                        </button>
                        ${badgesHtml}
                    </div>`;
                missionEl.classList.remove('hidden');
            } catch (e) {
                console.warn('Active mission error:', e);
                if (missionEl) missionEl.classList.add('hidden');
            }
        }

        // ========== DASHBOARD MODE (Guided vs Full) ==========
        function applyDashboardMode() {
            if (!currentUser) return;
            const isNewUser = userStats.quedadas < 2;

            const statsGrid = document.querySelector('.stats-grid');
            const premiumStats = document.getElementById('premium-stats-section');
            const premiumHeatmap = document.getElementById('premium-heatmap-section');
            const premiumStatsLocked = document.getElementById('premium-stats-locked');
            const premiumHeatmapLocked = document.getElementById('premium-heatmap-locked');
            const socialContainer = document.getElementById('social-stats-container');
            const summaryText = document.getElementById('stat-summary-text');
            const summarySubEl = document.getElementById('stat-summary-sub');

            if (isNewUser) {
                // GUIDED MODE: hide complexity
                if (statsGrid) statsGrid.style.display = 'none';
                if (premiumStats) premiumStats.classList.add('hidden');
                if (premiumHeatmap) premiumHeatmap.classList.add('hidden');
                if (premiumStatsLocked) premiumStatsLocked.classList.add('hidden');
                if (premiumHeatmapLocked) premiumHeatmapLocked.classList.add('hidden');
                // Hide social stats (0/0 doesn't motivate)
                if (socialContainer) socialContainer.style.display = 'none';
                // Welcoming message
                if (summaryText) summaryText.textContent = currentLang === 'en'
                    ? `Welcome, ${currentUser.nombre || 'Runner'}!`
                    : `¡Bienvenido, ${currentUser.nombre || 'Runner'}!`;
                if (summarySubEl) summarySubEl.textContent = currentLang === 'en'
                    ? 'Your first group is waiting for you 👇'
                    : 'Tu primer grupo te espera 👇';
            } else {
                // FULL MODE: show everything
                if (statsGrid) statsGrid.style.display = '';
                if (socialContainer) socialContainer.style.display = '';
            }
        }

        // ========== SMART RECOMMENDATIONS ==========
        async function loadSmartRecommendations() {
            const section = document.getElementById('smart-recs-section');
            const locked = document.getElementById('smart-recs-locked');

            if (!currentUser) {
                if (section) section.classList.add('hidden');
                if (locked) locked.classList.add('hidden');
                return;
            }

            // Recs visible for all logged-in users (no Premium gate)
            if (locked) locked.classList.add('hidden');

            try {
                const userLat = currentUser.lat || 40.4168;
                const userLng = currentUser.lng || -3.7038;
                const userNivel = currentUser.nivel || 'Todos los niveles';

                const todayStr = new Date().toISOString().split('T')[0];
                const future = (quedadas || []).filter(q => q.fecha >= todayStr && !q.es_seed);

                if (!future.length) {
                    if (section) section.classList.add('hidden');
                    return;
                }

                // Haversine distance in km
                function haversineDist(lat1, lng1, lat2, lng2) {
                    const R = 6371;
                    const dLat = (lat2 - lat1) * Math.PI / 180;
                    const dLng = (lng2 - lng1) * Math.PI / 180;
                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
                              Math.sin(dLng/2) * Math.sin(dLng/2);
                    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                }

                // Level adjacency
                const levelOrder = ['Principiante', 'Intermedio', 'Avanzado', 'Elite'];
                function isAdjacentLevel(a, b) {
                    const ia = levelOrder.indexOf(a);
                    const ib = levelOrder.indexOf(b);
                    if (ia < 0 || ib < 0) return false;
                    return Math.abs(ia - ib) <= 1;
                }

                const scored = future.map(q => {
                    let score = 0;

                    // Distance score (closer = better, max 40 pts)
                    if (q.lat && q.lng) {
                        const dist = haversineDist(userLat, userLng, q.lat, q.lng);
                        score += Math.max(0, 40 - dist * 2);
                    }

                    // Level match (max 30 pts)
                    if (q.nivel === userNivel || q.nivel === 'Todos los niveles') score += 30;
                    else if (isAdjacentLevel(userNivel, q.nivel)) score += 15;

                    // Social: friends going (max 20 pts)
                    const asistentes = Array.isArray(q.asistentes) ? q.asistentes : [];
                    const friendsGoing = asistentes.filter(id => userFollowingIds && userFollowingIds.has(id)).length;
                    score += Math.min(friendsGoing * 10, 20);

                    // Freshness (max 10 pts)
                    const daysAway = (new Date(q.fecha) - new Date()) / (1000 * 60 * 60 * 24);
                    score += Math.max(0, 10 - daysAway);

                    return { q: q, score: score, friendsGoing: friendsGoing };
                }).sort((a, b) => b.score - a.score).slice(0, 4);

                if (!scored.length) {
                    if (section) section.classList.add('hidden');
                    return;
                }

                const t = I18N[currentLang] || I18N.es;
                const userNivelLocal = currentUser?.nivel || '';
                const userCiudadLocal = (currentUser?.ciudad || '').toLowerCase();
                const cards = document.getElementById('smart-recs-cards');
                if (cards) {
                    cards.innerHTML = scored.map((item, idx) => {
                        const q = item.q;
                        // "Perfecta para tu nivel" — exact city + level match on first card
                        const isPerfect = idx === 0 && q.ciudad && q.ciudad.toLowerCase() === userCiudadLocal && (q.nivel === userNivelLocal || q.nivel === 'Todos los niveles');
                        const perfectBadge = isPerfect ? '<div class="text-xs text-yellow-400 font-bold mb-1"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Perfecta para tu nivel</div>' : '';
                        // Urgency badge
                        const confirmed = (q.asistentes_info || []).filter(a => a.status === 'confirmed' || !a.status).length;
                        const spotsLeft = q.max_participantes ? q.max_participantes - confirmed : null;
                        const hoursUntil = (new Date(q.fecha + 'T' + (q.hora || '00:00')) - new Date()) / 3600000;
                        let urgency = '';
                        if (spotsLeft !== null && spotsLeft <= 3 && spotsLeft > 0) urgency = `<div class="text-xs text-red-400 mt-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Quedan ${spotsLeft} plaza${spotsLeft === 1 ? '' : 's'}</div>`;
                        else if (hoursUntil > 0 && hoursUntil <= 6) urgency = `<div class="text-xs text-yellow-400 mt-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Empieza en ${Math.ceil(hoursUntil)} hora${Math.ceil(hoursUntil) === 1 ? '' : 's'}</div>`;
                        else if (confirmed >= 3) urgency = `<div class="text-xs text-orange-400 mt-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg> ${confirmed} runners ya se han unido</div>`;
                        return `
                        <div class="flex-shrink-0 w-64 snap-start card-quedada p-4 rounded-xl cursor-pointer hover:border-orange-500/30 transition-all ${isPerfect ? 'border-yellow-500/30' : ''}" onclick="openQuedadaDetail('${q.id}')">
                            ${perfectBadge}
                            <div class="text-xs text-orange-400 font-bold mb-1">${formatDateShort(q.fecha)} · ${formatHora(q.hora)}</div>
                            <div class="text-sm font-bold text-white mb-1 line-clamp-1">${escapeHtml(q.titulo)}</div>
                            <div class="text-xs text-gray-400 mb-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${escapeHtml(q.ciudad || '')}</div>
                            <div class="flex gap-2 text-xs">
                                <span class="px-2 py-0.5 rounded-full bg-slate-700 text-gray-300">${formatDistancia(q.distancia)}</span>
                                <span class="px-2 py-0.5 rounded-full bg-slate-700 text-gray-300">${q.nivel}</span>
                            </div>
                            ${item.friendsGoing > 0 ? `<div class="text-xs text-green-400 mt-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg> ${item.friendsGoing} ${t.premiumFriendsGoing || 'amigos van'}</div>` : ''}
                            ${urgency}
                        </div>`;
                    }).join('');
                }

                if (section) section.classList.remove('hidden');
            } catch (e) {
                console.warn('Smart recommendations error:', e);
                if (section) section.classList.add('hidden');
            }
        }

        function renderBadges() {
            const list = document.getElementById('badges-list');
            if (!list) return;

            // Separar badges normales y premium
            const normalBadges = BADGES_CONFIG.filter(b => !b.premium);
            const premiumBadges = BADGES_CONFIG.filter(b => b.premium);

            let html = '';

            // Badges normales
            html += '<div class="mb-4"><h4 class="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> Logros</h4>';
            html += normalBadges.map(b => {
                const unlocked = b.condition(userStats);
                return `
                <div class="badge-item ${unlocked ? 'unlocked' : 'locked'} mb-2">
                    <div class="badge-icon">${b.icon}</div>
                    <div class="flex-1">
                        <div class="font-bold text-white">${b.name}</div>
                        <div class="text-sm text-gray-400">${b.desc}</div>
                    </div>
                    ${unlocked ? '<span class="text-green-400 text-xl">✓</span>' : '<span class="text-gray-600"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>'}
                </div>`;
            }).join('');
            html += '</div>';

            // Badges Premium (sección especial dorada)
            html += '<div class="mt-6 pt-4 border-t border-yellow-500/30">';
            html += '<h4 class="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Badges Exclusivos Premium</h4>';

            if (!isUserPremium) {
                html += `<div class="text-center py-4 px-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20">
                    <p class="text-yellow-400 text-sm font-semibold mb-2"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Desbloquea badges exclusivos</p>
                    <p class="text-gray-400 text-xs mb-3">Hazte Premium para acceder a badges dorados únicos</p>
                    <button onclick="closeModal('modal-badges'); openModal('modal-profile')" class="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold hover:shadow-lg transition">
                        <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Ver Premium
                    </button>
                </div>`;
            } else {
                html += premiumBadges.map(b => {
                    const unlocked = b.condition(userStats);
                    return `
                    <div class="badge-item-premium ${unlocked ? 'unlocked' : 'locked'} mb-2">
                        <div class="badge-icon-premium">${b.icon}</div>
                        <div class="flex-1">
                            <div class="font-bold text-yellow-300">${b.name}</div>
                            <div class="text-sm text-yellow-400/70">${b.desc}</div>
                        </div>
                        ${unlocked ? '<span class="text-yellow-400 text-xl"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg></span>' : '<span class="text-gray-600"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>'}
                    </div>`;
                }).join('');
            }
            html += '</div>';

            list.innerHTML = html;
        }

        // ========== PREMIUM: FILTROS AVANZADOS ==========
        // activeFilters & filtersVisible → backed by AppState.filters
        // → moved to js/modules/filters.js (2 lines)

        // → moved to js/modules/filters.js (316 lines)
        function initStarRating() {
            const container = document.getElementById('star-rating');
            if (!container) return;

            container.querySelectorAll('.star').forEach(star => {
                star.addEventListener('click', () => {
                    currentRating = parseInt(star.dataset.value);
                    updateStarDisplay();
                });
                star.addEventListener('mouseenter', () => {
                    highlightStars(parseInt(star.dataset.value));
                });
            });
            container.addEventListener('mouseleave', () => updateStarDisplay());
        }

        function highlightStars(count) {
            document.querySelectorAll('#star-rating .star').forEach((s, i) => {
                s.textContent = i < count ? '★' : '☆';
                s.classList.toggle('active', i < count);
            });
        }

        function updateStarDisplay() {
            highlightStars(currentRating);
            const labels = ['', 'Muy mala', 'Mala', 'Normal', 'Buena', '¡Genial!'];
            const labelEl = document.getElementById('rate-label');
            if (labelEl) labelEl.textContent = currentRating ? labels[currentRating] : 'Toca las estrellas para valorar';
        }

        function openRatingModal(quedadaId) {
            if (!currentUser) {
                showToast('Debes iniciar sesión para valorar', 'error');
                return;
            }
            const q = quedadas.find(x => x.id === quedadaId);
            if (!q) {
                showToast('Quedada no encontrada', 'error');
                return;
            }
            // No permitir valorar tu propia quedada
            if (q.creador_id === currentUser.id) {
                showToast('No puedes valorar tu propia quedada', 'error');
                return;
            }
            currentRating = 0;
            updateStarDisplay();
            document.getElementById('rate-quedada-id').value = quedadaId;
            document.getElementById('rate-organizer-id').value = q.creador_id;
            document.getElementById('rate-comment').value = '';

            // Mostrar nombre del organizador en el modal
            const creador = q.creador || {};
            const orgName = creador.nombre || 'el organizador';
            const rateOrgNameEl = document.getElementById('rate-organizer-name');
            if (rateOrgNameEl) rateOrgNameEl.textContent = orgName;

            openModal('modal-rate');
        }

        async function submitRating() {
            if (currentRating === 0) {
                showToast('Selecciona una puntuación', 'error');
                return;
            }
            if (!currentUser) {
                showToast('Debes iniciar sesión', 'error');
                return;
            }

            const quedadaId = document.getElementById('rate-quedada-id').value;
            const organizerId = document.getElementById('rate-organizer-id').value;
            const comment = document.getElementById('rate-comment').value.trim();

            const sb = await getSupabaseClientOrToast(12000, true);
            if (!sb) return;

            try {
                // Verificar que no haya reseña previa
                const { data: existing } = await window.supabaseClient
                    .from('organizer_reviews')
                    .select('id')
                    .eq('quedada_id', quedadaId)
                    .eq('reviewer_id', currentUser.id)
                    .maybeSingle();

                if (existing) {
                    showToast('Ya has valorado esta quedada', 'error');
                    closeModal('modal-rate');
                    return;
                }

                // Insertar reseña
                const { error } = await window.supabaseClient
                    .from('organizer_reviews')
                    .insert({
                        quedada_id: quedadaId,
                        reviewer_id: currentUser.id,
                        organizer_id: organizerId,
                        rating: currentRating,
                        comment: comment || null
                    });

                if (error) throw error;

                showToast('¡Gracias por tu valoración!', 'success');
                triggerConfetti();
                closeModal('modal-rate');

                // Recargar quedadas para actualizar ratings
                await loadQuedadas();
            } catch (err) {
                console.error('Error al guardar valoración:', err);
                showToast('Error al guardar valoración', 'error');
            }
        }

        // Verificar quedadas pendientes de review (llamar al cargar la app)
        async function checkPendingReviews() {
            if (!currentUser) return;

            const sb = await getSupabaseClientOrToast(5000, false);
            if (!sb) return;

            try {
                // Obtener quedadas pasadas donde el usuario participó
                const now = new Date().toISOString().split('T')[0];
                const { data: participaciones } = await window.supabaseClient
                    .from('participantes')
                    .select('quedada_id, quedadas(id, titulo, creador_id, fecha)')
                    .eq('user_id', currentUser.id)
                    .limit(100);

                if (!participaciones || participaciones.length === 0) return;

                // Filtrar quedadas pasadas
                const quedadasPasadas = participaciones
                    .filter(p => p.quedadas && p.quedadas.fecha < now && p.quedadas.creador_id !== currentUser.id)
                    .map(p => p.quedadas);

                if (quedadasPasadas.length === 0) return;

                // Obtener reseñas ya hechas
                const { data: reviewsHechas } = await window.supabaseClient
                    .from('organizer_reviews')
                    .select('quedada_id')
                    .eq('reviewer_id', currentUser.id)
                    .limit(100);

                const reviewedIds = new Set((reviewsHechas || []).map(r => r.quedada_id));

                // Encontrar quedadas sin review
                const pendientes = quedadasPasadas.filter(q => !reviewedIds.has(q.id));

                if (pendientes.length > 0) {
                    // Mostrar prompt para la primera quedada pendiente
                    setTimeout(() => {
                        const primera = pendientes[0];
                        if (confirm(`¿Qué tal fue "${primera.titulo}"? Tu valoración ayuda a otros runners.`)) {
                            openRatingModal(primera.id);
                        }
                    }, 3000);
                }
            } catch (err) {
                console.warn('Error al verificar reviews pendientes:', err);
            }
        }

        // ========== VERIFICACION DE NIVEL ==========
        // → moved to js/modules/profile.js (1 lines)

        // → moved to js/modules/quedadas.js+profile.js (261 lines)

        // → moved to js/modules/profile.js+quedadas.js (514 lines)

        // → moved to js/modules/quedadas.js+map-core.js (98 lines)

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
        // → moved to js/modules/ui.js (15 lines)
        // ========== PREMIUM: BADGE EN VIVO ==========
        // → moved to js/modules/ui.js+quedadas.js (131 lines)
        // 🧹 Verificar si una quedada ya pasó (fecha+hora + 5 min de gracia)
        // → moved to js/modules/auth.js+quedadas.js+ui.js (344 lines)
        async function detectChatMode(){
          const sb = await getSupabaseClientOrToast(8000, false);
          if(!sb){ __cjChatMode='local'; return __cjChatMode; }
          try{
            const { error } = await sb.from('cj_topics').select('id', { head:true, count:'exact' }).limit(1);
            if(error){ __cjChatMode='local'; return __cjChatMode; }
            __cjChatMode='supabase';
          }catch(_){ __cjChatMode='local'; }
          return __cjChatMode;
        }

        async function loadTopicsForCommunity(communityId){
          if(__cjChatMode!=='supabase') return (forumTopics[communityId]||[]);
          const sb = await getSupabaseClientOrToast(12000, true);
          if(!sb) return (forumTopics[communityId]||[]);
          const { data, error } = await sb
            .from('cj_topics')
            .select('id, community_id, title, author_name, created_at')
            .eq('community_id', communityId)
            .order('created_at', { ascending:false });
          if(error){
            __cjChatMode='local';
            return (forumTopics[communityId]||[]);
          }
          return (data||[]).map(t=>({
            id: t.id,
            title: t.title,
            author: t.author_name || 'Runner',
            replies: 0,
            time: 'online',
            pinned: false
          }));
        }

        async function loadMessagesForTopic(topicId){
          if(__cjChatMode!=='supabase') return (forumMessages[topicId]||[]);
          const sb = await getSupabaseClientOrToast(12000, true);
          if(!sb) return (forumMessages[topicId]||[]);
          const { data, error } = await sb
            .from('cj_messages')
            .select('id, topic_id, author_name, content, created_at')
            .eq('topic_id', topicId)
            .order('created_at', { ascending:true });
          if(error){
            __cjChatMode='local';
            return (forumMessages[topicId]||[]);
          }
          return (data||[]).map(m=>({
            id: m.id,
            author: m.author_name || 'Runner',
            avatar: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
            content: m.content,
            time: 'online',
            likes: 0
          }));
        }

        async function subscribeToTopic(topicId){
          if(__cjChatMode!=='supabase') return;
          const sb = await getSupabaseClientOrToast(12000, false);
          if(!sb) return;
          try{
            if(__cjMsgSub){ sb.removeChannel(__cjMsgSub); __cjMsgSub=null; }
            __cjMsgSub = sb.channel('cj-topic-'+topicId)
              .on('postgres_changes', { event:'INSERT', schema:'public', table:'cj_messages', filter:`topic_id=eq.${topicId}` }, async (payload)=>{
                // refresh view
                try{
                  const msgs = await loadMessagesForTopic(topicId);
                  forumMessages[topicId] = msgs;
                  renderSidebar();
                }catch(_){ CJ.handleApiError(_, 'chatMessages', {silent:true}); }
              })
              .subscribe();
          }catch(_){ CJ.handleApiError(_, 'chatSubscribe', {silent:true}); }
        }

        // Override sidebar functions (online-aware)
        async function selectCommunity(id){
          selectedCommunity=id;
          sidebarView='topics';
          try{
            await detectChatMode();
            const topics = await loadTopicsForCommunity(id);
            forumTopics[id] = topics;
          }catch(_){ CJ.handleApiError(_, 'loadTopics', {silent:true}); }
          renderSidebar();
        }

        // Expose chat handlers for legacy inline calls
        // window.__CJ_createTopic = createTopic;
        // window.__CJ_sendMessage = sendMessage;


        async function selectTopic(id){
          selectedTopic=id;
          sidebarView='messages';
          try{
            await detectChatMode();
            const msgs = await loadMessagesForTopic(id);
            forumMessages[id] = msgs;
            await subscribeToTopic(id);
          }catch(_){ CJ.handleApiError(_, 'loadMessages', {silent:true}); }
          renderSidebar();
        }

        async function createTopic(){
          const title=document.getElementById('topic-title')?.value.trim();
          const content=document.getElementById('topic-content')?.value.trim();
          if(!title||!content){showToast('Completa los campos','error');return;}

          await detectChatMode();
          if(__cjChatMode==='supabase'){
            const sb = await getSupabaseClientOrToast(12000, true);
            if(!sb) return;
            const author = currentUser?.nombre || 'Runner';
            const { data: tdata, error: terr } = await sb
              .from('cj_topics')
              .insert([{ community_id: selectedCommunity, title, author_id: currentUser?.id || null, author_name: author }])
              .select()
              .single();
            if(terr){ showToast('Chat online no disponible. Se usará modo local.','error'); __cjChatMode='local'; }
            else {
              const { error: merr } = await sb
                .from('cj_messages')
                .insert([{ topic_id: tdata.id, author_id: currentUser?.id || null, author_name: author, content }]);
              if(merr){ showToast(merr.message,'error'); return; }
              showToast('¡Tema creado!');
              // refresh
              forumTopics[selectedCommunity] = await loadTopicsForCommunity(selectedCommunity);
              selectedTopic = tdata.id;
              sidebarView='messages';
              forumMessages[selectedTopic] = await loadMessagesForTopic(selectedTopic);
              await subscribeToTopic(selectedTopic);
              renderSidebar();
              return;
            }
          }

          // Local fallback
          const newTopic={id:Date.now(),title,author:currentUser?.nombre||'Anónimo',replies:1,time:'ahora',pinned:false};
          if(!forumTopics[selectedCommunity])forumTopics[selectedCommunity]=[];
          forumTopics[selectedCommunity].unshift(newTopic);
          localStorage.setItem('forumTopics',JSON.stringify(forumTopics));
          forumMessages[newTopic.id]=[{id:1,author:currentUser?.nombre||'Anónimo',avatar:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',content,time:'ahora',likes:0}];
          localStorage.setItem('forumMessages',JSON.stringify(forumMessages));
          showToast('¡Tema creado!');
          selectedTopic=newTopic.id;sidebarView='messages';renderSidebar();
        }

        async function sendMessage(){
          const input=document.getElementById('new-message');
          const content=input?.value.trim();
          if(!content) return;
          await detectChatMode();

          if(__cjChatMode==='supabase'){
            const sb = await getSupabaseClientOrToast(12000, true);
            if(!sb) return;
            const author = currentUser?.nombre || 'Runner';
            const { error } = await sb
              .from('cj_messages')
              .insert([{ topic_id: selectedTopic, author_id: currentUser?.id || null, author_name: author, content }]);
            if(error){ showToast('No se pudo enviar. Modo local activo.','error'); __cjChatMode='local'; }
            else {
              input.value='';
              showToast('¡Mensaje enviado!');
              // realtime will refresh
              return;
            }
          }

          if(!forumMessages[selectedTopic])forumMessages[selectedTopic]=[];
          forumMessages[selectedTopic].push({id:Date.now(),author:currentUser?.nombre||'Anónimo',avatar:'<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',content,time:'ahora',likes:0});
          localStorage.setItem('forumMessages',JSON.stringify(forumMessages));
          input.value='';
          showToast('¡Mensaje enviado!');
          renderSidebar();
        }

        // Bind chat functions globally (avoid duplicate definitions / scope issues)
        window.__CJ_CHAT_BOUND__ = true;
        window.selectCommunity = selectCommunity;
        window.selectTopic = selectTopic;
        window.createTopic = createTopic;
        window.sendMessage = sendMessage;


        // ===================== ELIMINAR CUENTA (solicitud + limpieza datos publicos) =====================
        // → moved to js/modules/ui.js+map-core.js+auth.js+profile.js (1700 lines)
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
        // → moved to js/modules/map-core.js (691 lines)
        async function loadLandingStats(){ return; }

        // ===================== LANDING ENHANCEMENTS =====================

        // --- Scroll Reveal Observer ---
        function initScrollReveal() {
            const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
            if (!revealElements.length) return;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // Also reveal stagger children
                        if (entry.target.classList.contains('stagger-children')) {
                            entry.target.querySelectorAll(':scope > *').forEach(child => {
                                child.classList.add('visible');
                            });
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            revealElements.forEach(el => observer.observe(el));
            window.__revealObserver = observer;
        }

        // --- Landing Stats: STATIC (no animation, no Supabase) ---
        // Los valores se muestran tal cual del HTML: 1.2K+, 850+, 55+, 12
        // Proteger contra cualquier modificación externa
        function initStatsObserver() {
            const ids = ['stat-total-runners','stat-total-quedadas','stat-total-ciudades','stat-proximas-quedadas'];
            const expected = {'stat-total-runners':'1.2K+','stat-total-quedadas':'850+','stat-total-ciudades':'55+','stat-proximas-quedadas':'12'};
            // Force correct values immediately
            ids.forEach(id => { const el = document.getElementById(id); if(el && expected[id]) el.textContent = expected[id]; });
            // MutationObserver: revert any external modification
            ids.forEach(id => {
                const el = document.getElementById(id);
                if(!el) return;
                const obs = new MutationObserver(() => { if(el.textContent.trim() !== expected[id]) el.textContent = expected[id]; });
                obs.observe(el, { childList: true, characterData: true, subtree: true });
            });
        }
        function triggerCounterAnimations() { /* disabled — stats are static */ }

        // --- Typewriter Effect ---
        function initTypewriter() {
            const el = document.getElementById('landing-headline-2');
            const cursor = document.getElementById('hero-cursor');
            if (!el || !cursor) return;
            const text = el.textContent.trim();
            // Wrap each char in a span with visibility:hidden (preserves layout = 0 CLS)
            el.innerHTML = text.split('').map(c =>
                '<span style="visibility:hidden">' + c + '</span>'
            ).join('');
            cursor.style.display = 'inline-block';
            const chars = el.querySelectorAll('span');
            let i = 0;
            function type() {
                if (i < chars.length) {
                    chars[i].style.visibility = 'visible';
                    i++;
                    setTimeout(type, 120);
                } else {
                    setTimeout(() => { cursor.style.display = 'none'; }, 2000);
                }
            }
            setTimeout(type, 800);
        }

        // --- Live Activity Feed ---
        async function loadLandingFeed() {
            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) { renderFallbackFeed(); return; }

                // Solo mostrar actividad de los últimos 7 días (evitar "hace 28d")
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const { data: quedadas } = await window.supabaseClient
                    .from('quedadas')
                    .select('titulo, ciudad, created_at, organizador_nombre, fecha')
                    .gte('created_at', sevenDaysAgo.toISOString())
                    .order('created_at', { ascending: false })
                    .limit(8);

                const feedEl = document.getElementById('landing-feed');
                if (!feedEl) return;

                // Si no hay actividad reciente, mostrar feed de demo con horarios frescos
                if (!quedadas || quedadas.length === 0) { renderFallbackFeed(); return; }

                const t = I18N[currentLang] || I18N.es;
                let cards = quedadas.map(q => {
                    const ago = timeAgo(q.created_at);
                    const name = q.organizador_nombre || (currentLang === 'en' ? 'A runner' : 'Un runner');
                    const verb = currentLang === 'en' ? 'created' : 'creó';
                    return `<div class="feed-card">
                        <div class="feed-pulse"></div>
                        <div>
                            <p class="text-white text-sm font-medium">${escapeHtml(name)} ${verb} <span class="text-orange-400">${escapeHtml(q.titulo)}</span></p>
                            <p class="text-gray-500 text-xs">${escapeHtml(q.ciudad || '')} · ${ago}</p>
                        </div>
                    </div>`;
                }).join('');
                // Duplicate for infinite scroll
                feedEl.innerHTML = cards + cards;
            } catch (e) {
                console.warn('loadLandingFeed:', e);
                renderFallbackFeed();
            }
        }

        function renderFallbackFeed() {
            const feedEl = document.getElementById('landing-feed');
            if (!feedEl) return;
            const items = currentLang === 'en' ? [
                { name: 'Maria', action: 'created', title: 'Retiro 5K Run', city: 'Madrid', ago: '2h ago' },
                { name: 'Juan', action: 'joined', title: 'Trail Montjuïc', city: 'Barcelona', ago: '3h ago' },
                { name: 'Carlos', action: 'created', title: 'Hyde Park Morning', city: 'London', ago: '5h ago' },
                { name: 'Ana', action: 'joined', title: 'Chapultepec Run', city: 'CDMX', ago: '6h ago' },
                { name: 'Laura', action: 'created', title: 'Palermo 10K', city: 'Buenos Aires', ago: '8h ago' },
                { name: 'Diego', action: 'joined', title: 'Central Park Run', city: 'New York', ago: '10h ago' },
            ] : [
                { name: 'María', action: 'creó', title: 'Ruta Retiro 5K', city: 'Madrid', ago: 'hace 2h' },
                { name: 'Juan', action: 'se unió a', title: 'Trail Montjuïc', city: 'Barcelona', ago: 'hace 3h' },
                { name: 'Carlos', action: 'creó', title: 'Hyde Park Morning', city: 'London', ago: 'hace 5h' },
                { name: 'Ana', action: 'se unió a', title: 'Chapultepec Run', city: 'CDMX', ago: 'hace 6h' },
                { name: 'Laura', action: 'creó', title: 'Palermo 10K', city: 'Buenos Aires', ago: 'hace 8h' },
                { name: 'Diego', action: 'se unió a', title: 'Central Park Run', city: 'New York', ago: 'hace 10h' },
            ];
            let cards = items.map(i => `<div class="feed-card">
                <div class="feed-pulse"></div>
                <div>
                    <p class="text-white text-sm font-medium">${i.name} ${i.action} <span class="text-orange-400">${i.title}</span></p>
                    <p class="text-gray-500 text-xs">${i.city} · ${i.ago}</p>
                </div>
            </div>`).join('');
            feedEl.innerHTML = cards + cards;
        }

        function timeAgo(dateStr) {
            const now = new Date();
            const date = new Date(dateStr);
            const diff = Math.floor((now - date) / 1000);
            if (diff < 60) return currentLang === 'en' ? 'just now' : 'ahora';
            if (diff < 3600) { const m = Math.floor(diff / 60); return currentLang === 'en' ? `${m}m ago` : `hace ${m}m`; }
            if (diff < 86400) { const h = Math.floor(diff / 3600); return currentLang === 'en' ? `${h}h ago` : `hace ${h}h`; }
            const d = Math.floor(diff / 86400);
            return currentLang === 'en' ? `${d}d ago` : `hace ${d}d`;
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // --- Landing Map Preview ---
        let landingMap = null;
        async function initLandingMap() {
            const container = document.getElementById('landing-map-preview');
            if (!container || landingMap) return;
            try {
                landingMap = L.map(container, {
                    center: [40.4168, -3.7038],
                    zoom: 3,
                    zoomControl: false,
                    attributionControl: false,
                    dragging: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    touchZoom: false
                });
                const isLight = document.body.classList.contains('light-mode');
                L.tileLayer(isLight ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 18
                }).addTo(landingMap);

                // Load recent quedadas markers
                const sb = await getSupabaseClientOrToast(5000, false);
                if (sb) {
                    const { data } = await window.supabaseClient
                        .from('quedadas')
                        .select('lat, lng, titulo, ciudad')
                        .not('lat', 'is', null)
                        .not('lng', 'is', null)
                        .order('created_at', { ascending: false })
                        .limit(30);
                    if (data && data.length) {
                        const orangeIcon = L.divIcon({
                            html: '<div style="width:10px;height:10px;background:#f97316;border-radius:50%;box-shadow:0 0 8px rgba(249,115,22,0.6);"></div>',
                            className: '',
                            iconSize: [10, 10],
                            iconAnchor: [5, 5]
                        });
                        data.forEach(q => {
                            if (q.lat && q.lng) {
                                L.marker([q.lat, q.lng], { icon: orangeIcon }).addTo(landingMap);
                            }
                        });
                        // Fit bounds
                        const bounds = data.filter(q => q.lat && q.lng).map(q => [q.lat, q.lng]);
                        if (bounds.length > 1) {
                            landingMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 5 });
                        }
                    }
                }
            } catch (e) {
                console.warn('initLandingMap:', e);
            }
        }

        // --- Testimonial Carousel ---
        let carouselIndex = 0;
        let carouselInterval = null;
        function initTestimonialCarousel() {
            const carousel = document.getElementById('testimonial-carousel');
            const dotsContainer = document.getElementById('carousel-dots');
            const wrapper = carousel ? carousel.parentElement : null;
            if (!carousel || !dotsContainer || !wrapper) return;

            const slides = carousel.querySelectorAll('.testimonial-slide');
            const totalSlides = slides.length;
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
            const visibleSlides = isMobile ? 1 : (isTablet ? 2 : 3);
            const gap = 24;
            const wrapperWidth = wrapper.offsetWidth;
            const slideW = (wrapperWidth - gap * (visibleSlides - 1)) / visibleSlides;

            // Set slide widths explicitly
            slides.forEach(s => { s.style.minWidth = slideW + 'px'; s.style.flex = '0 0 ' + slideW + 'px'; });

            const maxIndex = Math.max(0, totalSlides - visibleSlides);

            // Create dots
            dotsContainer.innerHTML = '';
            for (let i = 0; i <= maxIndex; i++) {
                const dot = document.createElement('div');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }

            function goToSlide(index) {
                carouselIndex = Math.min(index, maxIndex);
                const step = slideW + gap;
                carousel.style.transform = `translateX(-${carouselIndex * step}px)`;
                dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
                    d.classList.toggle('active', i === carouselIndex);
                });
            }

            function nextSlide() {
                goToSlide(carouselIndex >= maxIndex ? 0 : carouselIndex + 1);
            }

            // IMPORTANT: Force carousel to start at position 0 (first card flush-left)
            carouselIndex = 0;
            carousel.style.transform = 'translateX(0px)';

            // Auto-advance — delay first advance 8s so users see first cards
            clearInterval(carouselInterval);
            setTimeout(() => {
                carouselInterval = setInterval(nextSlide, 5000);
            }, 8000);

            // Pause on hover
            carousel.addEventListener('mouseenter', () => clearInterval(carouselInterval));
            carousel.addEventListener('mouseleave', () => { carouselInterval = setInterval(nextSlide, 5000); });

            // Touch swipe support
            let touchStartX = 0;
            carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; clearInterval(carouselInterval); }, { passive: true });
            carousel.addEventListener('touchend', (e) => {
                const diff = touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) nextSlide();
                    else goToSlide(Math.max(0, carouselIndex - 1));
                }
                carouselInterval = setInterval(nextSlide, 5000);
            }, { passive: true });

            // Recalculate on resize (prevents clipping after orientation change)
            window.addEventListener('resize', () => {
                clearInterval(carouselInterval);
                setTimeout(initTestimonialCarousel, 200);
            }, { once: true });
        }

        // --- Quedadas Preview (no login required) ---
        let quedadaPreviewMap = null;
        async function loadQuedadasPreview() {
            const grid = document.getElementById('quedadas-preview-grid');
            if (!grid) return;
            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) { renderFallbackQuedadas(); return; }

                const now = new Date().toISOString();
                const { data } = await window.supabaseClient
                    .from('quedadas')
                    .select('id, titulo, ciudad, fecha, hora, nivel, lat, lng, organizador_nombre, ubicacion')
                    .gte('fecha', now.split('T')[0])
                    .order('fecha', { ascending: true })
                    .limit(6);

                if (!data || data.length === 0) { renderFallbackQuedadas(); return; }
                renderQuedadasCards(data, grid);
                try { injectEventSchema(data); } catch(_) {}
            } catch (e) {
                console.warn('loadQuedadasPreview:', e);
                renderFallbackQuedadas();
            }
        }

        // Formatear distancia: asegurar que tenga unidad "km"
        function formatDistancia(d) {
            if (!d || d === '--') return '--';
            var s = String(d).trim();
            // Si es solo un número, añadir " km"
            if (/^\d+(\.\d+)?$/.test(s)) {
                var n = parseFloat(s);
                // Si >100 probablemente son metros, convertir a km
                if (n > 100) return (n / 1000).toFixed(1) + ' km';
                return n + ' km';
            }
            // Si ya contiene km/KM, devolver tal cual
            if (/km/i.test(s)) return s;
            return s;
        }

        // Formatear ritmo: validar formato mm:ss o similar, sino devolver '--'
        function formatRitmo(r) {
            if (!r) return '--';
            var s = String(r).trim();
            if (s === '--' || s === '') return '--';
            // Formato válido: "5:30", "5:30 min/km", "05:30", etc.
            if (/^\d{1,2}:\d{2}/.test(s)) return s;
            // Formato "5'30\""
            if (/^\d{1,2}'\d{2}"?/.test(s)) return s;
            // Solo número — interpretarlo como min/km
            if (/^\d+(\.\d+)?$/.test(s)) return s + ' min/km';
            // Cualquier otro valor inválido
            return '--';
        }

        function renderQuedadasCards(quedadas, grid) {
            const lang = currentLang || 'es';
            const months = lang === 'en'
                ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                : lang === 'pt'
                ? ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
                : ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            const levelLabels = {
                es: { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado', todos: 'Todos' },
                en: { principiante: 'Beginner', intermedio: 'Intermediate', avanzado: 'Advanced', todos: 'All levels' },
                pt: { principiante: 'Iniciante', intermedio: 'Intermediário', avanzado: 'Avançado', todos: 'Todos' }
            };
            const lvlMap = levelLabels[lang] || levelLabels.es;
            window.__previewQuedadas = quedadas;

            grid.innerHTML = quedadas.map((q, i) => {
                const d = new Date(q.fecha + 'T00:00:00');
                const day = d.getDate();
                const month = months[d.getMonth()];
                const lvlKey = (q.nivel || 'todos').toLowerCase();
                const lvlClass = lvlKey === 'principiante' ? 'level-principiante' : lvlKey === 'intermedio' ? 'level-intermedio' : lvlKey === 'avanzado' ? 'level-avanzado' : 'level-todos';
                const lvlText = lvlMap[lvlKey] || lvlMap.todos;
                const hora = q.hora ? q.hora.substring(0, 5) : '';
                return `<div class="quedada-preview-card reveal" style="transition-delay:${i * 0.1}s" data-qidx="${i}" onclick="openQuedadaPreview(window.__previewQuedadas[${i}])">
                    <div class="flex items-start gap-4">
                        <div class="quedada-date-badge">
                            <div class="day">${day}</div>
                            <div class="month">${month}</div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-white font-bold text-sm mb-1 truncate">${escapeHtml(q.titulo)}</h3>
                            <div class="flex items-center gap-1 text-gray-400 text-xs mb-2">
                                <svg class="w-3.5 h-3.5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                                <span class="truncate">${escapeHtml(q.ciudad || '')}</span>
                                ${hora ? `<span class="text-gray-600 mx-1">·</span><span>${hora}</span>` : ''}
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="quedada-level-badge ${lvlClass}">${lvlText}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');

            // Re-observe new reveal elements
            if (window.__revealObserver) {
                grid.querySelectorAll('.reveal').forEach(el => window.__revealObserver.observe(el));
            }
        }

        function renderFallbackQuedadas() {
            const grid = document.getElementById('quedadas-preview-grid');
            if (!grid) return;
            const lang = currentLang || 'es';
            // Generate dates relative to today (next 6 days)
            const _d = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset + 1); return d.toISOString().split('T')[0]; };
            const fallback = lang === 'en' ? [
                { titulo: 'Retiro Park 5K', ciudad: 'Madrid', fecha: _d(0), hora: '09:00', nivel: 'todos', organizador_nombre: 'Carlos M.' },
                { titulo: 'Beach Run Sunrise', ciudad: 'Barcelona', fecha: _d(1), hora: '07:30', nivel: 'intermedio', organizador_nombre: 'Laura P.' },
                { titulo: 'Hyde Park Loop', ciudad: 'London', fecha: _d(2), hora: '08:00', nivel: 'principiante', organizador_nombre: 'James R.' },
                { titulo: 'Central Park 10K', ciudad: 'New York', fecha: _d(3), hora: '07:00', nivel: 'avanzado', organizador_nombre: 'Sarah K.' },
                { titulo: 'Tiergarten Trail', ciudad: 'Berlin', fecha: _d(4), hora: '18:00', nivel: 'intermedio', organizador_nombre: 'Hans M.' },
                { titulo: 'Chapultepec Easy Run', ciudad: 'Mexico City', fecha: _d(5), hora: '08:30', nivel: 'principiante', organizador_nombre: 'Ana G.' }
            ] : lang === 'pt' ? [
                { titulo: 'Corrida no Retiro 5K', ciudad: 'Madrid', fecha: _d(0), hora: '09:00', nivel: 'todos', organizador_nombre: 'Carlos M.' },
                { titulo: 'Corrida ao Nascer do Sol', ciudad: 'Barcelona', fecha: _d(1), hora: '07:30', nivel: 'intermedio', organizador_nombre: 'Laura P.' },
                { titulo: 'Volta ao Monsanto', ciudad: 'Lisboa', fecha: _d(2), hora: '08:00', nivel: 'principiante', organizador_nombre: 'João R.' },
                { titulo: 'Corrida Ribeirinha', ciudad: 'Porto', fecha: _d(3), hora: '07:00', nivel: 'avanzado', organizador_nombre: 'Maria K.' },
                { titulo: 'Tiergarten Trail', ciudad: 'Berlim', fecha: _d(4), hora: '18:00', nivel: 'intermedio', organizador_nombre: 'Hans M.' },
                { titulo: 'Corrida na Praia', ciudad: 'Rio de Janeiro', fecha: _d(5), hora: '06:30', nivel: 'principiante', organizador_nombre: 'Ana G.' }
            ] : [
                { titulo: 'Ruta Retiro 5K', ciudad: 'Madrid', fecha: _d(0), hora: '09:00', nivel: 'todos', organizador_nombre: 'Carlos M.' },
                { titulo: 'Carrera Playa Amanecer', ciudad: 'Barcelona', fecha: _d(1), hora: '07:30', nivel: 'intermedio', organizador_nombre: 'Laura P.' },
                { titulo: 'Hyde Park Loop', ciudad: 'London', fecha: _d(2), hora: '08:00', nivel: 'principiante', organizador_nombre: 'James R.' },
                { titulo: 'Central Park 10K', ciudad: 'New York', fecha: _d(3), hora: '07:00', nivel: 'avanzado', organizador_nombre: 'Sarah K.' },
                { titulo: 'Tiergarten Trail', ciudad: 'Berlin', fecha: _d(4), hora: '18:00', nivel: 'intermedio', organizador_nombre: 'Hans M.' },
                { titulo: 'Carrera Chapultepec', ciudad: 'Ciudad de México', fecha: _d(5), hora: '08:30', nivel: 'principiante', organizador_nombre: 'Ana G.' }
            ];
            renderQuedadasCards(fallback, grid);
        }

        function openQuedadaPreview(q) {
            const modal = document.getElementById('modal-quedada-preview');
            if (!modal) return;
            const lang = currentLang || 'es';

            document.getElementById('qp-modal-title').textContent = q.titulo || '';

            // Date formatting
            if (q.fecha) {
                const d = new Date(q.fecha + 'T00:00:00');
                const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const locale = lang === 'en' ? 'en-US' : lang === 'pt' ? 'pt-PT' : 'es-ES';
                let dateStr = d.toLocaleDateString(locale, opts);
                if (q.hora) dateStr += ` · ${q.hora.substring(0, 5)}`;
                document.getElementById('qp-modal-date').textContent = dateStr;
            }

            document.getElementById('qp-modal-location').textContent = [q.ubicacion, q.ciudad].filter(Boolean).join(', ') || (lang === 'en' ? 'Location to be confirmed' : lang === 'pt' ? 'Local a confirmar' : 'Ubicación por confirmar');

            const orgLabel = lang === 'en' ? 'Organized by' : lang === 'pt' ? 'Organizado por' : 'Organizado por';
            document.getElementById('qp-modal-organizer').textContent = `${orgLabel} ${q.organizador_nombre || (lang === 'en' ? 'A runner' : 'Un runner')}`;

            const partLabel = lang === 'en' ? 'Sign up to see participants' : lang === 'pt' ? 'Regista-te para ver participantes' : 'Regístrate para ver participantes';
            document.getElementById('qp-modal-participants').textContent = partLabel;

            // Map
            const mapContainer = document.getElementById('qp-modal-map');
            if (q.lat && q.lng && mapContainer) {
                mapContainer.style.display = '';
                ensureLeaflet().then(() => setTimeout(() => {
                    if (quedadaPreviewMap) { quedadaPreviewMap.remove(); quedadaPreviewMap = null; }
                    quedadaPreviewMap = L.map(mapContainer, {
                        center: [q.lat, q.lng],
                        zoom: 14,
                        zoomControl: false,
                        attributionControl: false,
                        dragging: false,
                        scrollWheelZoom: false,
                        touchZoom: false
                    });
                    const isLt = document.body.classList.contains('light-mode');
                    L.tileLayer(isLt ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(quedadaPreviewMap);
                    const orangeIcon = L.divIcon({
                        html: '<div style="width:14px;height:14px;background:#f97316;border-radius:50%;box-shadow:0 0 12px rgba(249,115,22,0.7);border:2px solid white;"></div>',
                        className: '', iconSize: [14, 14], iconAnchor: [7, 7]
                    });
                    L.marker([q.lat, q.lng], { icon: orangeIcon }).addTo(quedadaPreviewMap);
                    quedadaPreviewMap.invalidateSize();
                }, 100));
            } else if (mapContainer) {
                mapContainer.style.display = 'none';
            }

            modal.classList.remove('hidden');
            // Deep link: actualizar URL para que sea compartible
            try{ if(q.id) history.pushState({cj:'quedada',id:q.id}, '', '#quedada/' + q.id); }catch(_){}
        }

        // Cerrar preview y limpiar hash
        function closeQuedadaPreview(){
            var modal = document.getElementById('modal-quedada-preview');
            if(modal) modal.classList.add('hidden');
            try{ if(window.location.hash) history.replaceState({}, '', window.location.pathname + window.location.search); }catch(_){}
        }

        // Procesar deep link en landing (sin login): #quedada/xxx
        async function processLandingDeepLink(){
            try{
                var hash = (window.location.hash || '').replace(/^#/, '');
                if(!hash) return;
                var parts = hash.split('/');
                if(parts[0] === 'quedada' && parts[1]){
                    var qId = parts[1];
                    // Buscar en las preview ya cargadas
                    var found = (window.__previewQuedadas || []).find(function(q){ return q.id === qId; });
                    if(found){
                        setTimeout(function(){ openQuedadaPreview(found); }, 300);
                        return;
                    }
                    // Si no está en preview, cargar de Supabase
                    var sb = window.supabaseClient;
                    if(!sb) return;
                    var resp = await sb.from('quedadas').select('id, titulo, ciudad, fecha, hora, nivel, lat, lng, organizador_nombre, ubicacion, organizador_foto').eq('id', qId).single();
                    if(resp.data){
                        setTimeout(function(){ openQuedadaPreview(resp.data); }, 300);
                    }
                }
            }catch(_){}
        }

        // --- Init all landing enhancements ---
        function initLandingEnhancements() {
            initScrollReveal();
            initStatsObserver();
            initTypewriter();
            loadLandingFeed();
            // Leaflet maps: lazy-load when near viewport (saves ~60KB render-blocking)
            const mapPreview = document.getElementById('landing-map-preview');
            if (mapPreview) {
                const mapObs = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        mapObs.disconnect();
                        ensureLeaflet().then(() => { initLandingMap(); loadQuedadasPreview(); });
                    }
                }, { rootMargin: '400px' });
                mapObs.observe(mapPreview);
            } else {
                loadQuedadasPreview();
            }
            setTimeout(initTestimonialCarousel, 500);
            initShareBanner();
            // Procesar deep link en landing si hay hash
            if(window.location.hash && window.location.hash.indexOf('#quedada/') === 0){
                setTimeout(processLandingDeepLink, 1200);
            }
        }

        // Floating share banner - shows once per session after scrolling
        function initShareBanner() {
            if (sessionStorage.getItem('cj_share_banner_dismissed')) return;
            const banner = document.getElementById('share-banner');
            if (!banner) return;
            let shown = false;
            window.addEventListener('scroll', function onScroll() {
                if (shown) return;
                if (window.scrollY > 1500) {
                    shown = true;
                    banner.classList.add('visible');
                    window.removeEventListener('scroll', onScroll);
                }
            });
        }
        function dismissShareBanner() {
            const banner = document.getElementById('share-banner');
            if (banner) banner.classList.remove('visible');
            sessionStorage.setItem('cj_share_banner_dismissed', '1');
        }

        // ===================== SEEDING: Verificar si usuario es nuevo =====================
        // TEMP: Mostrar seed a TODOS los usuarios hasta que haya masa critica de quedadas reales.
        // Cuando haya 15+ quedadas reales, restaurar el filtro de 7 dias.
        // → moved to js/modules/quedadas.js+ui.js (2602 lines)
        async function checkPremiumStatus() {
            if (!currentUser) {
                isUserPremium = false;
                updatePremiumUI();
                return;
            }

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                // Verificar plan premium en profiles
                const { data, error } = await sb
                    .from('profiles')
                    .select('es_premium, plan, plan_until')
                    .eq('id', currentUser.id)
                    .single();

                userPlan = getEffectivePlan(data);
                isUserPremium = (userPlan === 'premium');
                window.isUserPremium = isUserPremium;
                window.userPlan = userPlan;
            } catch (e) {
                console.warn('Error checking premium status:', e);
                userPlan = 'free';
                isUserPremium = false;
                window.isUserPremium = false;
                window.userPlan = 'free';
            }

            updatePremiumUI();
        }

        function updatePremiumUI() {
            const upgradeSection = document.getElementById('premium-upgrade');
            const activeSection = document.getElementById('premium-active');
            const premiumBadge = document.getElementById('premium-badge');
            const premiumUntil = document.getElementById('premium-until');

            // Filtros premium
            const premiumFiltersSection = document.getElementById('premium-filters-section');
            const premiumFiltersLocked = document.getElementById('premium-filters-locked');

            if (!upgradeSection || !activeSection) return;

            if (isUserPremium) {
                upgradeSection.classList.add('hidden');
                activeSection.classList.remove('hidden');
                premiumBadge?.classList.remove('hidden');
                if (premiumUntil && currentUser?.premiumUntil) {
                    premiumUntil.textContent = 'Activo hasta: ' + new Date(currentUser.premiumUntil).toLocaleDateString('es-ES');
                }
                // Mostrar filtros premium
                if (premiumFiltersSection) premiumFiltersSection.classList.remove('hidden');
                if (premiumFiltersLocked) premiumFiltersLocked.classList.add('hidden');
                // Cargar preferencias de alertas
                loadAlertPreferences();
                // Mostrar banner de verificación si no verificado
                showVerificationBanner();
            } else {
                upgradeSection.classList.remove('hidden');
                activeSection.classList.add('hidden');
                premiumBadge?.classList.add('hidden');
                // Ocultar filtros premium, mostrar mensaje
                if (premiumFiltersSection) premiumFiltersSection.classList.add('hidden');
                if (premiumFiltersLocked) premiumFiltersLocked.classList.remove('hidden');
            }

            // Dashboard premium CTA card
            const premCta = document.getElementById('premium-dashboard-cta');
            if (premCta) {
                if (currentUser && !isUserPremium) {
                    premCta.classList.remove('hidden');
                } else {
                    premCta.classList.add('hidden');
                }
            }

            // También actualizar estadísticas premium si existe la función
            if (typeof updateStatsUI === 'function') {
                try { updateStatsUI(); } catch(e) { CJ.handleApiError(e, 'updateStatsUI', {silent:true}); }
            }

            // Refrescar Strava UI ahora que el estado premium es conocido
            if (typeof loadStravaConnection === 'function') {
                try { loadStravaConnection(); } catch(e) { CJ.handleApiError(e, 'loadStrava', {silent:true}); }
            }
        }

        // ============== SISTEMA GAMIFICACIÓN ==============
        const NIVELES_GAMIFICACION = [
            { nombre: 'Novato', min: 0, max: 99 },
            { nombre: 'Principiante', min: 100, max: 299 },
            { nombre: 'Corredor', min: 300, max: 599 },
            { nombre: 'Atleta', min: 600, max: 999 },
            { nombre: 'Veterano', min: 1000, max: 1999 },
            { nombre: 'Experto', min: 2000, max: 4999 },
            { nombre: 'Maestro', min: 5000, max: 9999 },
            { nombre: 'Leyenda', min: 10000, max: Infinity }
        ];

        function getNivelInfo(puntos) {
            const nivel = NIVELES_GAMIFICACION.find(n => puntos >= n.min && puntos <= n.max) || NIVELES_GAMIFICACION[0];
            const siguiente = NIVELES_GAMIFICACION.find(n => n.min > puntos);
            const progreso = siguiente ? ((puntos - nivel.min) / (siguiente.min - nivel.min)) * 100 : 100;
            return { nivel, siguiente, progreso };
        }

        // ====== NOTIFICACIONES PUSH - UI ======
        async function loadAndDisplayNotificationPrefs() {
            // Actualizar estado del toggle principal
            if (typeof updateNotificationUI === 'function') {
                await updateNotificationUI();
            }

            // Mostrar advertencia si está bloqueado
            const blockedHint = document.getElementById('notif-blocked-hint');
            // C2: load push.js on-demand when opening notification settings
            await ensurePushLoaded();
            if (blockedHint && typeof getPushPermissionState === 'function') {
                const state = getPushPermissionState();
                blockedHint.classList.toggle('hidden', state !== 'denied');
            }

            // Cargar preferencias de tipos de notificación
            if (typeof loadNotificationPreferences === 'function') {
                const prefs = await loadNotificationPreferences();
                if (prefs) {
                    const mappings = {
                        'pref-recordatorio-24h': 'recordatorio_24h',
                        'pref-recordatorio-1h': 'recordatorio_1h',
                        'pref-participante-se-une': 'participante_se_une',
                        'pref-nueva-quedada-ciudad': 'nueva_quedada_ciudad',
                        'pref-quedada-cancelada': 'quedada_cancelada'
                    };
                    for (const [elemId, prefKey] of Object.entries(mappings)) {
                        const el = document.getElementById(elemId);
                        if (el && prefs[prefKey] !== undefined) {
                            el.checked = prefs[prefKey];
                        }
                    }
                }
            }

            // Actualizar UI de notificaciones Premium
            updatePremiumNotificationsUI();
        }

        // ====== NOTIFICACIONES PREMIUM UI ======
        function updatePremiumNotificationsUI() {
            const isPremium = window.isUserPremium || (window.currentUser && window.currentUser.es_premium);
            const locked = document.getElementById('notif-premium-locked');
            const options = document.getElementById('notif-premium-options');
            const badge = document.getElementById('notif-premium-badge');

            if (isPremium) {
                locked?.classList.add('hidden');
                options?.classList.remove('hidden');
                badge?.classList.add('hidden');
            } else {
                locked?.classList.remove('hidden');
                options?.classList.add('hidden');
                badge?.classList.remove('hidden');
            }

            // Toggle para mostrar/ocultar opciones de zona
            const zonaCheckbox = document.getElementById('pref-premium-zona');
            const zonaOptions = document.getElementById('pref-premium-zona-options');
            if (zonaCheckbox && zonaOptions) {
                zonaCheckbox.addEventListener('change', function() {
                    zonaOptions.classList.toggle('hidden', !this.checked);
                });
            }

            // Toggle para mostrar/ocultar opciones de horario
            const horarioCheckbox = document.getElementById('pref-premium-horario');
            const horarioOptions = document.getElementById('pref-premium-horario-options');
            if (horarioCheckbox && horarioOptions) {
                horarioCheckbox.addEventListener('change', function() {
                    horarioOptions.classList.toggle('hidden', !this.checked);
                });
            }
        }

        async function loadGamificationStats() {
            if (!currentUser) return;

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                // Cargar stats del usuario
                const { data: stats, error } = await sb.rpc('get_user_gamification_stats', { p_user_id: currentUser.id });

                if (error || !stats || stats.length === 0) {
                    console.warn('Error cargando gamificación:', error?.message);
                    return;
                }

                const s = stats[0];
                const nivelInfo = getNivelInfo(s.puntos_totales || 0);
                const puntos = s.puntos_totales || 0;
                // Usar userStats (fuente real) para consistencia con dashboard
                const creadas = userStats.created || 0;
                const asistidas = userStats.quedadas || 0;
                const hasProgress = puntos > 0 || creadas > 0 || asistidas > 0;

                // Actualizar UI
                const elPoints = document.getElementById('gamification-points');
                const elCreated = document.getElementById('gamification-created');
                const elAttended = document.getElementById('gamification-attended');
                const elLevel = document.getElementById('gamification-level');
                const elCurrentLevel = document.getElementById('gamification-current-level');
                const elNextLevel = document.getElementById('gamification-next-level');
                const elProgressBar = document.getElementById('gamification-progress-bar');

                if (elPoints) elPoints.textContent = puntos;
                if (elCreated) elCreated.textContent = creadas;
                if (elAttended) elAttended.textContent = asistidas;
                if (elLevel) elLevel.textContent = nivelInfo.nivel.nombre;
                if (elCurrentLevel) elCurrentLevel.textContent = nivelInfo.nivel.nombre;
                if (elNextLevel) {
                    elNextLevel.textContent = nivelInfo.siguiente
                        ? `${nivelInfo.siguiente.nombre} (${nivelInfo.siguiente.min} pts)`
                        : '¡Nivel máximo!';
                }
                if (elProgressBar) elProgressBar.style.width = `${Math.min(nivelInfo.progreso, 100)}%`;

                // 🎯 ACTUALIZAR SECCIONES SEGÚN PROGRESO
                const goalSection = document.getElementById('current-goal-section');
                const statsSection = document.getElementById('stats-grid-section');
                const levelSection = document.getElementById('level-progress-section');

                if (hasProgress) {
                    // Usuario con progreso: mostrar stats y nivel, ocultar objetivo inicial
                    if (goalSection) goalSection.classList.add('hidden');
                    if (statsSection) statsSection.classList.remove('hidden');
                    if (levelSection) levelSection.classList.remove('hidden');
                } else {
                    // Usuario nuevo: mostrar objetivo, ocultar stats vacíos
                    if (goalSection) goalSection.classList.remove('hidden');
                    if (statsSection) statsSection.classList.add('hidden');
                    if (levelSection) levelSection.classList.add('hidden');
                }

                // 🎯 ACTUALIZAR OBJETIVO ACTUAL
                updateCurrentGoal();

                // Racha + Ranking local + Next level text (nuevos campos perfil)
                const elStreak = document.getElementById('profile-streak');
                if (elStreak) elStreak.textContent = userStats.racha || 0;
                const elRank = document.getElementById('profile-local-rank');
                if (elRank) elRank.textContent = 'Sin clasificar aún';
                const elNextText = document.getElementById('gamification-next-level-text');
                if (elNextText) {
                    if (nivelInfo.siguiente) {
                        const falta = nivelInfo.siguiente.min - puntos;
                        elNextText.textContent = `Te faltan ${falta} puntos para ${nivelInfo.siguiente.nombre}`;
                    } else {
                        elNextText.textContent = '¡Has alcanzado el nivel máximo!';
                    }
                }

                // Cargar badges
                loadUserBadges(asistidas, creadas);

            } catch (e) {
                console.warn('Error en loadGamificationStats:', e);
            }
        }

        // ====== ACTIVIDAD RECIENTE (perfil) ======
        function loadRecentActivity() {
            const list = document.getElementById('recent-activity-list');
            const empty = document.getElementById('recent-activity-empty');
            if (!list || !currentUser) return;
            const userQuedadas = quedadas.filter(q =>
                q.creador_id === currentUser.id ||
                (q.participantes_data && q.participantes_data.some(p => p.user_id === currentUser.id))
            ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3);
            if (userQuedadas.length === 0) { if (empty) empty.classList.remove('hidden'); return; }
            if (empty) empty.classList.add('hidden');
            list.innerHTML = userQuedadas.map(q => {
                const isCreator = q.creador_id === currentUser.id;
                const action = isCreator ? 'Creaste' : 'Asististe a';
                const icon = isCreator ? '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>' : '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
                const dateStr = q.fecha ? new Date(q.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
                return `<div class="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30">
                    <span class="text-xs">${icon}</span>
                    <span class="flex-1 truncate">${action}: <b class="text-white">${q.titulo || 'Quedada'}</b></span>
                    <span class="text-xs text-gray-500">${dateStr}</span>
                </div>`;
            }).join('');
        }

        // ====== ESTADÍSTICAS AVANZADAS (perfil) ======
        function loadAdvancedStats() {
            if (!currentUser) return;
            const elStreak = document.getElementById('stat-streak');
            const elAvgKm = document.getElementById('stat-avg-km');
            const elCreated = document.getElementById('stat-created');
            const elTotalKm = document.getElementById('stat-total-km');
            const racha = userStats.racha || 0;
            const totalKm = userStats.km || 0;
            const quedadasCount = userStats.quedadas || 0;
            const avgKm = quedadasCount > 0 ? (totalKm / quedadasCount).toFixed(1) : '0';
            const created = userStats.created || 0;
            if (elStreak) elStreak.textContent = racha;
            if (elAvgKm) elAvgKm.textContent = avgKm;
            if (elCreated) elCreated.textContent = created;
            if (elTotalKm) elTotalKm.textContent = totalKm;
            // Ocultar bloque premium-locked si es premium
            const premLocked = document.getElementById('stats-premium-locked');
            if (premLocked && getEffectivePlan() === 'premium') premLocked.classList.add('hidden');
        }

        // ====== COMPARTIR REFERRAL EN INSTAGRAM ======
        function shareReferralInstagram() {
            const link = document.getElementById('referral-link-input')?.value || '';
            const text = `¡Corre conmigo en CorrerJuntos! 🏃‍♂️🏃‍♀️\n\nÚnete gratis: ${link}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('Texto copiado — pégalo en tu historia de Instagram', 'success');
                });
            } else {
                showToast('Copia este enlace: ' + link, 'info');
            }
            if (typeof gtag === 'function') gtag('event', 'referral_share', { method: 'instagram', referral_code: currentUser?.referral_code });
        }

        // 🎯 Actualizar objetivo actual según progreso del usuario
        function updateCurrentGoal() {
            const goalTitle = document.getElementById('current-goal-title');
            const goalDesc = document.getElementById('current-goal-desc');
            const goalProgress = document.getElementById('current-goal-progress');
            const goalText = document.getElementById('current-goal-text');

            if (!goalTitle) return;

            // Usar userStats (fuente real) para consistencia con dashboard
            var _q = userStats.quedadas || 0, _c = userStats.created || 0, _r = userStats.runners || 0;

            // Definir objetivos en orden de prioridad
            const goals = [
                { id: 'first_run', target: 1, current: _q, title: currentLang === 'en' ? 'Your goal: First run' : 'Tu objetivo: Primera quedada', desc: currentLang === 'en' ? 'Join a run and meet runners' : 'Únete a una quedada y conoce runners' },
                { id: 'social_5', target: 5, current: _r, title: currentLang === 'en' ? 'Your goal: Meet 5 runners' : 'Tu objetivo: Conocer 5 runners', desc: currentLang === 'en' ? 'Meet 5 different runners' : 'Conoce a 5 runners diferentes' },
                { id: 'creator', target: 1, current: _c, title: currentLang === 'en' ? 'Your goal: Lead a run' : 'Tu objetivo: Liderar una quedada', desc: currentLang === 'en' ? 'Create your first group run' : 'Crea tu primera quedada grupal' },
                { id: 'veteran', target: 10, current: _q, title: currentLang === 'en' ? 'Your goal: Veteran' : 'Tu objetivo: Veterano', desc: currentLang === 'en' ? 'Complete 10 runs' : 'Completa 10 quedadas' },
            ];

            // Encontrar el primer objetivo no completado
            const nextGoal = goals.find(g => g.current < g.target) || goals[goals.length - 1];
            const progress = Math.min((nextGoal.current / nextGoal.target) * 100, 100);

            goalTitle.textContent = nextGoal.title;
            goalDesc.textContent = nextGoal.desc;
            if (goalProgress) goalProgress.style.width = `${progress}%`;
            if (goalText) goalText.textContent = `${nextGoal.current}/${nextGoal.target}`;
        }

        async function loadUserBadges(asistidas = 0, creadas = 0) {
            if (!currentUser) return;

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                const { data: badges, error } = await sb.rpc('get_user_badges', { p_user_id: currentUser.id });

                if (error) {
                    console.warn('Error cargando badges:', error.message);
                    return;
                }

                const container = document.getElementById('gamification-badges');
                const nextBadgesList = document.getElementById('next-badges-list');
                const countEl = document.getElementById('gamification-badges-count');
                if (!container) return;

                const unlocked = (badges || []).filter(b => b.unlocked);
                const locked = (badges || []).filter(b => !b.unlocked);

                if (countEl) countEl.textContent = `${unlocked.length} desbloqueados`;

                // Mostrar badges desbloqueados
                if (unlocked.length > 0) {
                    container.innerHTML = unlocked.slice(0, 8).map(b => `
                        <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30" title="${b.descripcion}">
                            <span>${b.icono}</span>
                            <span class="text-xs font-bold text-purple-300">${b.nombre}</span>
                        </div>
                    `).join('');

                    if (unlocked.length > 8) {
                        container.innerHTML += `<span class="text-xs text-gray-500">+${unlocked.length - 8} más</span>`;
                    }
                } else {
                    container.innerHTML = '';
                }

                // 🔓 Mostrar próximos badges a desbloquear con progreso
                // Usar userStats (fuente real desde participantes) para consistencia con dashboard
                if (nextBadgesList) {
                    var _q = userStats.quedadas || 0, _c = userStats.created || 0, _r = userStats.runners || 0;
                    const nextBadges = [
                        { icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>', name: currentLang === 'en' ? 'First Run' : 'Primera Carrera', desc: currentLang === 'en' ? 'Join your first run' : 'Asiste a tu primera quedada', current: _q, target: 1, unlocked: _q >= 1 },
                        { icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>', name: currentLang === 'en' ? 'Leader' : 'Líder', desc: currentLang === 'en' ? 'Create your first run' : 'Crea tu primera quedada', current: _c, target: 1, unlocked: _c >= 1 },
                        { icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>', name: currentLang === 'en' ? 'Social Runner' : 'Social Runner', desc: currentLang === 'en' ? 'Meet 5 different runners' : 'Conoce a 5 runners diferentes', current: _r, target: 5, unlocked: _r >= 5 },
                        { icon: '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>', name: currentLang === 'en' ? 'Veteran' : 'Veterano', desc: currentLang === 'en' ? 'Complete 10 runs' : 'Completa 10 quedadas', current: _q, target: 10, unlocked: _q >= 10 },
                    ];

                    // Mostrar solo los primeros 3 badges no desbloqueados
                    const pendingBadges = nextBadges.filter(b => !b.unlocked).slice(0, 3);

                    if (pendingBadges.length > 0) {
                        nextBadgesList.innerHTML = pendingBadges.map(b => `
                            <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-800/30 border border-slate-700/50">
                                <span class="text-xl opacity-50">${b.icon}</span>
                                <div class="flex-1">
                                    <p class="text-gray-300 text-xs font-semibold">${b.name}</p>
                                    <p class="text-gray-500 text-xs">${b.desc}</p>
                                </div>
                                <span class="text-xs ${b.current > 0 ? 'text-orange-400' : 'text-gray-500'} font-semibold">${b.current}/${b.target}</span>
                            </div>
                        `).join('');
                    } else {
                        nextBadgesList.innerHTML = '<p class="text-xs text-green-400 text-center py-2">🎉 ¡Todos los badges básicos desbloqueados!</p>';
                    }
                }

            } catch (e) {
                console.warn('Error en loadUserBadges:', e);
            }
        }

        async function openRankingModal() {
            openModal('modal-ranking');
            // Deep link: actualizar URL
            try{ history.pushState({cj:'ranking'}, '', '#ranking'); }catch(_){}
            loadRanking();
        }

        async function loadRanking() {
            const container = document.getElementById('ranking-list');
            const myPosEl = document.getElementById('ranking-my-position');
            if (!container) return;

            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    Cargando ranking...
                </div>
            `;

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) {
                    container.innerHTML = '<div class="text-center py-8 text-gray-500">No se pudo conectar. Inténtalo de nuevo.</div>';
                    return;
                }

                // Timeout de 10s para evitar loading infinito
                const rankingPromise = sb.rpc('get_ranking_semanal', { limite: 10 });
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000));
                const { data: ranking, error } = await Promise.race([rankingPromise, timeoutPromise]);

                if (error) {
                    container.innerHTML = '<div class="text-center py-8 text-red-400">Error cargando ranking</div>';
                    return;
                }

                if (!ranking || ranking.length === 0) {
                    container.innerHTML = '<div class="text-center py-8 text-gray-500">No hay datos de ranking esta semana</div>';
                    return;
                }

                container.innerHTML = ranking.map((r, i) => {
                    const isMe = currentUser && r.user_id === currentUser.id;
                    const medal = i === 0 ? '<span style="color:#fbbf24;font-weight:900">1</span>' : i === 1 ? '<span style="color:#94a3b8;font-weight:900">2</span>' : i === 2 ? '<span style="color:#d97706;font-weight:900">3</span>' : `${i + 1}`;
                    const initials = ((r.nombre?.charAt(0) || '') + (r.apellidos?.charAt(0) || '')).toUpperCase() || 'R';
                    const isFollowing = userFollowingIds.has(r.user_id);
                    const isPremium = r.es_premium;

                    return `
                        <div class="flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-800/50 border border-slate-700 hover:border-orange-500/30 cursor-pointer transition'}" onclick="${isMe ? '' : `closeModal('modal-ranking'); openUserProfile('${r.user_id}')`}">
                            <div class="w-8 h-8 flex items-center justify-center text-lg font-black ${i < 3 ? '' : 'text-gray-500'}">${medal}</div>
                            <div class="w-10 h-10 rounded-full ${isPremium ? 'premium-avatar-border' : 'bg-slate-700'} flex items-center justify-center overflow-hidden">
                                ${r.photo_url
                                    ? `<img src="${r.photo_url}" class="w-full h-full object-cover" alt="${r.nombre || 'Runner'}" loading="lazy">`
                                    : `<span class="text-sm font-bold text-gray-400">${initials}</span>`
                                }
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-bold text-white truncate">${r.nombre || ''} ${r.apellidos || ''} ${isPremium ? '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>' : ''}</div>
                                <div class="text-xs text-gray-500">${r.nivel || 'Novato'} · ${r.ciudad || ''}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="text-right">
                                    <div class="font-black text-orange-400">${r.puntos_semana || 0}</div>
                                    <div class="text-xs text-gray-500">pts</div>
                                </div>
                                ${isMe ? '' : `
                                    <button class="btn-follow ${isFollowing ? 'following' : 'not-following'} text-xs px-2 py-1" onclick="event.stopPropagation(); toggleFollow('${r.user_id}', this)">
                                        ${isFollowing ? '✓' : '+'}
                                    </button>
                                `}
                            </div>
                        </div>
                    `;
                }).join('');

                // Mi posición
                if (currentUser && myPosEl) {
                    const myRank = ranking.find(r => r.user_id === currentUser.id);
                    if (myRank) {
                        myPosEl.innerHTML = `Tu posición: <span class="font-bold text-purple-400">#${myRank.posicion}</span> con <span class="font-bold text-orange-400">${myRank.puntos_semana}</span> pts esta semana`;
                    } else {
                        // Buscar posición fuera del top 10
                        const { data: stats } = await sb.rpc('get_user_gamification_stats', { p_user_id: currentUser.id });
                        if (stats && stats[0]) {
                            myPosEl.innerHTML = `Tu posición: <span class="font-bold text-purple-400">#${stats[0].posicion_ranking || '-'}</span>`;
                        }
                    }
                }

            } catch (e) {
                console.warn('Error en loadRanking:', e);
                var msg = e && e.message === 'timeout'
                    ? 'El ranking tardó demasiado en cargar. Inténtalo de nuevo.'
                    : 'Error cargando ranking. Inténtalo más tarde.';
                container.innerHTML = '<div class="text-center py-8 text-red-400">' + msg + '</div>';
            }
        }

        // ==================== MIS QUEDADAS (HISTORIAL) ====================
        let misQuedadasTab = 'proximas';
        let misQuedadasData = { proximas: [], pasadas: [] };

        function switchMisQuedadasTab(tab) {
            misQuedadasTab = tab;

            // Actualizar tabs visualmente
            const tabProximas = document.getElementById('tab-proximas');
            const tabPasadas = document.getElementById('tab-pasadas');

            if (tab === 'proximas') {
                tabProximas.className = 'flex-1 py-2 px-3 rounded-xl text-sm font-bold transition bg-blue-500/20 text-blue-300 border border-blue-500/30';
                tabPasadas.className = 'flex-1 py-2 px-3 rounded-xl text-sm font-bold transition bg-slate-800/50 text-gray-400 border border-slate-700 hover:border-blue-500/30';
            } else {
                tabPasadas.className = 'flex-1 py-2 px-3 rounded-xl text-sm font-bold transition bg-blue-500/20 text-blue-300 border border-blue-500/30';
                tabProximas.className = 'flex-1 py-2 px-3 rounded-xl text-sm font-bold transition bg-slate-800/50 text-gray-400 border border-slate-700 hover:border-blue-500/30';
            }

            renderMisQuedadas();
        }

        async function loadMisQuedadas() {
            if (!currentUser) return;

            const container = document.getElementById('mis-quedadas-list');
            if (!container) return;

            container.innerHTML = `
                <div class="text-center py-4 text-gray-500 text-sm">
                    <div class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Cargando...
                </div>
            `;

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                const now = new Date().toISOString();

                // Obtener quedadas donde el usuario participa
                const { data: participaciones, error } = await sb
                    .from('participantes')
                    .select('quedada_id, status, quedadas(*)')
                    .eq('user_id', currentUser.id);

                if (error) throw error;

                const todasMisQuedadas = (participaciones || [])
                    .filter(p => p.quedadas)
                    .map(p => ({ ...p.quedadas, mi_status: p.status }));

                // Separar en próximas y pasadas
                misQuedadasData.proximas = todasMisQuedadas
                    .filter(q => new Date(q.fecha + 'T' + q.hora) >= new Date())
                    .sort((a, b) => new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora));

                misQuedadasData.pasadas = todasMisQuedadas
                    .filter(q => new Date(q.fecha + 'T' + q.hora) < new Date())
                    .sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));

                renderMisQuedadas();

            } catch (e) {
                console.warn('Error cargando mis quedadas:', e);
                container.innerHTML = '<div class="text-center py-4 text-red-400 text-sm">Error al cargar quedadas</div>';
            }
        }

        function renderMisQuedadas() {
            const container = document.getElementById('mis-quedadas-list');
            if (!container) return;

            const lista = misQuedadasTab === 'proximas' ? misQuedadasData.proximas : misQuedadasData.pasadas;

            const t = I18N[currentLang] || I18N.es;

            if (lista.length === 0) {
                // 🎯 CTA MEJORADO para "Mis Quedadas" vacío
                const quedadasCount = quedadas ? quedadas.length : 0;
                if (misQuedadasTab === 'proximas') {
                    container.innerHTML = `
                        <div class="text-center py-4">
                            <div class="mb-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/30">
                                <span class="text-3xl mb-2 block"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></span>
                                <p class="text-white font-bold text-sm mb-1">${quedadasCount > 0 ? (currentLang === 'en' ? `${quedadasCount} runs waiting for you` : `${quedadasCount} quedadas te esperan`) : (currentLang === 'en' ? 'No runs yet' : 'Sin quedadas aún')}</p>
                                <p class="text-gray-400 text-xs mb-3">${currentLang === 'en' ? 'Join one and meet your running crew' : 'Únete a una y conoce tu grupo de running'}</p>
                                <button onclick="closeModal('modal-profile'); scrollToQuedadas()" class="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 transition flex items-center justify-center gap-2">
                                    <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${currentLang === 'en' ? 'Discover runs' : 'Descubrir quedadas'}
                                </button>
                            </div>
                            <p class="text-gray-500 text-xs mb-2">${currentLang === 'en' ? 'Or create your own:' : '¿O prefieres crear la tuya?'}</p>
                            <button onclick="closeModal('modal-profile'); openModalCrear()" class="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-1 w-full">
                                <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> ${currentLang === 'en' ? 'Create my run' : 'Crear mi quedada'}
                            </button>
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div class="text-center py-6 text-gray-500">
                            <span class="text-3xl mb-2 block">✓</span>
                            <p class="text-sm">${currentLang === 'en' ? 'No completed runs yet' : 'Aún no has completado quedadas'}</p>
                            <p class="text-xs text-gray-600 mt-1">${currentLang === 'en' ? 'Join a run and it will appear here' : 'Asiste a una quedada y aparecerá aquí'}</p>
                        </div>
                    `;
                }
                return;
            }
            container.innerHTML = lista.map(q => {
                const fecha = new Date(q.fecha);
                const hoy = new Date();
                const esHoy = fecha.toDateString() === hoy.toDateString();
                const manana = new Date(hoy);
                manana.setDate(manana.getDate() + 1);
                const esManana = fecha.toDateString() === manana.toDateString();

                const locale = currentLang === 'en' ? 'en-US' : 'es-ES';
                const fechaStr = esHoy ? t.dateToday : esManana ? t.dateTomorrow : fecha.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
                const isPast = misQuedadasTab === 'pasadas';

                return `
                    <div onclick="closeModal('modal-profile'); openQuedadaDetail('${q.id}')"
                         class="p-3 rounded-xl cursor-pointer transition ${isPast ? 'bg-slate-800/30 border border-slate-700/50 opacity-80' : 'bg-slate-800/50 border border-slate-700 hover:border-blue-500/30'}">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <p class="font-bold text-white text-sm truncate">${q.titulo || (currentLang === 'en' ? 'Run' : 'Quedada')}</p>
                                <p class="text-xs text-gray-400 truncate"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${q.ubicacion || q.ciudad || (currentLang === 'en' ? 'No location' : 'Sin ubicación')}</p>
                            </div>
                            <div class="text-right ml-3">
                                <p class="text-xs font-bold ${esHoy ? 'text-orange-400' : 'text-blue-400'}">${fechaStr}</p>
                                <p class="text-xs text-gray-500">${q.hora?.substring(0, 5) || '--:--'}</p>
                            </div>
                        </div>
                        ${isPast ? `<div class="mt-2 flex items-center gap-1 text-xs text-green-400"><span>✓</span> ${currentLang === 'en' ? 'Completed' : 'Completada'}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        function scrollToQuedadas() {
            document.getElementById('quedadas-list')?.scrollIntoView({ behavior: 'smooth' });
        }
        // ==================== FIN MIS QUEDADAS ====================

        // ==================== SISTEMA SOCIAL ====================
        let userFollowingIds = new Set(); // IDs de usuarios que sigo

        async function loadSocialStats() {
            if (!currentUser) return;
            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                // Cargar seguidores
                const { data: seguidores } = await sb.rpc('get_seguidores', { p_user_id: currentUser.id, p_limite: 100 });
                const seguidoresCount = seguidores?.length || 0;

                // Cargar siguiendo
                const { data: siguiendo } = await sb.rpc('get_siguiendo', { p_user_id: currentUser.id, p_limite: 100 });
                const siguiendoCount = siguiendo?.length || 0;

                // Guardar IDs de a quién sigo
                userFollowingIds = new Set((siguiendo || []).map(u => u.user_id));

                // Actualizar UI
                const statSeguidores = document.getElementById('stat-seguidores');
                const statSiguiendo = document.getElementById('stat-siguiendo');
                const socialStatsContainer = document.getElementById('social-stats-container');
                if (statSeguidores) statSeguidores.textContent = seguidoresCount;
                if (statSiguiendo) statSiguiendo.textContent = siguiendoCount;

                // Ocultar stats si ambos son 0 (desmoralizante para usuarios nuevos)
                if (socialStatsContainer) {
                    if (seguidoresCount === 0 && siguiendoCount === 0) {
                        socialStatsContainer.classList.add('hidden');
                    } else {
                        socialStatsContainer.classList.remove('hidden');
                    }
                }

            } catch (e) {
                console.warn('Error cargando social stats:', e);
            }
        }

        async function openFollowersModal(type) {
            if (!currentUser) {
                showToast('Debes iniciar sesión', 'error');
                openModal('modal-register');
                return;
            }

            const modal = document.getElementById('modal-followers');
            const title = document.getElementById('followers-modal-title');
            const subtitle = document.getElementById('followers-modal-subtitle');
            const container = document.getElementById('followers-list');

            if (type === 'seguidores') {
                title.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg> Seguidores';
                subtitle.textContent = 'Personas que te siguen';
            } else {
                title.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> Siguiendo';
                subtitle.textContent = 'Personas que sigues';
            }

            openModal('modal-followers');

            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    Cargando...
                </div>
            `;

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                const rpcName = type === 'seguidores' ? 'get_seguidores' : 'get_siguiendo';
                const { data: users, error } = await sb.rpc(rpcName, { p_user_id: currentUser.id, p_limite: 100 });

                if (error) {
                    container.innerHTML = '<div class="text-center py-8 text-red-400">Error cargando datos</div>';
                    return;
                }

                if (!users || users.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-8">
                            <span class="text-4xl mb-3 block">${type === 'seguidores' ? '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>' : '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>'}</span>
                            <p class="text-gray-400 font-semibold mb-2">${type === 'seguidores' ? 'Sin seguidores aún' : 'No sigues a nadie'}</p>
                            <p class="text-gray-500 text-sm">${type === 'seguidores' ? 'Cuando otros runners te sigan, aparecerán aquí' : 'Busca runners en el ranking y síguelos'}</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = users.map(u => {
                    const isMe = u.user_id === currentUser.id;
                    const isFollowing = userFollowingIds.has(u.user_id);
                    const initials = ((u.nombre?.charAt(0) || '') + (u.apellidos?.charAt(0) || '')).toUpperCase() || 'R';
                    const isPremium = u.es_premium;

                    return `
                        <div class="user-list-item" onclick="${isMe ? '' : `openUserProfile('${u.user_id}')`}" style="${isMe ? '' : 'cursor:pointer;'}">
                            <div class="user-list-avatar ${isPremium ? 'premium-avatar-border' : ''}">
                                ${u.photo_url
                                    ? `<img src="${u.photo_url}" alt="${u.nombre || 'Runner'}" loading="lazy">`
                                    : `<div class="w-full h-full bg-orange-500/30 flex items-center justify-center text-orange-400 font-bold">${initials}</div>`
                                }
                            </div>
                            <div class="user-list-info">
                                <div class="user-list-name">${u.nombre || ''} ${u.apellidos || ''} ${isPremium ? '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>' : ''}</div>
                                <div class="user-list-meta">
                                    ${u.nivel ? `<span>${getNivelEmoji(u.nivel)} ${u.nivel}</span>` : ''}
                                    ${u.ciudad ? `<span><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${u.ciudad}</span>` : ''}
                                </div>
                            </div>
                            ${isMe
                                ? `<span class="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">Tú</span>`
                                : `<button class="btn-follow ${isFollowing ? 'following' : 'not-following'}" onclick="event.stopPropagation(); toggleFollow('${u.user_id}', this)">
                                    ${isFollowing ? '✓ Siguiendo' : 'Seguir'}
                                </button>`
                            }
                        </div>
                    `;
                }).join('');

            } catch (e) {
                console.warn('Error en openFollowersModal:', e);
                container.innerHTML = '<div class="text-center py-8 text-red-400">Error cargando datos</div>';
            }
        }

        function getNivelEmoji(nivel) {
            const n = (nivel || '').toLowerCase();
            if (n === 'principiante') return '<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span>';
            if (n === 'intermedio') return '<span style="width:8px;height:8px;border-radius:50%;background:#eab308;display:inline-block"></span>';
            if (n === 'avanzado') return '<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span>';
            if (n === 'elite') return '<span style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;display:inline-block"></span>';
            return '<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span>';
        }

        async function toggleFollow(userId, btn) {
            if (!currentUser) {
                showToast('Debes iniciar sesión', 'error');
                return;
            }

            const isFollowing = userFollowingIds.has(userId);
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>';

            try {
                const sb = await getSupabaseClientOrToast(8000, true);
                if (!sb) { btn.disabled = false; return; }

                if (isFollowing) {
                    // Dejar de seguir
                    const { error } = await sb.rpc('dejar_de_seguir', { p_following_id: userId });
                    if (error) throw error;
                    userFollowingIds.delete(userId);
                    btn.className = 'btn-follow not-following';
                    btn.innerHTML = 'Seguir';
                    showToast('Has dejado de seguir', 'info');
                } else {
                    // Seguir
                    const { error } = await sb.rpc('seguir_usuario', { p_following_id: userId });
                    if (error) throw error;
                    userFollowingIds.add(userId);
                    btn.className = 'btn-follow following';
                    btn.innerHTML = '✓ Siguiendo';
                    showToast('¡Ahora sigues a este runner!', 'success');
                }

                // Actualizar contadores
                loadSocialStats();

            } catch (e) {
                console.warn('Error en toggleFollow:', e);
                showToast('Error al procesar', 'error');
                btn.innerHTML = isFollowing ? '✓ Siguiendo' : 'Seguir';
            }
            btn.disabled = false;
        }

        function sendDM(userId) {
            if (!currentUser) { openModal('modal-login'); return; }
            if (!can('canDM')) {
                openPremiumModal('direct_messages');
                if (typeof gtag === 'function') gtag('event', 'premium_feature_blocked', { feature: 'direct_messages' });
                return;
            }
            // Premium: DM coming soon
            showToast(currentLang === 'en' ? 'Private messages — Coming soon!' : 'Mensajes privados — ¡Próximamente!', 'info');
        }

        async function openUserProfile(userId) {
            if (!userId) return;
            closeModal('modal-followers');

            const container = document.getElementById('user-profile-content');
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <div class="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    Cargando perfil...
                </div>
            `;

            openModal('modal-user-profile');
            // Deep link: actualizar URL
            try{ history.pushState({cj:'perfil',id:userId}, '', '#perfil/' + userId); }catch(_){}

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                // Cargar perfil
                const { data: profile, error } = await sb
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error || !profile) {
                    container.innerHTML = '<div class="text-center py-8 text-red-400">No se encontró el perfil</div>';
                    return;
                }

                // Cargar stats de seguidores
                const { data: seguidores } = await sb.rpc('get_seguidores', { p_user_id: userId, p_limite: 100 });
                const { data: siguiendo } = await sb.rpc('get_siguiendo', { p_user_id: userId, p_limite: 100 });

                const seguidoresCount = seguidores?.length || 0;
                const siguiendoCount = siguiendo?.length || 0;
                const isFollowing = userFollowingIds.has(userId);
                const isMe = currentUser && userId === currentUser.id;
                const isPremium = profile.es_premium;
                const initials = ((profile.nombre?.charAt(0) || '') + (profile.apellidos?.charAt(0) || '')).toUpperCase() || 'R';

                container.innerHTML = `
                    <div class="text-center mb-6">
                        <!-- Avatar -->
                        <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ${isPremium ? 'premium-avatar-border' : 'border-4 border-orange-500/30'}">
                            ${profile.photo_url
                                ? `<img src="${profile.photo_url}" class="w-full h-full object-cover" alt="Foto de perfil" loading="lazy">`
                                : `<div class="w-full h-full bg-orange-500/30 flex items-center justify-center text-2xl font-bold text-orange-400">${initials}</div>`
                            }
                        </div>

                        <!-- Nombre y badges -->
                        <h3 class="text-xl font-black text-white mb-1">
                            ${profile.nombre || ''} ${profile.apellidos || ''}
                            ${isPremium ? '<span class="ml-1"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg></span>' : ''}
                            ${profile.verification_badge ? '<span class="ml-1 text-blue-400">✓</span>' : ''}
                        </h3>

                        <!-- Nivel y ciudad -->
                        <p class="text-gray-400 text-sm mb-4">
                            ${profile.nivel ? `${getNivelEmoji(profile.nivel)} ${profile.nivel.charAt(0).toUpperCase() + profile.nivel.slice(1)}` : ''}
                            ${profile.nivel && profile.ciudad ? ' • ' : ''}
                            ${profile.ciudad ? `<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ${profile.ciudad}` : ''}
                        </p>

                        <!-- Stats sociales -->
                        <div class="flex justify-center gap-8 mb-4">
                            <div class="text-center">
                                <div class="text-xl font-black text-white">${siguiendoCount}</div>
                                <div class="text-xs text-gray-500">Siguiendo</div>
                            </div>
                            <div class="w-px h-10 bg-slate-700"></div>
                            <div class="text-center">
                                <div class="text-xl font-black text-white">${seguidoresCount}</div>
                                <div class="text-xs text-gray-500">Seguidores</div>
                            </div>
                        </div>

                        <!-- Botón seguir + DM -->
                        ${isMe ? '' : `
                            <div class="flex items-center justify-center gap-3">
                                <button id="btn-follow-profile" class="btn-follow ${isFollowing ? 'following' : 'not-following'} px-8 py-3" onclick="toggleFollow('${userId}', this)">
                                    ${isFollowing ? '✓ Siguiendo' : 'Seguir'}
                                </button>
                                <button class="px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-gray-300 text-sm font-semibold hover:bg-slate-600/50 transition" onclick="sendDM('${userId}')">
                                    <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> ${currentLang === 'en' ? 'Message' : 'Mensaje'}
                                </button>
                            </div>
                        `}
                    </div>

                    <!-- Stats de running -->
                    <div class="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                        <h4 class="text-sm font-bold text-gray-400 mb-3"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> Estadísticas</h4>
                        <div class="grid grid-cols-3 gap-3">
                            <div class="text-center p-3 bg-slate-900/50 rounded-xl">
                                <div class="text-lg font-black text-orange-400">${profile.puntos_totales?.toLocaleString() || 0}</div>
                                <div class="text-xs text-gray-500">Puntos</div>
                            </div>
                            <div class="text-center p-3 bg-slate-900/50 rounded-xl">
                                <div class="text-lg font-black text-green-400">${profile.quedadas_completadas || 0}</div>
                                <div class="text-xs text-gray-500">Quedadas</div>
                            </div>
                            <div class="text-center p-3 bg-slate-900/50 rounded-xl">
                                <div class="text-lg font-black text-blue-400">${profile.km_totales?.toFixed(1) || 0}</div>
                                <div class="text-xs text-gray-500">Km</div>
                            </div>
                        </div>
                    </div>
                `;

            } catch (e) {
                console.warn('Error en openUserProfile:', e);
                container.innerHTML = '<div class="text-center py-8 text-red-400">Error cargando perfil</div>';
            }
        }
        // ==================== FIN SISTEMA SOCIAL ====================

        // ==================== PREMIUM SALES PAGE ====================
        function openPremiumSales() {
            if (isUserPremium) {
                openModal('modal-profile');
                return;
            }
            openModal('modal-premium-sales');
            const content = document.querySelector('#modal-premium-sales .modal-content');
            if (content) content.scrollTop = 0;
            // Apply i18n to sales page
            const t = I18N[currentLang] || I18N.es;
            const ids = ['sales-hero-title','sales-hero-subtitle','sales-hero-trial','sales-features-title',
                'sales-f1-title','sales-f1-desc','sales-f2-title','sales-f2-desc','sales-f3-title','sales-f3-desc',
                'sales-f4-title','sales-f4-desc','sales-f5-title','sales-f5-desc','sales-f6-title','sales-f6-desc',
                'sales-f7-title','sales-f7-desc','sales-f8-title','sales-f8-desc','sales-extra-title','sales-compare-title',
                'sales-col-free','sales-col-premium','sales-row-quedadas','sales-row-participantes',
                'sales-row-stats','sales-row-comentarios','sales-row-heatmap','sales-row-privadas',
                'sales-row-gps','sales-row-ads','sales-row-matching','sales-row-matching-free','sales-row-matching-premium','sales-price-badge','sales-price-period','sales-price-desc',
                'sales-cta-main','sales-price-cancel','sales-stat-runners','sales-stat-cities',
                'sales-stat-countries','sales-stat-rating','sales-faq-title','sales-faq-q1','sales-faq-a1',
                'sales-faq-q2','sales-faq-a2','sales-faq-q3','sales-faq-a3','sales-faq-q4','sales-faq-a4',
                'sales-final-title','sales-final-subtitle','sales-final-cta'];
            const keyMap = {
                'sales-hero-title':'salesHeroTitle','sales-hero-subtitle':'salesHeroSubtitle',
                'sales-hero-trial':'salesHeroTrial','sales-features-title':'salesFeaturesTitle',
                'sales-f1-title':'salesF1Title','sales-f1-desc':'salesF1Desc',
                'sales-f2-title':'salesF2Title','sales-f2-desc':'salesF2Desc',
                'sales-f3-title':'salesF3Title','sales-f3-desc':'salesF3Desc',
                'sales-f4-title':'salesF4Title','sales-f4-desc':'salesF4Desc',
                'sales-f5-title':'salesF5Title','sales-f5-desc':'salesF5Desc',
                'sales-f6-title':'salesF6Title','sales-f6-desc':'salesF6Desc',
                'sales-f7-title':'salesF7Title','sales-f7-desc':'salesF7Desc',
                'sales-f8-title':'salesF8Title','sales-f8-desc':'salesF8Desc',
                'sales-extra-title':'salesExtraTitle',
                'sales-compare-title':'salesCompareTitle',
                'sales-col-free':'salesColFree','sales-col-premium':'salesColPremium',
                'sales-row-quedadas':'salesRowQuedadas','sales-row-participantes':'salesRowParticipantes',
                'sales-row-stats':'salesRowStats','sales-row-comentarios':'salesRowComentarios',
                'sales-row-heatmap':'salesRowHeatmap','sales-row-privadas':'salesRowPrivadas',
                'sales-row-gps':'salesRowGps','sales-row-ads':'salesRowAds',
                'sales-row-matching':'salesRowMatching','sales-row-matching-free':'salesRowMatchingFree','sales-row-matching-premium':'salesRowMatchingPremium',
                'sales-price-badge':'salesPriceBadge','sales-price-period':'salesPricePeriod',
                'sales-price-desc':'salesPriceDesc','sales-cta-main':'salesCtaMain',
                'sales-price-cancel':'salesPriceCancel',
                'sales-stat-runners':'salesStatRunners','sales-stat-cities':'salesStatCities',
                'sales-stat-countries':'salesStatCountries','sales-stat-rating':'salesStatRating',
                'sales-faq-title':'salesFaqTitle',
                'sales-faq-q1':'salesFaqQ1','sales-faq-a1':'salesFaqA1',
                'sales-faq-q2':'salesFaqQ2','sales-faq-a2':'salesFaqA2',
                'sales-faq-q3':'salesFaqQ3','sales-faq-a3':'salesFaqA3',
                'sales-faq-q4':'salesFaqQ4','sales-faq-a4':'salesFaqA4',
                'sales-final-title':'salesFinalTitle','sales-final-subtitle':'salesFinalSubtitle',
                'sales-final-cta':'salesFinalCta'
            };
            ids.forEach(id => {
                const el = document.getElementById(id);
                const key = keyMap[id];
                if (el && key && t[key]) el.textContent = t[key];
            });
            // Extras pills
            for (let i = 1; i <= 6; i++) {
                const el = document.getElementById('sales-extra-' + i);
                const key = 'salesExtra' + i;
                if (el && t[key]) el.textContent = el.textContent.split(' ')[0] + ' ' + t[key];
            }
            if (typeof gtag === 'function') gtag('event', 'view_premium_sales', { event_category: 'premium' });
        }

        async function openPremiumCheckout() {
            if (!currentUser) {
                showToast('Debes iniciar sesión primero', 'error');
                openModal('modal-register');
                return;
            }

            // En iOS, abrimos ventana primero para evitar bloqueo de popup
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            let paymentWindow = null;
            if (isIOS) {
                paymentWindow = window.open('about:blank', '_blank');
            }

            showToast('Preparando pago seguro...', 'info');
            if (typeof gtag === 'function') gtag('event', 'premium_checkout_started', { event_category: 'premium' });

            try {
                const sb = await getSupabaseClientOrToast(12000, true);
                if (!sb) {
                    if (paymentWindow) paymentWindow.close();
                    return;
                }

                const { data: session } = await sb.auth.getSession();

                if (!session.session?.access_token) {
                    if (paymentWindow) paymentWindow.close();
                    showToast('Sesión expirada. Vuelve a iniciar sesión.', 'error');
                    return;
                }

                const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaWhpd2RidGNiZGF6bWF4ZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTQwNjAsImV4cCI6MjA4NDEzMDA2MH0.C1Zus9DOIDJOGkdPWmMd_ZaSfG0ARVYobv66POrT-QU';
                const response = await fetch('https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/create-checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.session.access_token}`,
                        'apikey': SUPABASE_ANON
                    },
                    body: JSON.stringify({
                        success_url: window.location.origin + '/?premium=success',
                        cancel_url: window.location.origin + '/?premium=canceled'
                    })
                });

                const data = await response.json();
                if(window.__CJ_DEBUG__) console.log('Checkout response:', data);

                if (data.url) {
                    if (isIOS && paymentWindow) {
                        paymentWindow.location.href = data.url;
                    } else {
                        window.location.href = data.url;
                    }
                } else {
                    if (paymentWindow) paymentWindow.close();
                    throw new Error(data.error || 'Error creando sesión de pago');
                }
            } catch (e) {
                CJ.handleApiError(e, 'checkout');
            }
        }

        async function managePremium() {
            // Crear sesión del portal de cliente de Stripe
            try {
                showToast('Abriendo portal de gestión...', 'info');
                const session = await window.supabaseClient.auth.getSession();
                const token = session?.data?.session?.access_token;

                const response = await fetch('https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/create-portal-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        return_url: window.location.origin
                    })
                });

                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || 'Error abriendo portal');
                }
            } catch (e) {
                console.error('Error portal:', e);
                showToast('Error al abrir el portal de gestión: ' + e.message, 'error');
            }
        }

        // Verificar parámetros de URL para premium success/cancel
        function checkPremiumUrlParams() {
            const params = new URLSearchParams(window.location.search);
            if (params.get('premium') === 'success') {
                if (typeof gtag === 'function') gtag('event', 'premium_checkout_success', { event_category: 'premium' });
                showToast('¡Bienvenido a Premium! Disfruta de todas las funciones.', 'success');
                // Limpiar URL
                window.history.replaceState({}, document.title, window.location.pathname);
                // Recargar estado premium
                setTimeout(() => checkPremiumStatus(), 1000);
                // Enviar email de confirmación Premium (fire & forget)
                try {
                    if (currentUser?.email) {
                        fetch('https://waihiwdbtcbdazmaxdor.supabase.co/functions/v1/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'premium_activated',
                                to_email: currentUser.email,
                                to_name: currentUser.nombre || currentUser.email.split('@')[0],
                                lang: currentLang || 'es',
                                data: { user_id: currentUser.id }
                            })
                        }).catch(() => {});
                    }
                } catch(e) { CJ.handleApiError(e, 'premiumActivation', {silent:true}); }
            } else if (params.get('premium') === 'canceled') {
                showToast('Pago cancelado. Puedes intentarlo cuando quieras.', 'info');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            // Unsubscribe desde email → abrir perfil con preferencias
            if (params.get('unsubscribe') === 'email') {
                window.history.replaceState({}, document.title, window.location.pathname);
                setTimeout(() => {
                    if (currentUser) {
                        try { openModal('modal-profile'); } catch(_) {}
                        showToast('Gestiona tus preferencias de email en tu perfil', 'info');
                    } else {
                        showToast('Inicia sesion para gestionar tus preferencias de email', 'info');
                    }
                }, 1500);
            }
        }

        function openSidebar(){if(!currentUser){showToast('Debes registrarte','error');openModal('modal-register');return;}document.getElementById('sidebar-comunidades').classList.add('active');document.getElementById('sidebar-overlay').classList.add('active');sidebarView='communities';renderSidebar();}
        function closeSidebar(){document.getElementById('sidebar-comunidades').classList.remove('active');document.getElementById('sidebar-overlay').classList.remove('active');}
        
        function renderSidebar(){
            const content=document.getElementById('sidebar-content');
            if(sidebarView==='communities'){
                content.innerHTML=`<div class="p-4">${communities.map(c=>`<div onclick="selectCommunity(${c.id})" class="community-item bg-slate-800/50 border border-slate-700 rounded-2xl p-4 mb-3 cursor-pointer"><div class="flex items-center gap-4"><div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style="background:${c.color}20">${c.icon}</div><div class="flex-1"><h3 class="font-bold">${c.name}</h3><div class="text-sm text-gray-500">${c.members} miembros</div></div><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></div></div>`).join('')}</div>`;
            }else if(sidebarView==='topics'){
                const c=communities.find(x=>x.id===selectedCommunity);const topics=forumTopics[selectedCommunity]||[];
                content.innerHTML=`<div class="p-4 border-b border-slate-800"><button onclick="sidebarView='communities';renderSidebar()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-4"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>Volver</button><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style="background:${c.color}20">${c.icon}</div><div><h3 class="font-bold">${c.name}</h3><p class="text-sm text-gray-500">${c.members} miembros</p></div></div></div><div class="p-4 border-b border-slate-800"><button onclick="sidebarView='newTopic';renderSidebar()" class="w-full btn-gradient py-3 rounded-xl font-bold text-sm">Nuevo tema</button></div><div class="p-4">${topics.map(t=>`<div onclick="selectTopic(${t.id})" class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-3 cursor-pointer hover:border-orange-500/30">${t.pinned?'<span class="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold mb-2 inline-block"><svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></span>':''}<h4 class="font-bold mb-2">${t.title}</h4><div class="flex justify-between text-sm text-gray-500"><span>${t.author}</span><span>${t.replies} resp</span></div></div>`).join('')}</div>`;
            }else if(sidebarView==='messages'){
                const topic=(forumTopics[selectedCommunity]||[]).find(t=>t.id===selectedTopic);const messages=forumMessages[selectedTopic]||[];
                content.innerHTML=`<div class="p-4 border-b border-slate-800"><button onclick="sidebarView='topics';renderSidebar()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-3"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>Volver</button><h3 class="font-bold">${topic?.title||'Tema'}</h3></div><div class="flex-1 overflow-y-auto p-4" style="max-height:calc(100vh - 280px)">${messages.map(m=>`<div class="message-bubble mb-4"><div class="flex items-start gap-3"><div class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-xl">${m.avatar}</div><div class="flex-1"><div class="flex items-center gap-2 mb-1"><span class="font-bold text-sm">${m.author}</span><span class="text-xs text-gray-500">${m.time}</span></div><p class="text-gray-300 bg-slate-800 rounded-2xl rounded-tl-none p-3 text-sm">${m.content}</p></div></div></div>`).join('')}</div><div class="p-4 border-t border-slate-800"><div class="flex gap-3"><input type="text" id="new-message" placeholder="Escribe..." class="input-dark flex-1 px-4 py-3 rounded-xl text-sm" aria-label="Escribe..."><button onclick="sendMessage()" class="btn-gradient px-4 py-3 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></button></div></div>`;
            }else if(sidebarView==='newTopic'){
                content.innerHTML=`<div class="p-4 border-b border-slate-800"><button onclick="sidebarView='topics';renderSidebar()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-3"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>Volver</button><h3 class="font-bold">Nuevo tema</h3></div><div class="p-4"><input type="text" id="topic-title" placeholder="Título..." class="input-dark w-full px-4 py-3 rounded-xl mb-4" aria-label="Título..."><textarea id="topic-content" placeholder="Mensaje..." rows="6" class="input-dark w-full px-4 py-3 rounded-xl resize-none mb-4" aria-label="Mensaje..."></textarea><button onclick="createTopic()" class="w-full btn-gradient py-3 rounded-xl font-bold">Publicar</button></div>`;
            }
        }

        // selectCommunity/selectTopic: online-aware versions are defined above.

        // createTopic/sendMessage: online-aware versions are defined above.

        /* ══════════════════════════════════════════════
           C4: RUNNER MATCHING → moved to /js/premium-features.js
           All matching functions (openMatchingScreen, saveMatchingProfile,
           sendMatchRequest, respondMatchRequest, switchMatchingTab)
           are now loaded on-demand via window.* in premium-features.js
           ══════════════════════════════════════════════ */
        /* --- Original code removed (~490 lines) ---
        const MATCHING_DAYS_SHORT = ['L','M','X','J','V','S','D'];
        const MATCHING_HORARIOS = ['manana','mediodia','tarde','noche'];
        const MATCHING_HORARIOS_LABELS_ES = {'manana':'Mañana','mediodia':'Mediodía','tarde':'Tarde','noche':'Noche'};
        const MATCHING_HORARIOS_LABELS_EN = {'manana':'Morning','mediodia':'Midday','tarde':'Afternoon','noche':'Night'};
        const MATCHING_OBJETIVOS_ES = ['mantenimiento','5k','10k','media','maraton','trail','social'];
        const MATCHING_OBJETIVOS_LABELS_ES = {'mantenimiento':'Mantenimiento','5k':'5K','10k':'10K','media':'Media maratón','maraton':'Maratón','trail':'Trail','social':'Social'};
        const MATCHING_OBJETIVOS_LABELS_EN = {'mantenimiento':'Maintenance','5k':'5K','10k':'10K','media':'Half marathon','maraton':'Marathon','trail':'Trail','social':'Social'};

        // Build pace options (3:30 to 8:00, step 0:15)
        function buildPaceOptions(){
          var opts = [];
          for(var m=3; m<=8; m++){
            for(var s=0; s<60; s+=15){
              if(m===8 && s>0) break;
              opts.push(m+':'+(s<10?'0':'')+s);
            }
          }
          return opts;
        }

        // Initialize matching profile modal form
        function initMatchingProfileForm(){
          var minSel = document.getElementById('mp-ritmo-min');
          var maxSel = document.getElementById('mp-ritmo-max');
          if(!minSel || minSel.options.length > 1) return;
          var paces = buildPaceOptions();
          paces.forEach(function(p){
            minSel.add(new Option(p, p));
            maxSel.add(new Option(p, p));
          });
          // Default: 5:00 - 6:00
          minSel.value = '5:00';
          maxSel.value = '6:00';

          // Days chips
          var daysContainer = document.getElementById('mp-dias-chips');
          if(daysContainer && daysContainer.children.length === 0){
            MATCHING_DAYS_ES.forEach(function(d, i){
              var chip = document.createElement('button');
              chip.type = 'button';
              chip.className = 'px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer';
              chip.setAttribute('data-day', d);
              chip.textContent = MATCHING_DAYS_SHORT[i];
              chip.style.cssText = 'background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#94a3b8';
              chip.addEventListener('click', function(){
                var active = this.getAttribute('data-active') === '1';
                if(active){
                  this.setAttribute('data-active','0');
                  this.style.cssText = 'background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#94a3b8';
                } else {
                  this.setAttribute('data-active','1');
                  this.style.cssText = 'background:rgba(249,115,22,.15);border-color:rgba(249,115,22,.4);color:#f97316';
                }
              });
              daysContainer.appendChild(chip);
            });
          }

          // Horario options
          var horarioContainer = document.getElementById('mp-horario-options');
          if(horarioContainer && horarioContainer.children.length === 0){
            var labels = currentLang === 'en' ? MATCHING_HORARIOS_LABELS_EN : MATCHING_HORARIOS_LABELS_ES;
            MATCHING_HORARIOS.forEach(function(h){
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center';
              btn.setAttribute('data-horario', h);
              btn.textContent = labels[h];
              btn.style.cssText = 'background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#94a3b8';
              btn.addEventListener('click', function(){
                horarioContainer.querySelectorAll('button').forEach(function(b){
                  b.style.cssText = 'background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#94a3b8';
                  b.setAttribute('data-active','0');
                });
                this.style.cssText = 'background:rgba(249,115,22,.15);border-color:rgba(249,115,22,.4);color:#f97316';
                this.setAttribute('data-active','1');
              });
              horarioContainer.appendChild(btn);
            });
          }

          // Objetivo dropdown
          var objSel = document.getElementById('mp-objetivo');
          if(objSel && objSel.options.length <= 1){
            objSel.innerHTML = '';
            var objLabels = currentLang === 'en' ? MATCHING_OBJETIVOS_LABELS_EN : MATCHING_OBJETIVOS_LABELS_ES;
            MATCHING_OBJETIVOS_ES.forEach(function(o){
              objSel.add(new Option(objLabels[o], o));
            });
          }

          // Bio character count
          var bioEl = document.getElementById('mp-bio');
          var countEl = document.getElementById('mp-bio-count');
          if(bioEl && countEl){
            bioEl.addEventListener('input', function(){ countEl.textContent = this.value.length; });
          }
        }

        // Load user's existing matching profile into the form
        async function loadMatchingProfileForm(){
          if(!currentUser) return;
          var sb = await getSupabaseClientOrToast(8000, false);
          if(!sb) return;
          var { data } = await sb.from('profiles').select('ritmo_min,ritmo_max,dias_preferidos,horario_preferido,objetivo,bio_matching,matching_visible').eq('id', currentUser.id).single();
          if(!data) return;

          if(data.ritmo_min) document.getElementById('mp-ritmo-min').value = data.ritmo_min;
          if(data.ritmo_max) document.getElementById('mp-ritmo-max').value = data.ritmo_max;

          if(data.dias_preferidos && data.dias_preferidos.length){
            document.querySelectorAll('#mp-dias-chips button').forEach(function(btn){
              if(data.dias_preferidos.indexOf(btn.getAttribute('data-day')) >= 0){
                btn.setAttribute('data-active','1');
                btn.style.cssText = 'background:rgba(249,115,22,.15);border-color:rgba(249,115,22,.4);color:#f97316';
              }
            });
          }

          if(data.horario_preferido){
            var hBtn = document.querySelector('#mp-horario-options button[data-horario="'+data.horario_preferido+'"]');
            if(hBtn){ hBtn.click(); }
          }

          if(data.objetivo) document.getElementById('mp-objetivo').value = data.objetivo;
          if(data.bio_matching){
            document.getElementById('mp-bio').value = data.bio_matching;
            var c = document.getElementById('mp-bio-count');
            if(c) c.textContent = data.bio_matching.length;
          }
          document.getElementById('mp-visible').checked = data.matching_visible !== false;
        }

        // Save matching profile
        window.saveMatchingProfile = async function(){
          if(!currentUser){ showToast('Inicia sesión primero','error'); return; }
          var sb = await getSupabaseClientOrToast(8000);
          if(!sb) return;

          var ritmoMin = document.getElementById('mp-ritmo-min').value;
          var ritmoMax = document.getElementById('mp-ritmo-max').value;
          var dias = [];
          document.querySelectorAll('#mp-dias-chips button[data-active="1"]').forEach(function(b){ dias.push(b.getAttribute('data-day')); });
          var horario = '';
          var activeH = document.querySelector('#mp-horario-options button[data-active="1"]');
          if(activeH) horario = activeH.getAttribute('data-horario');
          var objetivo = document.getElementById('mp-objetivo').value;
          var bio = document.getElementById('mp-bio').value.trim().substring(0,120);
          var visible = document.getElementById('mp-visible').checked;

          var { error } = await sb.from('profiles').update({
            ritmo_min: ritmoMin,
            ritmo_max: ritmoMax,
            dias_preferidos: dias,
            horario_preferido: horario,
            objetivo: objetivo,
            bio_matching: bio,
            matching_visible: visible
          }).eq('id', currentUser.id);

          if(error){
            showToast('Error al guardar: ' + error.message, 'error');
            return;
          }

          closeModal('modal-matching-profile');
          // Reload matching results if the matching screen is open
          if(document.getElementById('modal-matching') && document.getElementById('modal-matching').classList.contains('active')){
            loadMatchingResults();
          }
        };

        // Open matching screen
        window.openMatchingScreen = async function(){
          if(!currentUser){
            openModal('modal-login');
            return;
          }

          initMatchingProfileForm();
          openModal('modal-matching');

          // Update city label
          var cityLabel = document.getElementById('matching-city-label');
          if(cityLabel && currentUser.ciudad){
            cityLabel.innerHTML = '<svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ';
            var _cityText = document.createTextNode(currentUser.ciudad || '');
            cityLabel.appendChild(_cityText);
          }

          // Check if user has a matching profile set up
          var sb = await getSupabaseClientOrToast(8000, false);
          if(!sb) return;
          var { data } = await sb.from('profiles').select('ritmo_min,dias_preferidos').eq('id', currentUser.id).single();

          if(!data || !data.ritmo_min || !data.dias_preferidos || data.dias_preferidos.length === 0){
            // No matching profile → show onboarding
            closeModal('modal-matching');
            loadMatchingProfileForm();
            openModal('modal-matching-profile');
            return;
          }

          loadMatchingResults();
          loadMatchingRequests();
        };

        // Switch tabs in matching screen
        window.switchMatchingTab = function(tab){
          var tabResults = document.getElementById('matching-tab-results');
          var tabRequests = document.getElementById('matching-tab-requests');
          var contentResults = document.getElementById('matching-content-results');
          var contentRequests = document.getElementById('matching-content-requests');

          if(tab === 'results'){
            tabResults.className = 'px-5 py-2 rounded-full text-sm font-bold transition bg-orange-500/20 text-orange-400 border border-orange-500/30';
            tabRequests.className = 'px-5 py-2 rounded-full text-sm font-bold transition bg-slate-800/50 text-gray-400 border border-slate-700/50';
            contentResults.classList.remove('hidden');
            contentRequests.classList.add('hidden');
          } else {
            tabRequests.className = 'px-5 py-2 rounded-full text-sm font-bold transition bg-orange-500/20 text-orange-400 border border-orange-500/30';
            tabResults.className = 'px-5 py-2 rounded-full text-sm font-bold transition bg-slate-800/50 text-gray-400 border border-slate-700/50';
            contentRequests.classList.remove('hidden');
            contentResults.classList.add('hidden');
          }
        };

        // Load compatible runners
        async function loadMatchingResults(){
          var loading = document.getElementById('matching-loading');
          var empty = document.getElementById('matching-empty');
          var cards = document.getElementById('matching-cards');
          var wall = document.getElementById('matching-premium-wall');
          var blurred = document.getElementById('matching-blurred-cards');

          loading.classList.remove('hidden');
          empty.classList.add('hidden');
          cards.classList.add('hidden');
          wall.classList.add('hidden');

          var sb = await getSupabaseClientOrToast(8000, false);
          if(!sb){ loading.classList.add('hidden'); return; }

          var { data, error } = await sb.rpc('find_compatible_runners', { p_limit: 20 });

          loading.classList.add('hidden');

          if(error){
            console.warn('Matching error:', error.message);
            empty.classList.remove('hidden');
            return;
          }

          if(!data || data.length === 0){
            empty.classList.remove('hidden');
            return;
          }

          cards.innerHTML = '';
          blurred.innerHTML = '';

          var isEN = currentLang === 'en';
          var horarioLabels = isEN ? MATCHING_HORARIOS_LABELS_EN : MATCHING_HORARIOS_LABELS_ES;
          var objLabels = isEN ? MATCHING_OBJETIVOS_LABELS_EN : MATCHING_OBJETIVOS_LABELS_ES;

          data.forEach(function(runner, idx){
            var html = buildMatchCard(runner, idx, isEN, horarioLabels, objLabels);

            if(idx === 0){
              // First card — always visible
              cards.innerHTML += html;
            } else if(!isUserPremium){
              // Non-premium: blurred
              blurred.innerHTML += html;
            } else {
              // Premium: all visible
              cards.innerHTML += html;
            }
          });

          cards.classList.remove('hidden');

          if(data.length > 1 && !isUserPremium){
            wall.classList.remove('hidden');
          }
        }

        function buildMatchCard(runner, idx, isEN, horarioLabels, objLabels){
          var photo = runner.photo_url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23334155" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="40">' + (runner.nombre ? runner.nombre.charAt(0).toUpperCase() : '?') + '</text></svg>';
          var name = runner.nombre || (isEN ? 'Runner' : 'Runner');
          var verified = runner.verification_badge ? ' <span title="Verificado" style="color:#22c55e;font-size:.75rem">✓</span>' : '';
          var score = runner.score || 0;
          var scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#94a3b8';

          var ritmo = '';
          if(runner.ritmo_min && runner.ritmo_max){
            ritmo = runner.ritmo_min + '-' + runner.ritmo_max + '/km';
          }

          var dias = '';
          if(runner.dias_preferidos && runner.dias_preferidos.length){
            dias = runner.dias_preferidos.map(function(d){
              var i = MATCHING_DAYS_ES.indexOf(d);
              return i >= 0 ? MATCHING_DAYS_SHORT[i] : d;
            }).join('-');
          }

          var horario = runner.horario_preferido ? (horarioLabels[runner.horario_preferido] || runner.horario_preferido) : '';
          var objetivo = runner.objetivo ? (objLabels[runner.objetivo] || runner.objetivo) : '';
          var nivel = runner.nivel || '';

          var sendLabel = isEN ? 'Send request' : 'Enviar solicitud';

          return '<div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 hover:border-orange-500/25 transition">' +
            '<div class="flex items-start gap-3">' +
              '<img src="' + photo + '" alt="" class="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-slate-700">' +
              '<div class="flex-1 min-w-0">' +
                '<div class="flex items-center justify-between">' +
                  '<h4 class="font-bold text-white text-sm truncate">' + escapeHtml(name) + verified + '</h4>' +
                  '<span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:' + scoreColor + '20;color:' + scoreColor + '">' + score + '%</span>' +
                '</div>' +
                (ritmo ? '<div class="flex items-center gap-1 mt-1"><span class="text-gray-500 text-xs"><svg style="width:12px;height:12px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></span><span class="text-gray-300 text-xs">' + ritmo + '</span>' + (nivel ? '<span class="text-gray-600 text-xs">·</span><span class="text-gray-400 text-xs">' + nivel + '</span>' : '') + '</div>' : '') +
                (dias || horario ? '<div class="flex items-center gap-1 mt-0.5"><span class="text-gray-500 text-xs"><svg style="width:12px;height:12px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></span><span class="text-gray-300 text-xs">' + dias + (horario ? ' ' + horario.toLowerCase() : '') + '</span></div>' : '') +
                (objetivo ? '<div class="flex items-center gap-1 mt-0.5"><span class="text-gray-500 text-xs"><svg style="width:12px;height:12px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg></span><span class="text-gray-400 text-xs">' + objetivo + '</span></div>' : '') +
                (runner.bio_matching ? '<p class="text-gray-500 text-xs mt-1 italic">"' + escapeHtml(runner.bio_matching.substring(0,100)) + '"</p>' : '') +
              '</div>' +
            '</div>' +
            '<div class="mt-3 flex justify-end">' +
              '<button onclick="sendMatchRequest(\'' + runner.user_id + '\')" class="px-4 py-1.5 rounded-lg text-xs font-bold transition ' +
              (isUserPremium || idx === 0 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30' : 'bg-slate-700/50 text-gray-500 border border-slate-700 cursor-not-allowed') + '"' +
              (!isUserPremium && idx > 0 ? ' disabled' : '') + '>' + sendLabel + '</button>' +
            '</div>' +
          '</div>';
        }

        // Send match request
        window.sendMatchRequest = async function(toUserId){
          if(!currentUser){ showToast('Inicia sesión','error'); return; }
          if(!isUserPremium){
            openModal('modal-premium-sales');
            return;
          }
          var sb = await getSupabaseClientOrToast(8000);
          if(!sb) return;

          var { error } = await sb.from('match_requests').insert({
            from_user_id: currentUser.id,
            to_user_id: toUserId,
            status: 'pending'
          });

          if(error){
            if(error.code === '23505'){
              showToast(currentLang === 'en' ? 'Request already sent' : 'Solicitud ya enviada', 'info');
            } else {
              showToast('Error: ' + error.message, 'error');
            }
            return;
          }

          showToast(currentLang === 'en' ? 'Request sent!' : 'Solicitud enviada!', 'success');
          loadMatchingResults();
          loadMatchingRequests();
        };

        // Load match requests (received, sent, accepted)
        async function loadMatchingRequests(){
          if(!currentUser) return;
          var sb = await getSupabaseClientOrToast(8000, false);
          if(!sb) return;

          var isEN = currentLang === 'en';

          // Get all requests involving this user
          var { data: requests } = await sb.from('match_requests')
            .select('id,from_user_id,to_user_id,status,message,created_at')
            .or('from_user_id.eq.' + currentUser.id + ',to_user_id.eq.' + currentUser.id)
            .order('created_at', { ascending: false });

          if(!requests) requests = [];

          var received = requests.filter(function(r){ return r.to_user_id === currentUser.id && r.status === 'pending'; });
          var sent = requests.filter(function(r){ return r.from_user_id === currentUser.id && r.status === 'pending'; });
          var accepted = requests.filter(function(r){ return r.status === 'accepted'; });

          // Get user profiles for all involved users
          var userIds = [];
          requests.forEach(function(r){
            if(r.from_user_id !== currentUser.id && userIds.indexOf(r.from_user_id) < 0) userIds.push(r.from_user_id);
            if(r.to_user_id !== currentUser.id && userIds.indexOf(r.to_user_id) < 0) userIds.push(r.to_user_id);
          });

          var profiles = {};
          if(userIds.length > 0){
            var { data: profs } = await sb.from('profiles').select('id,nombre,photo_url,ciudad,nivel').in('id', userIds);
            if(profs) profs.forEach(function(p){ profiles[p.id] = p; });
          }

          // Render received
          var receivedEl = document.getElementById('matching-received-list');
          var noReceived = document.getElementById('matching-no-received');
          if(received.length === 0){
            receivedEl.innerHTML = '';
            receivedEl.appendChild(noReceived || document.createTextNode(''));
            if(noReceived) noReceived.classList.remove('hidden');
          } else {
            receivedEl.innerHTML = received.map(function(r){
              var p = profiles[r.from_user_id] || {};
              var photo = p.photo_url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23334155" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="40">' + ((p.nombre||'?').charAt(0).toUpperCase()) + '</text></svg>';
              return '<div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">' +
                '<img src="' + photo + '" class="w-10 h-10 rounded-full object-cover border border-slate-700">' +
                '<div class="flex-1"><h4 class="font-bold text-white text-sm">' + escapeHtml(p.nombre || 'Runner') + '</h4>' +
                '<p class="text-gray-500 text-xs">' + escapeHtml(p.ciudad || '') + (p.nivel ? ' · ' + escapeHtml(p.nivel) : '') + '</p></div>' +
                '<div class="flex gap-2">' +
                  '<button onclick="respondMatchRequest(\'' + r.id + '\',\'accepted\')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">' + (isEN ? 'Accept' : 'Aceptar') + '</button>' +
                  '<button onclick="respondMatchRequest(\'' + r.id + '\',\'rejected\')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">' + (isEN ? 'Decline' : 'Rechazar') + '</button>' +
                '</div></div>';
            }).join('');
          }

          // Render sent
          var sentEl = document.getElementById('matching-sent-list');
          var noSent = document.getElementById('matching-no-sent');
          if(sent.length === 0){
            sentEl.innerHTML = '';
            if(noSent){ sentEl.appendChild(noSent); noSent.classList.remove('hidden'); }
          } else {
            sentEl.innerHTML = sent.map(function(r){
              var p = profiles[r.to_user_id] || {};
              var photo = p.photo_url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23334155" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="40">' + ((p.nombre||'?').charAt(0).toUpperCase()) + '</text></svg>';
              return '<div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">' +
                '<img src="' + photo + '" class="w-10 h-10 rounded-full object-cover border border-slate-700">' +
                '<div class="flex-1"><h4 class="font-bold text-white text-sm">' + escapeHtml(p.nombre || 'Runner') + '</h4>' +
                '<p class="text-gray-500 text-xs">' + escapeHtml(p.ciudad || '') + '</p></div>' +
                '<span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">' + (isEN ? 'Pending' : 'Pendiente') + '</span>' +
              '</div>';
            }).join('');
          }

          // Render accepted
          var acceptedEl = document.getElementById('matching-accepted-list');
          var noAccepted = document.getElementById('matching-no-accepted');
          if(accepted.length === 0){
            acceptedEl.innerHTML = '';
            if(noAccepted){ acceptedEl.appendChild(noAccepted); noAccepted.classList.remove('hidden'); }
          } else {
            acceptedEl.innerHTML = accepted.map(function(r){
              var otherId = r.from_user_id === currentUser.id ? r.to_user_id : r.from_user_id;
              var p = profiles[otherId] || {};
              var photo = p.photo_url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23334155" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="40">' + ((p.nombre||'?').charAt(0).toUpperCase()) + '</text></svg>';
              return '<div class="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">' +
                '<img src="' + photo + '" class="w-10 h-10 rounded-full object-cover border-2 border-green-500/30">' +
                '<div class="flex-1"><h4 class="font-bold text-white text-sm">' + escapeHtml(p.nombre || 'Runner') + '</h4>' +
                '<p class="text-gray-500 text-xs">' + escapeHtml(p.ciudad || '') + (p.nivel ? ' · ' + escapeHtml(p.nivel) : '') + '</p></div>' +
                '<span class="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">✓ Match</span>' +
              '</div>';
            }).join('');
          }
        }

        // Respond to a match request (accept/reject)
        window.respondMatchRequest = async function(requestId, status){
          var sb = await getSupabaseClientOrToast(8000);
          if(!sb) return;

          var { error } = await sb.from('match_requests').update({
            status: status,
            updated_at: new Date().toISOString()
          }).eq('id', requestId);

          if(error){
            showToast('Error: ' + error.message, 'error');
            return;
          }

          var isEN = currentLang === 'en';
          if(status === 'accepted'){
            showToast(isEN ? 'Match accepted!' : 'Match aceptado!', 'success');
          } else {
            showToast(isEN ? 'Request declined' : 'Solicitud rechazada', 'info');
          }
          loadMatchingRequests();
        };

        --- End of removed code --- */

        document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.modal.active').forEach(m=>m.classList.remove('active'));closeSidebar();}});
        document.querySelectorAll('.modal').forEach(modal=>{modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('active');});});
        document.addEventListener('DOMContentLoaded',()=>{
            // Cada bloque crítico en su propio try/catch para que un fallo no mate los demás
            try{ buildLocationsIndex(); }catch(e){ console.warn('buildLocationsIndex:', e); }
            try{ loadTheme(); }catch(e){ console.warn('loadTheme:', e); }
            try{ initStarRating(); }catch(e){ console.warn('initStarRating:', e); }
            // Establecer fecha mínima = hoy en campo de crear quedada
            try{
              var fechaEl = document.getElementById('q-fecha');
              if(fechaEl){ var hoy = new Date(); fechaEl.min = hoy.toISOString().split('T')[0]; }
            }catch(e){ console.warn('q-fecha min:', e); }
            try{
              const p=document.getElementById('btnProfileTop');
              if(p) p.addEventListener('click', openProfile);
              const l=document.getElementById('btnLogoutTop');
              if(l) l.addEventListener('click', ()=>{
                const ok = window.confirm(currentLang==='en'?'Log out?':(currentLang==='pt'?'Terminar sessão?':'¿Cerrar sesión?'));
                if(ok) logout();
              });
            }catch(_){ }
            try{ updateMetaTags(currentLang); }catch(e){ console.warn('updateMetaTags:', e); }
            try{ applyLanguageUI(); }catch(e){ console.warn('applyLanguageUI:', e); }
            try{ renderCityChips(); }catch(e){ console.warn('renderCityChips:', e); }
            try{ loadQuedadas(); }catch(e){ console.warn('loadQuedadas:', e); }
            // SEO: Inyectar Event Schema tras cargar quedadas (fallback con delay)
            setTimeout(function(){ try{ injectEventSchema(); }catch(_){} }, 10000);
            try{ loadLandingStats(); }catch(e){ console.warn('loadLandingStats:', e); }
            try{ initLandingEnhancements(); }catch(e){ console.warn('initLandingEnhancements:', e); }
            try{ detectReferralParam(); }catch(e){ console.warn('detectReferralParam:', e); }
            // App mundial: detectar ubicación del usuario automáticamente
            if('geolocation' in navigator){
                navigator.geolocation.getCurrentPosition((pos)=>{
                    userLoc = {lat: pos.coords.latitude, lng: pos.coords.longitude};
                    detectUserCountry(userLoc.lat, userLoc.lng);
                    // Activar filtro "Mi país" por defecto
                    currentFilter = 'country';
                    renderCityChips();
                    renderQuedadas();
                    updateMarkers();
                }, ()=>{}, {enableHighAccuracy:false, timeout:5000, maximumAge:300000});
            }
            // Professional UX: Enter selects top place suggestion and blur tries exact match
            const placeInput = document.getElementById('q-city-search');
            const suggBox = document.getElementById('q-city-suggestions');
            if(placeInput){
                placeInput.addEventListener('keydown', (e)=>{
                    if(e.key === 'Enter'){
                        e.preventDefault();
                        const first = suggBox?.querySelector('.suggest-item');
                        if(first){ first.click(); }
                    }
                });
                placeInput.addEventListener('blur', ()=>{
                    const country = document.getElementById('q-country')?.value || 'ES';
                    const raw = placeInput.value.trim();
                    if(!raw) return;
                    // If user typed an exact place name, resolve it automatically
                    const n = norm(raw);
                    const match = locationsIndex.find(x=>x.country===country && x.n_place===n);
                    if(match){
                        document.getElementById('q-ciudad').value = match.place;
                        document.getElementById('q-admin1').value = match.admin1 || '';
                        placeCenter = {lat: match.lat, lng: match.lng, z: (match.type==='province'||match.type==='district')?9:12};
                        pinCoords = null;
                        if(window.markerCrear && window.mapCrear){ try{ mapCrear.removeLayer(markerCrear);}catch(e){} markerCrear=null; }
                        updateMapCrear(false);
                    }
                });
            }
            // Close callejero suggestions on outside click
            document.addEventListener('click',(ev)=>{
                const box=document.getElementById('q-address-suggestions');
                const input=document.getElementById('q-direccion');
                if(!box||!input) return;
                if(ev.target===input||box.contains(ev.target)) return;
                box.classList.add('hidden');
            });
            // Verificar si venimos de una URL de ciudad
            checkCiudadParam();

            // ========== LAZY-LOAD MÓDULOS NO CRÍTICOS ==========
            // PWA y Deep Linking: cargar siempre, pero diferidos
            var loadDeferred = function() {
                lazyLoadScript('/js/pwa.js');
                lazyLoadScript('/js/deeplink.js');
            };
            if ('requestIdleCallback' in window) {
                requestIdleCallback(loadDeferred);
            } else {
                setTimeout(loadDeferred, 2000);
            }
        });

// ========================= SUPABASE CONNECTION =========================
(function(){
  // Config (proyecto Supabase)
  const SUPABASE_URL = "https://waihiwdbtcbdazmaxdor.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaWhpd2RidGNiZGF6bWF4ZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NTQwNjAsImV4cCI6MjA4NDEzMDA2MH0.C1Zus9DOIDJOGkdPWmMd_ZaSfG0ARVYobv66POrT-QU";

  // Boot promise (otros módulos esperan esto)
  if(!window.__CJ_SUPABASE_READY__){
    window.__CJ_SUPABASE_READY__ = (async () => {
      const sources = [
        {url: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/dist/umd/supabase.min.js", integrity: "sha384-tD6X9wDfTRdKpuPoHFZrVW2RXjSYSWjLBPWXxpHprWWl9eaHlwl05aRjHsiKF97n"},
        {url: "https://unpkg.com/@supabase/supabase-js@2.39.7/dist/umd/supabase.js", integrity: "sha384-a/lNwZPcu6ljtrss4FfZMEv3VEpCASWo3ikRnWnLZWKIO0wgo4sfkNP0aNRzgqAC"}
      ];

      function loadScript(src, integrity){
        return new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src;
          if (integrity) { s.integrity = integrity; s.crossOrigin = 'anonymous'; }
          s.async = true;
          s.onload = () => resolve(true);
          s.onerror = () => reject(new Error("load failed: " + src));
          document.head.appendChild(s);
        });
      }

      async function ensureUmd(){
        if(window.supabase && typeof window.supabase.createClient === "function") return window.supabase;
        let lastErr = null;
        for(const {url, integrity} of sources){
          try{
            await loadScript(url, integrity);
            if(window.supabase && typeof window.supabase.createClient === "function") return window.supabase;
          }catch(e){ lastErr = e; }
        }
        throw lastErr || new Error("Supabase UMD not available");
      }

      // 1) Cargar SDK
      const sdk = await ensureUmd();

      // 2) Crear cliente
      const sb = window.supabaseClient || sdk.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storageKey: 'cj-auth',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // IMPORTANT:
          // PKCE on email recovery links requires a stored code_verifier in the same browser context
          // where the reset was requested. Many users open the email on a different device/browser,
          // which breaks the flow with errors like:
          //   "invalid request: both auth code and code verifier should be non-empty".
          // For a password-reset MVP, "implicit" is far more robust because the email link delivers
          // access_token/refresh_token directly, so updateUser(password) works reliably.
          flowType: 'implicit'
        }
      });
      window.supabaseClient = sb;

      // 3) Hidratar usuario (si hay sesión) y enganchar listener
      async function hydrateUserFromSession(){
        const { data: u } = await sb.auth.getUser();
        const user = u && u.user;
        if(!user){
          window.currentUser = null;
          try{ currentUser = null; }catch(_){}
          return null;
        }

        // Verificar "Recordarme": si no marcó recordar y es una nueva sesión del navegador, cerrar sesión
        // SKIP for OAuth users (Google, Apple, etc.) — they always keep session
        const isOAuthProvider = user.app_metadata?.provider && user.app_metadata.provider !== 'email';
        try {
          if (!isOAuthProvider) {
            const rememberSession = localStorage.getItem('cj_remember_session');
            const tempSession = sessionStorage.getItem('cj_session_temp');
            // Si NO hay "recordar" guardado Y NO hay sesión temporal (nueva pestaña/navegador), cerrar sesión
            if (!rememberSession && !tempSession) {
              // Es una nueva sesión del navegador y el usuario no quiso recordar
              // Pero si nunca inició sesión con el checkbox, asumimos que sí quiere recordar (comportamiento por defecto)
              // Solo cerramos si explícitamente NO marcó recordar (localStorage vacío pero había sesión previa)
              const hadPreviousLogin = localStorage.getItem('cj_had_login');
              if (hadPreviousLogin === '0') {
                // Usuario explícitamente no quiso recordar, cerrar sesión
                await sb.auth.signOut();
                window.currentUser = null;
                try{ currentUser = null; }catch(_){}
                return null;
              }
            }
          }
          // Marcar que ha habido login
          if (!localStorage.getItem('cj_had_login')) {
            localStorage.setItem('cj_had_login', '1');
          }
        } catch(_) {}

        let { data: prof, error: eProf } = await sb
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Si no existe perfil (usuario nuevo de OAuth), crearlo
        if(eProf && eProf.code === 'PGRST116'){
          const meta = user.user_metadata || {};
          const fullName = meta.full_name || meta.name || '';
          const [nombre, ...apellidoArr] = fullName.split(' ');
          const apellidos = apellidoArr.join(' ');

          const { data: newProf, error: createErr } = await sb
            .from('profiles')
            .insert({
              id: user.id,
              nombre: nombre || '',
              apellidos: apellidos || '',
              photo_url: meta.avatar_url || meta.picture || '',
              referral_code: generateReferralCode()
            })
            .select()
            .single();

          if(createErr){
            console.warn('Error creando perfil OAuth:', createErr.message);
          } else {
            prof = newProf;
            // Mostrar modal de completar perfil para usuarios nuevos de Google
            setTimeout(() => {
              try{ openModal('modal-complete-profile'); }catch(_){}
            }, 1000);
          }
        } else if(eProf){
          console.warn('Perfil:', eProf.message);
        } else if(prof && (!prof.nombre || !prof.ciudad)) {
          // Perfil existe pero está incompleto (usuario OAuth que no completó su perfil)
          // Marcar para mostrar modal después
          window.__cjNeedsProfileCompletion = true;
        }

        window.currentUser = {
          id: user.id,
          email: user.email || '',
          nombre: prof && prof.nombre ? String(prof.nombre) : '',
          apellidos: prof && prof.apellidos ? String(prof.apellidos) : '',
          nombreCompleto: (((prof && prof.nombre) ? prof.nombre : '') + ' ' + ((prof && prof.apellidos) ? prof.apellidos : '')).trim(),
          ciudad: prof && prof.ciudad ? String(prof.ciudad) : '',
          pais: prof && prof.pais ? String(prof.pais) : '',
          nivel: prof && prof.nivel ? String(prof.nivel) : null,
          telefono: prof && prof.telefono ? String(prof.telefono) : '',
          whatsapp: !!(prof && prof.whatsapp),
          bio: prof && prof.bio ? String(prof.bio) : '',
          social: (prof && (prof.instagram || prof.strava)) ? String(prof.instagram || prof.strava) : '',
          photo: prof && prof.photo_url ? String(prof.photo_url) : '',
          created_at: prof && prof.created_at ? String(prof.created_at) : null,
          es_seed: !!(prof && prof.es_seed),
          referral_code: prof && prof.referral_code ? String(prof.referral_code) : null,
          referral_count: prof && prof.referral_count ? Number(prof.referral_count) : 0,
          alert_new_quedadas: !!(prof && prof.alert_new_quedadas),
          alert_radius_km: prof && prof.alert_radius_km ? Number(prof.alert_radius_km) : 25,
          premiumUntil: prof && prof.premium_until ? String(prof.premium_until) : null,
          stripe_customer_id: prof && prof.stripe_customer_id ? String(prof.stripe_customer_id) : null
        };

        // Actualizar país del usuario para filtrado de quedadas
        if (prof && prof.pais) {
          // Convertir nombre de país a código
          const paisNombre = String(prof.pais);
          for (const [code, names] of Object.entries(COUNTRY_CODE_MAP || {})) {
            if (names.some(n => n.toLowerCase() === paisNombre.toLowerCase())) {
              userCountry = code;
              break;
            }
          }
        }

        // Sincronizar variable local usada por la app
        try{ currentUser = window.currentUser; }catch(_){}
        try{ updateUserUI(); }catch(_){}
        try{ await checkPremiumStatus(); }catch(e){ console.warn('checkPremiumStatus:', e); }
        try{ checkPremiumUrlParams(); }catch(e){ console.warn('checkPremiumUrlParams:', e); }
        // Mostrar popup premium al cargar sesión existente (después de verificar estado premium)
        try{ maybeShowPremiumPromo(); }catch(e){ console.warn('maybeShowPremiumPromo:', e); }
        return window.currentUser;
      }

      // Detectar si venimos de un enlace de recuperacion de contrasena (Supabase PASSWORD_RECOVERY)
      const __cjHref = String(window.location.href || '');
      const __cjHash = String(window.location.hash || '');
      const __cjSearch = String(window.location.search || '');
      const __cjParams = new URLSearchParams(window.location.search || "");
      // Detectar error de enlace expirado
      if(__cjParams.has("error")){
        const errDesc = __cjParams.get("error_description") || "";
        if(errDesc.includes("expired") || errDesc.includes("denied")){
          setTimeout(function(){
            try{ showToast("El enlace ha expirado. Solicita uno nuevo.", "error"); }catch(_){}
            try{ openModal("modal-forgot"); }catch(_){}
            try{ window.history.replaceState({}, "", window.location.pathname); }catch(_){}
          }, 500);
        }
      }
      // Nota: Supabase suele redirigir con tokens en el hash (#...&type=recovery). Nosotros además usamos ?reset=1 como “bandera”.
      const __cjHasRecoveryType = (__cjHref.includes('type=recovery') || __cjHash.includes('type=recovery') || __cjSearch.includes('type=recovery'));
      const __cjHasAccessToken = (__cjHash.includes('access_token=') || __cjHref.includes('access_token='));
      const __cjHasResetFlag = (__cjSearch.includes('reset=1') || __cjHref.includes('reset=1'));
      // En flujos PKCE modernos, tras /auth/v1/verify Supabase suele redirigir a tu sitio con ?code=... (a veces sin type=recovery ni reset=1).
      const __cjHasCode = (__cjSearch.includes('code=') || new URLSearchParams(window.location.search || '').has('code'));

      // Consideramos "recovery" si:
      // - viene type=recovery (legacy)
      // - viene reset=1 (nuestro flag)
      // - viene un code PKCE CON type=recovery (no solo code, porque Google OAuth también usa code)
      // - viene un access_token con type=recovery en el hash
      const __cjIsRecovery = (
        __cjHasRecoveryType ||
        __cjHasResetFlag ||
        (__cjHasCode && __cjHasRecoveryType) ||
        (__cjHasResetFlag && __cjHasAccessToken) ||
        (__cjHasAccessToken && __cjHash.includes('type=recovery'))
      );

      // Si el enlace de recuperación llega en query (token / token_hash) en lugar de hash (#access_token),
      // intercambiamos el token por una sesión usando verifyOtp.
      async function __cjTryVerifyRecoveryFromQuery(){
        try{
          const sp = new URLSearchParams(window.location.search || '');
          const type = (sp.get('type') || sp.get('action') || '').toLowerCase();
          const token = sp.get('token_hash') || sp.get('token');
          // Si viene como PKCE (?code=...), intercambiamos el code por sesión
          const code = sp.get('code');
          if(code){
            const { data: exData, error: exErr } = await sb.auth.exchangeCodeForSession(code);
            if(exErr){
              console.warn('exchangeCodeForSession:', exErr.message);
              window.__CJ_RECOVERY_LAST_ERROR__ = exErr.message;
            } else {
              if(exData && exData.session){
                // Limpia el code para evitar re-ejecuciones
                try{
                  const u = new URL(window.location.href);
                  u.searchParams.delete('code');
                  window.history.replaceState({}, document.title, u.toString());
                }catch(_){ }
                return true;
              }
            }
          }

          if(!token) return false;
          if(type && type !== 'recovery' && type !== 'password_recovery') return false;

          // Supabase espera token_hash para verifyOtp
          const { data, error } = await sb.auth.verifyOtp({
            type: 'recovery',
            token_hash: token
          });
          if(error){
            console.warn('verifyOtp recovery:', error.message);
            window.__CJ_RECOVERY_LAST_ERROR__ = error.message;
            return false;
          }
          // Si devuelve sesión, ya estamos listos para updateUser(password)
          if(data && data.session){
            // Limpia params para evitar re-ejecuciones
            try{
              const u = new URL(window.location.href);
              u.searchParams.delete('type');
              u.searchParams.delete('token_hash');
              u.searchParams.delete('token');
              window.history.replaceState({}, document.title, u.toString());
            }catch(_){ }
            return true;
          }
          return true;
        }catch(e){
          console.warn('verifyOtp exception:', e && e.message ? e.message : e);
          window.__CJ_RECOVERY_LAST_ERROR__ = (e && e.message) ? e.message : String(e||'error');
          return false;
        }
      }

      // Si Supabase redirige con tokens en el hash (#access_token=...&refresh_token=...&type=recovery)
      // establecemos la sesión manualmente para garantizar updateUser(password).
      async function __cjTrySetSessionFromHash(){
        try{
          const h = (window.location.hash || '').replace(/^#/, '');
          if(!h) return false;
          const hp = new URLSearchParams(h);
          const access_token = hp.get('access_token');
          const refresh_token = hp.get('refresh_token');
          const type = (hp.get('type') || '').toLowerCase();
          if(!access_token || !refresh_token) return false;
          if(type && type !== 'recovery' && type !== 'password_recovery') {
            // Si no es recovery, igualmente podríamos setear sesión, pero aquí lo limitamos.
            return false;
          }
          const { data, error } = await sb.auth.setSession({ access_token, refresh_token });
          if(error){
            console.warn('setSession:', error.message);
            window.__CJ_RECOVERY_LAST_ERROR__ = error.message;
            return false;
          }
          // Limpia hash por higiene
          try{ window.history.replaceState({}, document.title, window.location.pathname + window.location.search); }catch(_){ }
          return !!(data && data.session);
        }catch(e){
          console.warn('setSession exception:', e && e.message ? e.message : e);
          window.__CJ_RECOVERY_LAST_ERROR__ = (e && e.message) ? e.message : String(e||'error');
          return false;
        }
      }

      // Exponer helper global para reintentos desde el botón de actualizar contraseña
      window.__CJ_TRY_RECOVERY__ = async function(){
        let ok = false;
        try{ ok = await __cjTryVerifyRecoveryFromQuery(); }catch(_){ }
        try{ if(!ok) ok = await __cjTrySetSessionFromHash(); }catch(_){ }
        return ok;
      };

      // Auto-login si ya hay sesión
      try{
        const { data } = await sb.auth.getSession();
        if(window.__CJ_DEBUG__) console.log('🔑 getSession result:', { hasSession: !!(data && data.session), isRecovery: __cjIsRecovery });

        // FALLBACK: Si hay #access_token en el hash pero detectSessionInUrl no lo procesó,
        // establecer sesión manualmente (implicit flow OAuth)
        if (!data?.session && !__cjIsRecovery) {
          const hashStr = window.location.hash || '';
          if (hashStr.includes('access_token=')) {
            if(window.__CJ_DEBUG__) console.log('🔑 Implicit flow: hash contiene access_token, intentando setSession manual...');
            try {
              const hp = new URLSearchParams(hashStr.replace(/^#/, ''));
              const at = hp.get('access_token');
              const rt = hp.get('refresh_token');
              if (at && rt) {
                const { data: sessData, error: sessErr } = await sb.auth.setSession({ access_token: at, refresh_token: rt });
                if(window.__CJ_DEBUG__) console.log('🔑 setSession manual result:', { hasSession: !!(sessData && sessData.session), error: sessErr?.message });
                if (!sessErr && sessData?.session) {
                  // Limpiar hash de la URL
                  try { window.history.replaceState({}, document.title, window.location.pathname + window.location.search); } catch(_) {}
                  // Hidratar y mostrar app
                  await hydrateUserFromSession();
                  if(window.__CJ_DEBUG__) console.log('🔑 After manual OAuth hydrate, currentUser:', !!window.currentUser);
                  if (window.currentUser) {
                    try { showApp(); } catch(_) {}
                    try { await loadQuedadas(); } catch(_) {}
                    if (window.__cjNeedsProfileCompletion) {
                      setTimeout(() => { try { openModal('modal-complete-profile'); } catch(_) {} }, 1000);
                      window.__cjNeedsProfileCompletion = false;
                    }
                  }
                } else if (sessErr) {
                  console.warn('🔑 setSession manual error:', sessErr.message);
                }
              }
            } catch(implicitErr) {
              console.warn('🔑 Implicit flow fallback error:', implicitErr);
            }
          }
        }

        // Si venimos del email de recuperación, NO entramos a la app: forzamos modal de nueva contraseña

        // Si venimos desde un email de recuperacion, pero SIN access_token en el hash,
        // intentamos crear la sesion desde la query:
        // - PKCE: ?code=...
        // - token_hash: ?type=recovery&token_hash=...
        if(__cjIsRecovery){
          // 1) Si viene en query (?code=..., token_hash, etc.)
          await __cjTryVerifyRecoveryFromQuery();
          // 2) Si viene en hash (#access_token=...)
          await __cjTrySetSessionFromHash();
        }

        // Si hay un ?code= pero NO es recovery, es OAuth (Google, Apple, etc.)
        // Intercambiamos el código por sesión
        // IMPORTANTE: Ignorar si es código de Strava (tiene scope= en la URL)
        let __cjOAuthSessionEstablished = false;
        const __cjUrlParams = new URLSearchParams(window.location.search || '');
        const __cjIsStravaCallback = __cjUrlParams.get('scope')?.includes('read') || __cjUrlParams.get('scope')?.includes('activity');
        if(window.__CJ_DEBUG__) console.log('OAuthcheck:', { __cjHasCode, __cjIsRecovery, __cjIsStravaCallback, search: window.location.search });
        if(__cjHasCode && !__cjIsRecovery && !__cjIsStravaCallback){
          const sp = new URLSearchParams(window.location.search || '');
          const code = sp.get('code');
          if(window.__CJ_DEBUG__) console.log('OAuthcode found:', code ? code.substring(0,20)+'...' : null);
          if(code){
            try{
              if(window.__CJ_DEBUG__) console.log('Calling exchangeCodeForSession...');
              const { data: oauthData, error: oauthErr } = await sb.auth.exchangeCodeForSession(code);
              if(window.__CJ_DEBUG__) console.log('exchangeCodeForSession result:', { hasData: !!oauthData, hasSession: !!(oauthData && oauthData.session), error: oauthErr });
              if(oauthErr){
                console.warn('OAuth exchangeCodeForSession:', oauthErr.message);
                showToast('Error al iniciar sesión con Google: ' + oauthErr.message, 'error');
              } else if(oauthData && oauthData.session){
                __cjOAuthSessionEstablished = true;
                if(window.__CJ_DEBUG__) console.log('OAuthsession established!');
                // Limpia el code de la URL
                try{
                  const u = new URL(window.location.href);
                  u.searchParams.delete('code');
                  window.history.replaceState({}, document.title, u.toString());
                }catch(_){ }
                // Hidratar usuario y mostrar la app
                await hydrateUserFromSession();
                if(window.__CJ_DEBUG__) console.log('After hydrate, currentUser:', window.currentUser);
                if(window.currentUser){
                  try{ showApp(); }catch(_){ }
                  try{ await loadQuedadas(); }catch(_){ }
                  // Si el perfil está incompleto (OAuth sin completar), mostrar modal
                  if(window.__cjNeedsProfileCompletion){
                    setTimeout(() => {
                      try{ openModal('modal-complete-profile'); }catch(_){}
                    }, 1000);
                    window.__cjNeedsProfileCompletion = false;
                  }
                } else {
                  // Usuario nuevo de OAuth, mostrar modal de completar perfil
                  if(window.__CJ_DEBUG__) console.log('No currentUser after OAuth, may need profile completion');
                }
              }
            }catch(oauthEx){
              console.warn('OAuth exchange exception:', oauthEx);
              showToast('Error en autenticación: ' + (oauthEx.message || oauthEx), 'error');
            }
          }
        }

        // (aunque aún no exista sesión; en ese caso el modal avisará al guardar)
        if(__cjIsRecovery){
          try{ showLanding(); }catch(_){ }
          try{ closeModal('modal-login'); closeModal('modal-register'); closeModal('modal-forgot'); }catch(_){ }
          try{ openModal('modal-reset'); }catch(_){ }
          try{ showToast('Restablece tu contraseña para continuar.','info'); }catch(_){ }
          // No retornamos aqui: dejamos que se registren los listeners de auth (evita casos donde el click no hace nada).
        }

        if(data && data.session){
          if(__cjIsRecovery){
            // Si venimos del email de recuperacion, NO entramos a la app: forzamos modal de nueva contrasena
            try{ showLanding(); }catch(_){ }
            try{ closeModal('modal-login'); closeModal('modal-register'); closeModal('modal-forgot'); }catch(_){ }
            try{ openModal('modal-reset'); }catch(_){ }
            try{ showToast('Restablece tu contraseña para continuar.','info'); }catch(_){ }
            // No retornamos: mantenemos listeners de auth y dejamos que el usuario actualice la contraseña.
          } else {
            await hydrateUserFromSession();
            if(window.currentUser){
              try{ showApp(); }catch(_){ }
              try{ await loadQuedadas(); }catch(_){ }
              // Si el perfil está incompleto, mostrar modal
              if(window.__cjNeedsProfileCompletion){
                setTimeout(() => {
                  try{ openModal('modal-complete-profile'); }catch(_){}
                }, 1000);
                window.__cjNeedsProfileCompletion = false;
              }
              // Deep link: abrir contenido según el hash de la URL
              try{
                var _dlHash = (window.location.hash || '').replace(/^#/, '');
                if(_dlHash){
                  var _dlParts = _dlHash.split('/');
                  if(_dlParts[0] === 'quedada' && _dlParts[1]){
                    setTimeout(function(){ try{ openQuedadaDetail(_dlParts[1]); }catch(_){} }, 600);
                  } else if(_dlParts[0] === 'perfil' && _dlParts[1]){
                    setTimeout(function(){ try{ openUserProfile(_dlParts[1]); }catch(_){} }, 600);
                  } else if(_dlParts[0] === 'ranking'){
                    setTimeout(function(){ try{ openRankingModal(); }catch(_){} }, 600);
                  }
                }
              }catch(_){}
            }
          }
        } else if(!__cjOAuthSessionEstablished) {
          // No hay sesión y no acabamos de establecer una vía OAuth, mostrar landing
          try{ document.getElementById('view-landing').classList.add('active'); }catch(_){ }
          // Guardar deep link para después del login
          try{
            var _dlHashPre = (window.location.hash || '').replace(/^#/, '');
            if(_dlHashPre) sessionStorage.setItem('cj_deep_link', _dlHashPre);
          }catch(_){}
        }
      }catch(e){
        CJ.handleApiError(e, 'sessionCheck', {silent:true});
      }

      // Ocultar splash screen con transición suave
      try{
        const splash = document.getElementById('splash-screen');
        if(splash){
          splash.style.transition = 'opacity 0.3s ease-out';
          splash.style.opacity = '0';
          setTimeout(() => splash.remove(), 300);
        }
      }catch(_){ }

      // Mantener estado si cambia la sesión
      sb.auth.onAuthStateChange(async (event, session) => {
        try{
          // NOTA: Nunca abrir el reset en SIGNED_IN. El reset solo se muestra en PASSWORD_RECOVERY o si la URL lo indica al cargar.
          if(event === 'PASSWORD_RECOVERY') {
            // No entrar en la app; obligar a cambiar la contraseña (solo si NO se ha completado ya en esta pestaña)
            try{ if(sessionStorage.getItem('cj_recovery_done')==='1') return; }catch(_){}
            try{ showLanding(); }catch(_){}
            try{ closeModal('modal-login'); closeModal('modal-register'); closeModal('modal-forgot'); }catch(_){}
            try{ openModal('modal-reset'); }catch(_){}
            try{ showToast('Restablece tu contraseña para continuar.','info'); }catch(_){}
            return;
          }

          if(session){
            await hydrateUserFromSession();
            // Login completado — mostrar app si hay usuario (incluye OAuth returns)
            if(window.currentUser){
              try{ showApp(); }catch(_){ }
              try{ loadQuedadas(); }catch(_){ }
            }
            // Procesar callback de Strava si hay código de Strava en la URL
            const stravaParams = new URLSearchParams(window.location.search || '');
            const stravaScope = stravaParams.get('scope');
            const stravaCode = stravaParams.get('code');
            if(stravaCode && stravaScope && (stravaScope.includes('read') || stravaScope.includes('activity'))) {
              if(window.__CJ_DEBUG__) console.log('Procesando callback de Strava...');
              try {
                await ensureStravaLoaded();
                if(typeof handleStravaCallback === 'function') {
                  await handleStravaCallback();
                }
              } catch(stravaErr) {
                console.warn('Error en Strava callback:', stravaErr);
              }
            }
          } else {
            window.currentUser = null;
            try{ currentUser = null; }catch(_){}
          }
        }catch(e){
          console.warn("Supabase auth change:", e && e.message ? e.message : e);
        }
      });

      // 4) Test conexión suave (no rompe la app si RLS bloquea)
      sb.from('quedadas').select('id', { count: 'exact', head: true })
        .then(({ error }) => {
          if(error) console.warn("Supabase test:", error.message);
        });

      console.log("✅ Supabase listo (SDK + Client + Auth)");
      return true;
    })().catch((e)=>{
      console.warn("⚠️ Supabase init failed:", e && e.message ? e.message : e);
      // No hacemos toast aquí para no molestar en caso de red lenta.
      return false;
    });
  }
})();

