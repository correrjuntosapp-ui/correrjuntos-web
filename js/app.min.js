// CorrerJuntos App — externalized 2026-02-23

        // Lazy-load helper (available to all scopes)
        function lazyLoadScript(src) {
            if (document.querySelector('script[src="'+src+'"]')) return;
            var s = document.createElement('script');
            s.src = src; s.async = true;
            document.head.appendChild(s);
        }

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
                         onclick="selectUbicacionRegistro('${loc.place}', '${loc.admin1}', '${pais}')">
                        <span class="text-2xl">${flag}</span>
                        <div class="flex-1">
                            <div class="font-semibold text-white">${loc.place}</div>
                            <div class="text-xs text-gray-400">${loc.admin1} · ${typeLabel}</div>
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

        // Legacy functions (mantener por compatibilidad)
        function updateCiudadesRegistro() {}
        function updatePoblacionesRegistro() {}
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
            const browserLang = (navigator.language || navigator.userLanguage || 'es').split('-')[0].toLowerCase();
            return supported.includes(browserLang) ? browserLang : 'es';
        }
        let currentLang = detectBrowserLanguage(), map, markers=[], mapCrear, markerCrear;
        // Sincronizar lang del HTML con el idioma detectado
        document.documentElement.lang = currentLang;
        let placeCenter=null; // city/province/district centroid for recentering
        let pinCoords=null;   // exact meetup pin (map click / street selection)
        // Auth + perfiles ahora van por Supabase (Auth + public.profiles). No usamos usersDB/localStorage.
        let currentUser = null; // { id, email, nombre, apellidos, ciudad, nivel, telefono, whatsapp, bio, social, photo }
        let isUserPremium = false; // Estado premium del usuario
        window.isUserPremium = false; // Exponer globalmente para otros scripts
        let currentFilter = 'country', sidebarView='communities', selectedCommunity=null, selectedTopic=null;

        // Stripe config
        const STRIPE_PUBLISHABLE_KEY = 'pk_test_51StW9o2EEAYuDEQfbek6jATX57wFUQfZp6uczhIiPmccgSsKGlWZsg8E4MdmY1n9mTUUmi2QxzoxxFtxDtafblSf00u3inRfwR';
        
        // Quedadas se cargan desde Supabase.
        let quedadas = [];
        const communities = [
  // ESPAÑA (CCAA)
  {id:1,name:"Andalucía Runners",ciudad:"Andalucía",members:312,icon:"🏃",color:"#f97316"},
  {id:2,name:"Aragón Runners",ciudad:"Aragón",members:124,icon:"🏃",color:"#ec4899"},
  {id:3,name:"Asturias Runners",ciudad:"Asturias",members:98,icon:"🏃",color:"#60a5fa"},
  {id:4,name:"Illes Balears Runners",ciudad:"Illes Balears",members:145,icon:"🏃",color:"#a78bfa"},
  {id:5,name:"Canarias Runners",ciudad:"Canarias",members:167,icon:"🏃",color:"#22c55e"},
  {id:6,name:"Cantabria Runners",ciudad:"Cantabria",members:76,icon:"🏃",color:"#f59e0b"},
  {id:7,name:"Castilla-La Mancha Runners",ciudad:"Castilla-La Mancha",members:132,icon:"🏃",color:"#38bdf8"},
  {id:8,name:"Castilla y León Runners",ciudad:"Castilla y León",members:118,icon:"🏃",color:"#34d399"},
  {id:9,name:"Cataluña Running",ciudad:"Cataluña",members:289,icon:"🏃",color:"#f43f5e"},
  {id:10,name:"Comunidad Valenciana Corre",ciudad:"Comunidad Valenciana",members:214,icon:"🏃",color:"#f97316"},
  {id:11,name:"Extremadura Runners",ciudad:"Extremadura",members:64,icon:"🏃",color:"#8b5cf6"},
  {id:12,name:"Galicia Running",ciudad:"Galicia",members:153,icon:"🏃",color:"#22c55e"},
  {id:13,name:"La Rioja Runners",ciudad:"La Rioja",members:41,icon:"🏃",color:"#60a5fa"},
  {id:14,name:"Madrid Runners",ciudad:"Comunidad de Madrid",members:245,icon:"🏃",color:"#ec4899"},
  {id:15,name:"Región de Murcia Runners",ciudad:"Región de Murcia",members:97,icon:"🏃",color:"#f59e0b"},
  {id:16,name:"Navarra Running",ciudad:"Navarra",members:58,icon:"🏃",color:"#38bdf8"},
  {id:17,name:"País Vasco Running",ciudad:"País Vasco",members:133,icon:"🏃",color:"#34d399"},

  // ESPAÑA (Ciudades autónomas)
  {id:18,name:"Ceuta Runners",ciudad:"Ceuta",members:35,icon:"🏃",color:"#a78bfa"},
  {id:19,name:"Melilla Runners",ciudad:"Melilla",members:30,icon:"🏃",color:"#f43f5e"},

  // PORTUGAL
  {id:20,name:"Portugal Runners",ciudad:"Portugal",members:201,icon:"🇵🇹",color:"#22c55e"}
];
        let forumTopics = JSON.parse(localStorage.getItem('forumTopics'))||{1:[{id:1,title:"¿Mejores rutas?",author:"Carlos",replies:5,time:"5min",pinned:true}]};
        let forumMessages = JSON.parse(localStorage.getItem('forumMessages'))||{1:[{id:1,author:"Carlos",avatar:"🧔",content:"Casa de Campo",time:"5min",likes:3}]};

        
        const STORAGE_LANG = 'cj_lang';
        // I18N → cargado desde /data/i18n.js
        function applyLanguageUI(){
            const t = I18N[currentLang] || I18N.es;

            // Create modal place/country labels
            const lblCity=document.getElementById('lbl-city');
            if(lblCity) lblCity.textContent = t.createMeetCityLabel || lblCity.textContent;
            const countrySel=document.getElementById('q-country');
            if(countrySel){
              countrySel.options[0].text = currentLang==='en'?'Spain':(currentLang==='pt'?'Espanha':'España');
              countrySel.options[1].text = 'Portugal';
            }
            const cityInp=document.getElementById('q-city-search');
            if(cityInp) cityInp.placeholder = t.createMeetCityPh || cityInp.placeholder;
            document.documentElement.setAttribute('lang', currentLang);

            const langSel = document.getElementById('lang-select');
            if(langSel && langSel.value !== currentLang) langSel.value = currentLang;

            const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

            setText('nav-login', t.navLogin);
            setText('nav-register', t.navRegister);
            // landing-badge handled below with innerHTML to preserve inner <span>
            setText('landing-subtitle', t.landingSubtitle);
            setText('landing-differentiator', t.landingDifferentiator);
            setText('landing-cta-start', t.landingStart);
            setText('landing-cta-login', t.landingHave);
            setText('app-title', t.appTitle + ' ');
            setText('app-title-highlight', t.appTitleHi);
            setText('app-subtitle', t.appSubtitle);
            setText('map-label', t.mapLabel);
            setText('showing-prefix', t.showingPrefix);
            setText('showing-suffix', t.showingSuffix);
            if (window.__CJ_PWA_SET_TEXT__) { window.__CJ_PWA_SET_TEXT__(t); }

            // Landing page - new hero section
            setText('landing-headline-1', t.landingHeadline1);
            setText('landing-headline-2', t.landingHeadline2);
            setText('landing-trust-text', t.landingTrust);
            setText('landing-cta-secondary', t.landingCtaSecondary);
            // Social proof labels
            setText('stat-label-runners', t.statLabelRunners);
            setText('stat-label-quedadas', t.statLabelQuedadas);
            setText('stat-label-ciudades', t.statLabelCiudades);
            setText('stat-label-proximas', t.statLabelProximas);
            // Newsletter
            setText('newsletter-title', t.newsletterTitle);
            setText('newsletter-subtitle', t.newsletterSubtitle);
            setText('newsletter-btn', t.newsletterBtn);
            setText('newsletter-privacy', t.newsletterPrivacy);
            setText('newsletter-success-msg', t.newsletterSuccess);
            setText('newsletter-error-msg', t.newsletterError);
            // Cities section
            setText('cities-section-title', t.citiesSectionTitle);
            setText('cities-section-subtitle', t.citiesSectionSubtitle);
            setText('cities-view-all', t.citiesViewAll);
            // Benefits
            setText('benefit-1-title', t.benefit1Title);
            setText('benefit-1-desc', t.benefit1Desc);
            setText('benefit-2-title', t.benefit2Title);
            setText('benefit-2-desc', t.benefit2Desc);
            setText('benefit-3-title', t.benefit3Title);
            setText('benefit-3-desc', t.benefit3Desc);
            setText('available-worldwide', t.availableWorldwide);
            // Security section
            setText('security-badge', t.securityBadge);
            setText('security-title', t.securityTitle);
            setText('security-subtitle', t.securitySubtitle);
            setText('security-1-title', t.security1Title);
            setText('security-1-desc', t.security1Desc);
            setText('security-2-title', t.security2Title);
            setText('security-2-desc', t.security2Desc);
            setText('security-3-title', t.security3Title);
            setText('security-3-desc', t.security3Desc);
            setText('security-4-title', t.security4Title);
            setText('security-4-desc', t.security4Desc);
            // Testimonials section
            setText('testimonials-title', t.testimonialsTitle);
            setText('testimonials-subtitle', t.testimonialsSubtitle);
            setText('testimonial-1-text', t.testimonial1Text);
            setText('testimonial-1-name', t.testimonial1Name);
            setText('testimonial-1-location', t.testimonial1Location);
            setText('testimonial-2-text', t.testimonial2Text);
            setText('testimonial-2-name', t.testimonial2Name);
            setText('testimonial-2-location', t.testimonial2Location);
            setText('testimonial-3-text', t.testimonial3Text);
            setText('testimonial-3-name', t.testimonial3Name);
            setText('testimonial-3-location', t.testimonial3Location);
            // Pricing section
            setText('pricing-title', t.pricingTitle);
            setText('pricing-subtitle', t.pricingSubtitle);
            setText('plan-free-title', t.planFreeTitle);
            setText('plan-free-period', t.planFreePeriod);
            setText('plan-free-f1', t.planFreeF1);
            setText('plan-free-f2', t.planFreeF2);
            setText('plan-free-f3', t.planFreeF3);
            setText('plan-free-f4', t.planFreeF4);
            setText('plan-free-f5', t.planFreeF5);
            setText('plan-free-f6', t.planFreeF6);
            setText('plan-free-cta', t.planFreeCta);
            setText('plan-premium-badge', t.planPremiumBadge);
            setText('plan-premium-title', t.planPremiumTitle);
            setText('plan-premium-period', t.planPremiumPeriod);
            setText('plan-premium-f1', t.planPremiumF1);
            setText('plan-premium-f2', t.planPremiumF2);
            setText('plan-premium-f3', t.planPremiumF3);
            setText('plan-premium-f4', t.planPremiumF4);
            setText('plan-premium-f5', t.planPremiumF5);
            setText('plan-premium-f6', t.planPremiumF6);
            setText('plan-premium-f7', t.planPremiumF7);
            setText('strava-badge-title', t.stravaBadgeTitle);
            setText('strava-badge-desc', t.stravaBadgeDesc);
            setText('plan-premium-cta', t.planPremiumCta);
            setText('plan-premium-subcta', t.planPremiumSubcta);
            setText('plan-premium-cancel', t.planPremiumCancel);
            setText('plan-free-subcta', t.planFreeSubcta);
            // Security FAQ
            setText('security-faq-1-q', t.securityFaq1Q);
            setText('security-faq-1-a', t.securityFaq1A);
            setText('security-faq-2-q', t.securityFaq2Q);
            setText('security-faq-2-a', t.securityFaq2A);
            setText('security-faq-3-q', t.securityFaq3Q);
            setText('security-faq-3-a', t.securityFaq3A);
            setText('security-faq-4-q', t.securityFaq4Q);
            setText('security-faq-4-a', t.securityFaq4A);
            // FAQ section
            setText('faq-title', t.faqTitle);
            setText('faq-subtitle', t.faqSubtitle);
            setText('faq-q1', t.faqQ1);
            setText('faq-a1', t.faqA1);
            setText('faq-q2', t.faqQ2);
            setText('faq-a2', t.faqA2);
            setText('faq-q3', t.faqQ3);
            setText('faq-a3', t.faqA3);
            setText('faq-q4', t.faqQ4);
            setText('faq-a4', t.faqA4);
            setText('faq-q5', t.faqQ5);
            setText('faq-a5', t.faqA5);
            // CTA Final
            setText('cta-final-title', t.ctaFinalTitle);
            setText('cta-final-subtitle', t.ctaFinalSubtitle);
            // Footer
            setText('footer-download-title', t.footerDownload);
            setText('footer-legal-title', t.footerLegal);
            setText('footer-terms', t.footerTerms);
            setText('footer-privacy', t.footerPrivacy);
            setText('footer-cookies', t.footerCookies);
            setText('footer-cookie-settings', t.footerCookieSettings || '⚙ Configurar cookies');
            // Cookie banner (CMP granular)
            setText('cookie-banner-text', t.cookieBannerText);
            const cbAccept = document.getElementById('cookie-banner-accept');
            const cbReject = document.getElementById('cookie-banner-reject');
            const cbCustomize = document.getElementById('cookie-banner-customize');
            const cbSave = document.getElementById('cookie-banner-save');
            const cbMore = document.getElementById('cookie-banner-more');
            if(cbAccept) cbAccept.textContent = t.cookieBannerAccept;
            if(cbReject) cbReject.textContent = t.cookieBannerReject;
            if(cbCustomize) cbCustomize.textContent = t.cookieBannerCustomize || 'Personalizar';
            if(cbSave) cbSave.textContent = t.cookieBannerSave || 'Guardar preferencias';
            if(cbMore) cbMore.textContent = t.cookieBannerMore;
            // Cookie category labels
            setText('cookie-cat-necessary', t.cookieCatNecessary || 'Necesarias');
            setText('cookie-cat-necessary-desc', t.cookieCatNecessaryDesc || 'Sesión, idioma y funcionamiento básico. Siempre activas.');
            setText('cookie-cat-analytics', t.cookieCatAnalytics || 'Analíticas');
            setText('cookie-cat-analytics-desc', t.cookieCatAnalyticsDesc || 'Google Analytics: visitas, páginas vistas y navegación.');
            setText('cookie-cat-marketing', t.cookieCatMarketing || 'Marketing');
            setText('cookie-cat-marketing-desc', t.cookieCatMarketingDesc || 'Meta Pixel: medir campañas y audiencias similares.');
            setText('cookie-cat-functional', t.cookieCatFunctional || 'Funcionales');
            setText('cookie-cat-functional-desc', t.cookieCatFunctionalDesc || 'Microsoft Clarity: mapas de calor y grabaciones de sesión.');
            setText('footer-contact-title', t.footerContact);
            setText('footer-advertise', t.footerAdvertise);
            setText('footer-global', t.footerGlobal);
            // Update badge - cities format
            const badgeEl = document.getElementById('landing-badge');
            if(badgeEl) {
                badgeEl.innerHTML = t.landingBadge;
            }

            // Login modal
            const loginTitle = document.querySelector('#modal-login h2');
            if(loginTitle) loginTitle.textContent = t.loginTitle;
            const loginLabels = document.querySelectorAll('#modal-login label');
            if(loginLabels.length>=2){
                loginLabels[0].textContent = t.loginEmail;
                loginLabels[1].textContent = t.loginPass;
            }
            const loginBtn = document.querySelector('#modal-login button[onclick="doLogin()"]');
            if(loginBtn) loginBtn.textContent = t.loginBtn;

            // Register title
            const regTitle = document.querySelector('#modal-register h2');
            if(regTitle) regTitle.textContent = t.registerTitle;
            // Register full fields
            const rt=document.getElementById('reg-title-text'); if(rt) rt.textContent=t.registerTitle;
            const rn=document.getElementById('reg-lbl-name'); if(rn) rn.textContent=t.regLblName||rn.textContent;
            const rln=document.getElementById('reg-lbl-lastname'); if(rln) rln.textContent=t.regLblLast||rln.textContent;
            const ra=document.getElementById('reg-lbl-age'); if(ra) ra.textContent=t.regLblAge||ra.textContent;
            const rAgePh=document.getElementById('reg-age-ph'); if(rAgePh) rAgePh.textContent=t.regAgePh||rAgePh.textContent;
            const rl=document.getElementById('reg-lbl-level'); if(rl) rl.textContent=t.regLblLevel||rl.textContent;
            const rLevelPh=document.getElementById('reg-level-ph'); if(rLevelPh) rLevelPh.textContent=t.regLevelPh||rLevelPh.textContent;
            const rc=document.getElementById('reg-lbl-country'); if(rc) rc.textContent=t.regLblCountry||rc.textContent;
            const rcity=document.getElementById('reg-lbl-city'); if(rcity) rcity.textContent=t.regLblCity||rcity.textContent;
            const rwa=document.getElementById('reg-lbl-wa'); if(rwa) rwa.textContent=t.regLblWA||rwa.textContent;
            const rEmail=document.getElementById('reg-lbl-email'); if(rEmail) rEmail.textContent=t.regLblEmail||rEmail.textContent;
            const rEmail2=document.getElementById('reg-lbl-email2'); if(rEmail2) rEmail2.textContent=t.regLblEmail2||rEmail2.textContent;
            const rPass=document.getElementById('reg-lbl-pass'); if(rPass) rPass.textContent=t.regLblPass||rPass.textContent;
            const rPass2=document.getElementById('reg-lbl-pass2'); if(rPass2) rPass2.textContent=t.regLblPass2||rPass2.textContent;
            const rb=document.getElementById('reg-btn'); if(rb) rb.textContent=t.regBtn||rb.textContent;
            // Placeholders
            document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
              const k=el.getAttribute('data-i18n-ph');
              if(t[k]) el.setAttribute('placeholder', t[k]);
            });
            // Legal lines
            const rLegAge=document.getElementById('reg-legal-age-text'); if(rLegAge) rLegAge.textContent=t.regLegalAge||rLegAge.textContent;
            const rLegTerms=document.getElementById('reg-legal-terms-text'); if(rLegTerms){
              // keep links but update leading text
              const links=rLegTerms.querySelectorAll('a');
              const termTxt=currentLang==='en'?'terms':(currentLang==='pt'?'termos':'términos');
              const privTxt=currentLang==='en'?'privacy':(currentLang==='pt'?'privacidade':'privacidad');
              if(links.length>=2){ links[0].textContent=termTxt; links[1].textContent=privTxt; }
              // update wrapper prefix
              if(currentLang==='en') rLegTerms.childNodes[0].textContent='I accept ';
              else if(currentLang==='pt') rLegTerms.childNodes[0].textContent='Aceito ';
              else rLegTerms.childNodes[0].textContent='Acepto ';
              if(rLegTerms.childNodes.length>2) rLegTerms.childNodes[2].textContent=' y ';
            }
            const rLegWA=document.getElementById('reg-legal-wa-text'); if(rLegWA) rLegWA.textContent=t.regLegalWA||rLegWA.textContent;
            // Level option texts - solo si es un select con options
            const levelSel=document.getElementById('reg-nivel');
            if(levelSel && levelSel.tagName === 'SELECT' && levelSel.options && Array.isArray(t.regLevelOpts)){
              try {
                const opts = Array.from(levelSel.options);
                if(opts.length>=1){
                  // keep placeholder at index 0
                  for(let i=1;i<opts.length && i<=t.regLevelOpts.length;i++){ opts[i].textContent=t.regLevelOpts[i-1]; }
                }
              } catch(e) { console.warn('Error updating level options:', e); }
            }


            // Crear quedada title/subtitle
            const crearTitle = document.querySelector('#modal-crear h2');
            if(crearTitle) crearTitle.textContent = t.createMeetTitle;
            const crearSub = document.querySelector('#modal-crear p');
            if(crearSub) crearSub.textContent = t.createMeetSubtitle;

            // ===== NUEVAS TRADUCCIONES =====

            // Filtros principales
            setText('filter-title', t.filterTitle);
            setText('filter-schedule-label', t.filterSchedule);
            setText('filter-morning', t.filterMorning);
            setText('filter-afternoon', t.filterAfternoon);
            setText('filter-night', t.filterNight);
            setText('filter-level-label', t.filterLevel);
            setText('filter-beginner', t.filterBeginner);
            setText('filter-intermediate', t.filterIntermediate);
            setText('filter-advanced', t.filterAdvanced);
            setText('filter-elite', t.filterElite);
            setText('filter-premium-text', t.filterPremium);
            setText('filter-unlock-btn', t.filterUnlock);

            // Modal crear quedada - campos
            setText('create-basic-info', t.createBasicInfo);
            setText('create-meeting-point', t.createMeetingPoint);
            setText('create-title-label', t.createTitleLabel);
            setText('create-drag-hint', t.createDragMap);
            setText('create-cancel-btn', t.createCancel);
            setText('create-publish-btn', t.createPublish);
            const createTitleInput = document.getElementById('q-titulo');
            if(createTitleInput) createTitleInput.placeholder = t.createTitlePh || createTitleInput.placeholder;
            const createSearchInput = document.getElementById('q-buscar-lugar');
            if(createSearchInput) createSearchInput.placeholder = t.createSearchPlace || createSearchInput.placeholder;

            // Ranking
            setText('ranking-title', t.rankingTitle);
            setText('ranking-subtitle', t.rankingSubtitle);

            // Perfil
            setText('profile-title', t.profileTitle);
            setText('profile-subtitle', t.profileSubtitle);
            setText('profile-name-label', t.profileName);
            setText('profile-lastname-label', t.profileLastName);
            setText('profile-country-label', t.profileCountry);
            setText('profile-city-label', t.profileCity);
            setText('profile-level-label', t.profileLevel);
            setText('profile-verify-btn', t.profileVerify);
            setText('profile-whatsapp-label', t.profileWhatsApp);
            setText('profile-whatsapp-alerts', t.profileWhatsAppAlerts);
            setText('profile-social-label', t.profileSocial);
            setText('profile-social-hint', t.profileSocialHint);
            setText('profile-bio-label', t.profileBio);
            setText('profile-bio-hint', t.profileBioHint);
            setText('profile-change-photo', t.profileChangePhoto);
            setText('profile-save-btn', t.profileSave);

            // Alert preferences
            setText('alert-toggle-label', t.alertToggleLabel);
            setText('alert-toggle-desc', t.alertToggleDesc);
            setText('alert-radius-label', t.alertRadiusLabel);

            // Logros
            setText('achievements-title', t.achievementsTitle);
            setText('achievements-subtitle', t.achievementsSubtitle);

            // Header usuario logueado
            setText('header-hello', t.hello);
            setText('header-profile', t.myProfile);
            setText('header-logout', t.logout);
            setText('header-create-desktop', t.createRun);
            setText('header-create-mobile', t.createRun);

            // Stats y bienvenida
            setText('label-following', t.following);
            setText('label-followers', t.followers);
            setText('label-total-runs', t.totalRuns);
            setText('label-km-run', t.kmRun);
            setText('label-runners-known', t.runnersKnown);
            setText('label-upcoming', t.upcomingRuns);
            setText('btn-ranking', 'Ranking');
            setText('btn-achievements', t.achievementsTab || 'Achievements');

            // Mi Progreso
            setText('progress-title', t.myProgress);
            setText('label-points', t.points);
            setText('label-created', t.created);
            setText('label-attended', t.attended);
            setText('label-badges', t.badges);
            setText('badges-empty-text', t.completeBadges);
            setText('btn-view-ranking', t.viewRanking);

            // Mis Quedadas
            setText('my-runs-title', t.myRuns);
            setText('btn-refresh', t.refresh);
            setText('tab-upcoming', t.upcoming);
            setText('tab-completed', t.completed);

            // Ranking modal
            setText('ranking-title', t.weeklyRanking || t.rankingTitle);
            setText('ranking-subtitle', t.top10 || t.rankingSubtitle);
            setText('ranking-position-label', t.yourPosition);

            // Modal detalle quedada
            setText('detail-label-meeting', t.detailMeetingPoint);
            setText('detail-label-level', t.detailLevelRequired);
            setText('detail-label-desc', t.detailDescription);
            setText('detail-label-rating', t.detailRating);
            setText('detail-label-organizer', t.detailOrganizer);
            setText('detail-label-participants', t.detailParticipants);
            setText('detail-btn-rate', t.detailRate);
            setText('detail-btn-share', t.detailShare);
            setText('detail-btn-close', t.detailClose);

            // App Store badges (landing)
            setText('app-available-text', t.appAvailableOn);
            setText('app-download-ios', t.appDownloadOn);
            setText('app-download-android', t.appGetItOn);
            // In-app badges: iOS available, Android coming soon
            setText('app-download-ios-2', t.appDownloadOn || 'Descargar en');
            setText('app-download-android-2', t.appAndroidComingSoon || 'Marzo 2026');

            // Actualizar panel de stats (para traducir bienvenida)
            if (typeof updateStatsUI === 'function') updateStatsUI();

            // Premium stats locked section
            setText('premium-stats-title', t.detailedStats);
            setText('premium-stats-desc', t.statsDesc);
            setText('premium-unlock-btn', t.unlockPremium);

            // Premium upgrade section in profile
            setText('premium-unlock-all', t.premiumUnlockAll);
            setText('premium-feat-1', t.premiumAdvancedStats);
            setText('premium-feat-2', t.premiumUnlimitedRuns);
            setText('premium-feat-3', t.premiumExclusiveBadges);
            setText('premium-feat-4', t.premiumBadgeProfile);
            setText('premium-feat-5', t.premiumStravaIntegration);
            setText('premium-feat-6', t.premiumPaceHistory);
            setText('premium-feat-7', t.premiumBadgesStrava);
            setText('premium-get-btn', t.premiumGetBtn);
            setText('premium-cancel-text', t.premiumCancelAnytime);
            setText('premium-you-are', t.premiumYouAre);
            setText('premium-manage-btn', t.premiumManage);

            // Notifications section
            setText('notif-push-title', t.notifPush);
            setText('notif-on-device', t.notifOnDevice);
            setText('notif-which-receive', t.notifWhichReceive);
            setText('notif-pref-24h', t.notifReminder24h);
            setText('notif-pref-1h', t.notifReminder1h);
            setText('notif-pref-joins', t.notifSomeoneJoins);
            setText('notif-pref-new-city', t.notifNewRunCity);
            setText('notif-pref-cancelled', t.notifRunCancelled);

            // Danger zone
            setText('danger-zone-title', t.dangerZone);
            setText('danger-zone-desc', t.dangerZoneDesc);
            setText('delete-account-btn', t.deleteAccount);
            setText('profile-close-btn', t.closeBtn);

            // Premium promo popup
            setText('promo-title', t.promoTitle);
            setText('promo-subtitle', t.promoSubtitle);
            setText('promo-feat-1', t.promoFeat1);
            setText('promo-feat-2', t.promoFeat2);
            setText('promo-feat-3', t.promoFeat3);
            setText('promo-feat-4', t.promoFeat4);
            setText('promo-feat-5', t.promoFeat5);
            setText('promo-per-month', t.promoPerMonth);
            setText('promo-cancel', t.promoCancel);
            setText('promo-cta-btn', t.promoCtaBtn);
            setText('promo-later-btn', t.promoLaterBtn);

            // Limit reached modal
            setText('limit-title', t.limitTitle);
            setText('limit-subtitle', t.limitSubtitle);
            setText('limit-subtitle-2', t.limitSubtitle2);
            setText('limit-desc', t.limitDesc);
            setText('limit-desc-bold', t.limitDescBold);
            setText('limit-desc-2', t.limitDesc2);
            setText('limit-feat-1', t.limitFeat1);
            setText('limit-feat-2', t.limitFeat2);
            setText('limit-feat-3', t.limitFeat3);
            setText('limit-feat-4', t.limitFeat4);
            setText('limit-per-month', t.limitPerMonth);
            setText('limit-cta-btn', t.limitCtaBtn);
            setText('limit-later-btn', t.limitLaterBtn);

            // Landing enhancements i18n
            setText('feed-title', t.feedTitle);
            setText('map-preview-title', t.mapPreviewTitle);
            setText('map-preview-subtitle', t.mapPreviewSubtitle);
            setText('map-preview-cta', t.mapPreviewCta);
            setText('mockups-title', t.mockupsTitle);
            setText('mockups-subtitle', t.mockupsSubtitle);
            // Quedadas preview i18n
            setText('preview-badge', t.previewBadge);
            setText('preview-title', t.previewTitle);
            setText('preview-subtitle', t.previewSubtitle);
            setText('preview-cta', t.previewCta);
            setText('qp-modal-cta', t.previewModalCta);
            setText('apps-coming-badge', t.appsComingBadge);
            setText('apps-coming-text', t.appsComingText);
            setText('hero-ios-label', t.appDownloadOn || 'Descargar en');
            setText('hero-android-label', t.appAndroidComingSoon || 'Marzo 2026');
            setText('social-follow-title', t.socialFollowTitle);
            setText('social-follow-subtitle', t.socialFollowSubtitle);
            setText('social-share-btn', t.socialShareBtn);
            setText('share-banner-text', t.shareBannerText);
            setText('share-banner-btn', t.shareBannerBtn);
            // Referral banner
            setText('banner-referral-title', t.bannerReferralTitle);
            setText('banner-referral-desc', t.bannerReferralDesc);
            setText('banner-referral-btn', t.bannerReferralBtn);
            // Reload preview cards with new language
            if (typeof loadQuedadasPreview === 'function') loadQuedadasPreview();

            // City chips
            renderCityChips();
        }

        // ========== DYNAMIC META TAGS FOR SEO ==========
        // META_I18N → cargado desde /data/i18n.js
        function updateMetaTags(lang) {
            const m = META_I18N[lang] || META_I18N.es;
            document.title = m.title;
            document.documentElement.setAttribute('lang', lang);
            const setMeta = (sel, val) => { const el = document.querySelector(sel); if(el) el.setAttribute('content', val); };
            setMeta('meta[name="description"]', m.description);
            setMeta('meta[name="keywords"]', m.keywords);
            setMeta('meta[property="og:title"]', m.ogTitle);
            setMeta('meta[property="og:description"]', m.ogDesc);
            setMeta('meta[property="og:locale"]', m.ogLocale);
            setMeta('meta[name="twitter:title"]', m.ogTitle);
            setMeta('meta[name="twitter:description"]', m.ogDesc);
        }

        function changeLanguage(lang){
            const supported = ['es','en','pt','ru'];
            currentLang = supported.includes(lang) ? lang : 'es';
            localStorage.setItem(STORAGE_LANG, currentLang);
            // Actualizar lang del documento HTML
            document.documentElement.lang = currentLang;
            if (!I18N[currentLang]) {
                // Cargar idioma bajo demanda
                const s = document.createElement('script');
                s.src = '/data/i18n-' + currentLang + '.js';
                s.onload = function() { updateMetaTags(currentLang); applyLanguageUI(); };
                s.onerror = function() { currentLang = 'es'; document.documentElement.lang = 'es'; updateMetaTags('es'); applyLanguageUI(); };
                document.head.appendChild(s);
            } else {
                updateMetaTags(currentLang);
                applyLanguageUI();
            }
        }

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

        // ========== TOAST MEJORADO (Material Design) ==========
        function showToast(msg, type = 'success', duration = 4000) {
            // Crear contenedor si no existe
            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            // Iconos mejorados por tipo
            const icons = {
                success: '✅',
                error: '❌',
                info: 'ℹ️',
                warning: '⚠️'
            };

            // Crear el toast
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${icons[type] || '✅'}</span>
                <span class="toast-message">${msg}</span>
                <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
            `;

            // Añadir al contenedor
            container.appendChild(toast);

            // Auto-dismiss
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }, duration);

            // También actualizar el toast antiguo por compatibilidad
            const oldToast = document.getElementById('toast');
            const oldContent = document.getElementById('toast-content');
            if (oldToast && oldContent) {
                const colors = {success:'bg-green-500',error:'bg-red-500',info:'bg-blue-500',warning:'bg-yellow-500'};
                const bg = colors[type] || 'bg-green-500';
                oldContent.className = `px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 ${bg} text-white`;
                oldContent.innerHTML = `${icons[type] || '✅'} ${msg}`;
                oldToast.classList.remove('hidden');
                setTimeout(() => oldToast.classList.add('hidden'), duration);
            }
        }

        // ========== SKELETON LOADERS ==========
        function showSkeletons(containerId, count = 3) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = Array(count).fill(0).map(() => `
                <div class="skeleton skeleton-card p-6 rounded-3xl">
                    <div class="flex justify-between mb-4">
                        <div class="skeleton skeleton-text" style="width:120px;"></div>
                        <div class="skeleton skeleton-text" style="width:60px;"></div>
                    </div>
                    <div class="skeleton skeleton-text" style="width:80%;"></div>
                    <div class="skeleton skeleton-text-sm" style="width:50%;"></div>
                    <div class="flex gap-2 mt-4">
                        <div class="skeleton skeleton-avatar"></div>
                        <div class="skeleton skeleton-avatar"></div>
                    </div>
                </div>
            `).join('');
        }

        // ========== CONFETTI CELEBRATION ==========
        function showConfetti() {
            const container = document.createElement('div');
            container.className = 'confetti-container';
            document.body.appendChild(container);

            const colors = ['#f97316', '#ea580c', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#facc15'];
            const shapes = ['square', 'circle'];

            for (let i = 0; i < 80; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
                if (shapes[Math.floor(Math.random() * shapes.length)] === 'circle') {
                    confetti.style.borderRadius = '50%';
                }
                container.appendChild(confetti);
            }

            setTimeout(() => container.remove(), 4000);
        }

        // ========== LIGHT/DARK MODE ==========
        function toggleTheme() {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            const iconEmoji = isLight ? '🌙' : '☀️';
            const icon = document.getElementById('theme-icon');
            const iconLanding = document.getElementById('theme-icon-landing');
            if (icon) icon.textContent = iconEmoji;
            if (iconLanding) iconLanding.textContent = iconEmoji;
            // Actualizar aria-pressed: true = modo oscuro activo, false = modo claro
            var darkActive = isLight ? 'false' : 'true';
            document.querySelectorAll('[id^="theme-toggle-"]').forEach(function(btn){
                btn.setAttribute('aria-pressed', darkActive);
                btn.setAttribute('aria-label', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
            });
            // Actualizar tiles del mapa al cambiar tema
            if (typeof updateMapTiles === 'function') updateMapTiles();
        }
        function loadTheme() {
            const saved = localStorage.getItem('theme');
            if (saved === 'light') document.body.classList.add('light-mode');
            const isLight = saved === 'light';
            const iconEmoji = isLight ? '🌙' : '☀️';
            const icon = document.getElementById('theme-icon');
            const iconLanding = document.getElementById('theme-icon-landing');
            if (icon) icon.textContent = iconEmoji;
            if (iconLanding) iconLanding.textContent = iconEmoji;
            // Inicializar aria-pressed: true = modo oscuro activo
            var darkActive = isLight ? 'false' : 'true';
            document.querySelectorAll('[id^="theme-toggle-"]').forEach(function(btn){
                btn.setAttribute('aria-pressed', darkActive);
                btn.setAttribute('aria-label', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
            });
        }

        // ========== PREMIUM: ESTADÍSTICAS Y BADGES ==========
        // Badges normales (disponibles para todos)
        const BADGES_CONFIG = [
            // 🌟 BADGES BÁSICOS (fáciles de conseguir para nuevos usuarios)
            { id: 'first_run', name: 'Primera Carrera', desc: 'Únete a tu primera quedada', icon: '🏃', condition: s => s.quedadas >= 1, premium: false },
            { id: 'first_5k', name: 'First 5K', desc: 'Completa una quedada de 5+ km', icon: '🎯', condition: s => s.first5k === true, premium: false },
            { id: 'streak_2', name: 'En Racha', desc: '2 semanas seguidas corriendo', icon: '⚡', condition: s => s.racha >= 2, premium: false },
            { id: 'run_3', name: 'Triplete', desc: 'Asiste a 3 quedadas', icon: '🥉', condition: s => s.quedadas >= 3, premium: false },
            { id: 'social_3', name: 'Conociendo Gente', desc: 'Corre con 3 runners diferentes', icon: '🤝', condition: s => s.runners >= 3, premium: false },
            // 🏅 BADGES INTERMEDIOS
            { id: 'run_5', name: 'Habitual', desc: 'Asiste a 5 quedadas', icon: '🥈', condition: s => s.quedadas >= 5, premium: false },
            { id: 'social_5', name: 'Social Runner', desc: 'Conoce a 5 runners diferentes', icon: '👥', condition: s => s.runners >= 5, premium: false },
            { id: 'creator', name: 'Líder', desc: 'Crea tu primera quedada', icon: '👑', condition: s => s.created >= 1, premium: false },
            { id: 'km_25', name: 'Maratonista', desc: 'Acumula 25 km en quedadas', icon: '🏁', condition: s => s.km >= 25, premium: false },
            { id: 'streak_4', name: 'Constancia', desc: 'Racha de 4 semanas corriendo', icon: '🔥', condition: s => s.racha >= 4, premium: false },
            // 🏆 BADGES AVANZADOS
            { id: 'run_10', name: 'Veterano', desc: 'Asiste a 10 quedadas', icon: '🎖️', condition: s => s.quedadas >= 10, premium: false },
            { id: 'km_50', name: '50K Club', desc: 'Acumula 50 km en quedadas', icon: '📏', condition: s => s.km >= 50, premium: false },
            { id: 'km_100', name: 'Centenario', desc: 'Acumula 100 km en quedadas', icon: '💯', condition: s => s.km >= 100, premium: false },
            { id: 'run_25', name: 'Leyenda', desc: 'Asiste a 25 quedadas', icon: '🏆', condition: s => s.quedadas >= 25, premium: false },
            // ⭐ BADGES EXCLUSIVOS PREMIUM
            { id: 'premium_vip', name: 'VIP Runner', desc: 'Eres miembro Premium', icon: '⭐', condition: () => isUserPremium, premium: true, exclusive: true },
            { id: 'premium_elite', name: 'Elite Dorado', desc: 'Premium + 50 quedadas', icon: '🥇', condition: s => isUserPremium && s.quedadas >= 50, premium: true, exclusive: true },
            { id: 'premium_champion', name: 'Campeón Premium', desc: 'Premium + 200 km', icon: '🏅', condition: s => isUserPremium && s.km >= 200, premium: true, exclusive: true },
            { id: 'premium_influencer', name: 'Influencer', desc: 'Premium + 10 quedadas creadas', icon: '📣', condition: s => isUserPremium && s.created >= 10, premium: true, exclusive: true },
            { id: 'premium_legend', name: 'Leyenda Dorada', desc: 'Premium + 100 quedadas', icon: '👑', condition: s => isUserPremium && s.quedadas >= 100, premium: true, exclusive: true },
            // 🎁 BADGES DE REFERIDOS
            { id: 'referral_community_builder', name: 'Community Builder', desc: 'Invita a 3 amigos a CorrerJuntos', icon: '🤝', condition: () => (currentUser?.referral_count || 0) >= 3, premium: false },
            { id: 'referral_premium_reward', name: 'Super Recruiter', desc: 'Invita a 5 amigos y gana 1 mes Premium', icon: '⭐', condition: () => (currentUser?.referral_count || 0) >= 5, premium: false },
            { id: 'referral_ambassador', name: 'Ambassador', desc: 'Invita a 10 amigos y conviértete en embajador', icon: '🏆', condition: () => (currentUser?.referral_count || 0) >= 10, premium: false },
        ];

        let userStats = { quedadas: 0, km: 0, runners: 0, racha: 0, created: 0, first5k: false, weeklyActivity: [0,0,0,0,0,0,0,0] };

        async function loadUserStats() {
            if (!currentUser) return;
            if (!window.supabaseClient) return;
            try {
                // Contar quedadas donde el usuario participó
                const { data: participaciones } = await window.supabaseClient
                    .from('participantes')
                    .select('quedada_id, quedadas(distancia, fecha, creador_id)')
                    .eq('user_id', currentUser.id);

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

        // ========== ENHANCED PREMIUM STATS ==========
        async function loadEnhancedStats() {
            if (!isUserPremium || !currentUser) return;
            try {
                const sb = await getSupabaseClientOrToast(5000, false);
                if (!sb) return;

                const { data: participaciones } = await sb
                    .from('participantes')
                    .select('ritmo_real, distancia_real, completed_at, quedada_id, quedadas(ciudad, fecha)')
                    .eq('user_id', currentUser.id)
                    .not('completed_at', 'is', null);

                if (!participaciones || !participaciones.length) return;

                // Mejor ritmo (parsear "X:XX min/km" → minutos decimales)
                const paces = participaciones
                    .filter(p => p.ritmo_real)
                    .map(p => {
                        const m = p.ritmo_real.match(/(\d+):(\d+)/);
                        return m ? parseInt(m[1]) + parseInt(m[2])/60 : 0;
                    })
                    .filter(v => v > 0);
                const bestPace = paces.length ? Math.min(...paces) : null;

                // Mayor distancia
                const distances = participaciones.filter(p => p.distancia_real).map(p => parseFloat(p.distancia_real));
                const longest = distances.length ? Math.max(...distances) : null;

                // Ciudad favorita
                const cityCount = {};
                participaciones.forEach(p => {
                    const c = p.quedadas?.ciudad;
                    if (c) cityCount[c] = (cityCount[c] || 0) + 1;
                });
                const citySorted = Object.entries(cityCount).sort((a, b) => b[1] - a[1]);
                const favCity = citySorted.length ? citySorted[0][0] : null;

                // Comparativa mensual
                const now = new Date();
                const thisMonthNum = now.getMonth();
                const lastMonthNum = (thisMonthNum - 1 + 12) % 12;
                const thisYear = now.getFullYear();

                const thisMonth = participaciones.filter(p => {
                    const d = new Date(p.completed_at);
                    return d.getMonth() === thisMonthNum && d.getFullYear() === thisYear;
                });
                const lastMonth = participaciones.filter(p => {
                    const d = new Date(p.completed_at);
                    return d.getMonth() === lastMonthNum;
                });

                // Render stats
                const statBestPace = document.getElementById('stat-best-pace');
                const statLongest = document.getElementById('stat-longest');
                const statFavCity = document.getElementById('stat-fav-city');

                if (statBestPace && bestPace) {
                    const mins = Math.floor(bestPace);
                    const secs = Math.round((bestPace - mins) * 60);
                    statBestPace.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
                if (statLongest && longest) statLongest.textContent = longest.toFixed(1) + ' km';
                if (statFavCity && favCity) statFavCity.textContent = favCity;

                // Comparativa mensual
                const comp = document.getElementById('stat-monthly-comparison');
                if (comp) {
                    const thisKm = thisMonth.reduce((s, p) => s + (parseFloat(p.distancia_real) || 0), 0);
                    const lastKm = lastMonth.reduce((s, p) => s + (parseFloat(p.distancia_real) || 0), 0);
                    const qArrow = thisMonth.length >= lastMonth.length ? '↑' : '↓';
                    const qColor = thisMonth.length >= lastMonth.length ? 'text-green-400' : 'text-red-400';
                    const kmArrow = thisKm >= lastKm ? '↑' : '↓';
                    const kmColor = thisKm >= lastKm ? 'text-green-400' : 'text-red-400';

                    comp.innerHTML = `
                        <div>
                            <div class="text-lg font-bold text-white">${thisMonth.length}</div>
                            <div class="text-[10px] text-gray-500">Quedadas</div>
                            <div class="text-xs ${qColor}">${qArrow} vs ${lastMonth.length}</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-white">${thisKm.toFixed(1)}</div>
                            <div class="text-[10px] text-gray-500">Km</div>
                            <div class="text-xs ${kmColor}">${kmArrow} vs ${lastKm.toFixed(1)}</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-white">${bestPace ? `${Math.floor(bestPace)}:${Math.round((bestPace - Math.floor(bestPace)) * 60).toString().padStart(2, '0')}` : '--'}</div>
                            <div class="text-[10px] text-gray-500">Mejor ritmo</div>
                        </div>`;
                }
            } catch (e) {
                console.warn('Enhanced stats error:', e);
            }
        }

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
                    .eq('user_id', currentUser.id);

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
        async function loadQuedadaComments(quedadaId) {
            const list = document.getElementById('detail-comments-list');
            const countEl = document.getElementById('detail-comments-count');
            const inputWrap = document.getElementById('detail-comment-input-wrap');
            if (!list) return;

            const t = I18N[currentLang] || I18N.es;

            try {
                const sb = await getSupabaseClientOrToast(5000, false);
                if (!sb) { list.innerHTML = ''; return; }

                const { data: comments, error } = await sb
                    .from('quedada_comments')
                    .select('id, texto, created_at, user_id, profiles(nombre, photo_url)')
                    .eq('quedada_id', quedadaId)
                    .order('created_at', { ascending: true })
                    .limit(50);

                if (error) {
                    // Table might not exist yet — fail silently
                    list.innerHTML = '';
                    if (inputWrap) inputWrap.innerHTML = '';
                    return;
                }

                if (countEl) countEl.textContent = comments && comments.length ? `(${comments.length})` : '';

                if (!comments || !comments.length) {
                    list.innerHTML = `<div class="text-gray-500 text-xs text-center py-2">${t.premiumNoComments || 'Sin comentarios aún'}</div>`;
                } else {
                    list.innerHTML = comments.map(c => {
                        const initial = (c.profiles && c.profiles.nombre ? c.profiles.nombre.charAt(0) : 'R').toUpperCase();
                        const nombre = c.profiles && c.profiles.nombre ? escapeHtml(c.profiles.nombre) : 'Runner';
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

                // Input: Premium puede escribir, free ve CTA
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
                                <button onclick="openPremiumSales()" class="text-xs text-yellow-400 hover:text-yellow-300 transition">${t.premiumCommentCta || '⭐ Premium para comentar'}</button>
                            </div>`;
                    }
                }
            } catch (e) {
                console.warn('Comments error:', e);
                list.innerHTML = '';
                if (inputWrap) inputWrap.innerHTML = '';
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

        // ========== SMART RECOMMENDATIONS ==========
        async function loadSmartRecommendations() {
            const section = document.getElementById('smart-recs-section');
            const locked = document.getElementById('smart-recs-locked');

            if (!currentUser) {
                if (section) section.classList.add('hidden');
                if (locked) locked.classList.add('hidden');
                return;
            }

            if (!isUserPremium) {
                if (section) section.classList.add('hidden');
                if (locked) locked.classList.remove('hidden');
                return;
            }

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
                const cards = document.getElementById('smart-recs-cards');
                if (cards) {
                    cards.innerHTML = scored.map(item => {
                        const q = item.q;
                        return `
                        <div class="flex-shrink-0 w-64 snap-start card-quedada p-4 rounded-xl cursor-pointer hover:border-orange-500/30 transition-all" onclick="openQuedadaDetail('${q.id}')">
                            <div class="text-xs text-orange-400 font-bold mb-1">${formatDateShort(q.fecha)} · ${formatHora(q.hora)}</div>
                            <div class="text-sm font-bold text-white mb-1 line-clamp-1">${escapeHtml(q.titulo)}</div>
                            <div class="text-xs text-gray-400 mb-2">📍 ${escapeHtml(q.ciudad || '')}</div>
                            <div class="flex gap-2 text-xs">
                                <span class="px-2 py-0.5 rounded-full bg-slate-700 text-gray-300">${formatDistancia(q.distancia)}</span>
                                <span class="px-2 py-0.5 rounded-full bg-slate-700 text-gray-300">${q.nivel}</span>
                            </div>
                            ${item.friendsGoing > 0 ? `<div class="text-xs text-green-400 mt-2">👥 ${item.friendsGoing} ${t.premiumFriendsGoing || 'amigos van'}</div>` : ''}
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
            html += '<div class="mb-4"><h4 class="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">🏅 Logros</h4>';
            html += normalBadges.map(b => {
                const unlocked = b.condition(userStats);
                return `
                <div class="badge-item ${unlocked ? 'unlocked' : 'locked'} mb-2">
                    <div class="badge-icon">${b.icon}</div>
                    <div class="flex-1">
                        <div class="font-bold text-white">${b.name}</div>
                        <div class="text-sm text-gray-400">${b.desc}</div>
                    </div>
                    ${unlocked ? '<span class="text-green-400 text-xl">✓</span>' : '<span class="text-gray-600">🔒</span>'}
                </div>`;
            }).join('');
            html += '</div>';

            // Badges Premium (sección especial dorada)
            html += '<div class="mt-6 pt-4 border-t border-yellow-500/30">';
            html += '<h4 class="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">⭐ Badges Exclusivos Premium</h4>';

            if (!isUserPremium) {
                html += `<div class="text-center py-4 px-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20">
                    <p class="text-yellow-400 text-sm font-semibold mb-2">🔒 Desbloquea badges exclusivos</p>
                    <p class="text-gray-400 text-xs mb-3">Hazte Premium para acceder a badges dorados únicos</p>
                    <button onclick="closeModal('modal-badges'); openModal('modal-profile')" class="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold hover:shadow-lg transition">
                        ⭐ Ver Premium
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
                        ${unlocked ? '<span class="text-yellow-400 text-xl">⭐</span>' : '<span class="text-gray-600">🔒</span>'}
                    </div>`;
                }).join('');
            }
            html += '</div>';

            list.innerHTML = html;
        }

        // ========== PREMIUM: FILTROS AVANZADOS ==========
        let activeFilters = { nivel: null, horario: null, distancia: null, ritmo: null, verificado: null, premium_org: null };
        let filtersVisible = false;

        function toggleAdvancedFilters() {
            filtersVisible = !filtersVisible;
            const panel = document.getElementById('filters-panel');
            const icon = document.getElementById('toggle-filters-icon');
            const text = document.getElementById('toggle-filters-text');
            if (panel) panel.classList.toggle('hidden', !filtersVisible);
            if (icon) icon.style.transform = filtersVisible ? 'rotate(180deg)' : '';
            if (text) text.textContent = filtersVisible ? 'Menos filtros' : 'Más filtros';
        }

        function initFilterPills() {
            document.querySelectorAll('.filter-pill').forEach(pill => {
                pill.setAttribute('aria-pressed', 'false');
                pill.addEventListener('click', () => {
                    const filterType = pill.dataset.filter;
                    const value = pill.dataset.value;

                    // Toggle selection
                    if (activeFilters[filterType] === value) {
                        activeFilters[filterType] = null;
                        pill.classList.remove('active');
                        pill.setAttribute('aria-pressed', 'false');
                    } else {
                        // Deselect others in same group
                        document.querySelectorAll(`.filter-pill[data-filter="${filterType}"]`).forEach(p => {
                            p.classList.remove('active');
                            p.setAttribute('aria-pressed', 'false');
                        });
                        activeFilters[filterType] = value;
                        pill.classList.add('active');
                        pill.setAttribute('aria-pressed', 'true');
                    }

                    updateFilterUI();
                    renderQuedadas();
                });
            });
        }

        function updateFilterUI() {
            const count = Object.values(activeFilters).filter(v => v !== null).length;
            const countEl = document.getElementById('active-filters-count');
            const clearBtn = document.getElementById('btn-clear-filters');
            const clearBtnDesktop = document.getElementById('btn-clear-filters-desktop');
            const saveAlertBtn = document.getElementById('btn-save-alert');
            const resultCount = document.getElementById('filter-result-count');

            if (countEl) {
                countEl.textContent = count;
                countEl.classList.toggle('hidden', count === 0);
            }
            if (clearBtn) clearBtn.classList.toggle('hidden', count === 0);
            if (clearBtnDesktop) clearBtnDesktop.classList.toggle('hidden', count === 0);
            if (saveAlertBtn) saveAlertBtn.classList.toggle('hidden', count === 0);

            // Actualizar contador de resultados en sidebar
            if (resultCount) {
                const filtered = quedadas.filter(q => !isQuedadaPasada(q));
                const withFilters = applyAdvancedFilters(filtered);
                resultCount.textContent = withFilters.length;
            }
        }

        // Inicializar filtros en sidebar desktop
        function initDesktopFilters() {
            const container = document.getElementById('desktop-filters-content');
            if (!container) return;

            container.innerHTML = `
                <!-- Horario -->
                <div class="filter-group">
                    <label class="text-sm font-semibold text-gray-300 mb-2 block">🌤️ Horario</label>
                    <div class="grid grid-cols-3 gap-2" role="group" aria-label="Filtro por horario">
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="horario" data-value="manana">🌅 Mañana</button>
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="horario" data-value="tarde">🌆 Tarde</button>
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="horario" data-value="noche">🌙 Noche</button>
                    </div>
                </div>

                <!-- Nivel -->
                <div class="filter-group">
                    <label class="text-sm font-semibold text-gray-300 mb-2 block">📊 Nivel</label>
                    <div class="grid grid-cols-2 gap-2" role="group" aria-label="Filtro por nivel">
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Principiante">🟢 Principiante</button>
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Intermedio">🟡 Intermedio</button>
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Avanzado">🔴 Avanzado</button>
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Elite">🟣 Elite</button>
                    </div>
                </div>

                <!-- Distancia -->
                <div class="filter-group">
                    <label class="text-sm font-semibold text-gray-300 mb-2 block">📏 Distancia</label>
                    <div class="grid grid-cols-3 gap-2" role="group" aria-label="Filtro por distancia">
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="distancia" data-value="corta">🌱 Corta</button>
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="distancia" data-value="media">🏃 Media</button>
                        <button class="filter-pill-desktop" aria-pressed="false" data-filter="distancia" data-value="larga">🔥 Larga</button>
                    </div>
                </div>

                <!-- Premium filters teaser -->
                <div class="filter-group pt-4 border-t border-slate-700/50 ${isUserPremium ? 'hidden' : ''}">
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-sm font-semibold text-yellow-400 flex items-center gap-1">⭐ Filtros Premium</label>
                    </div>
                    <div class="text-xs text-gray-500 mb-3">Ritmo exacto, organizador verificado...</div>
                    <button onclick="openPremiumSales()" class="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold hover:border-yellow-500/50 transition">
                        Desbloquear ⭐
                    </button>
                </div>

                <!-- Premium filters (si es premium) -->
                <div id="premium-filters-desktop" class="${isUserPremium ? '' : 'hidden'} pt-4 border-t border-yellow-500/30">
                    <label class="text-sm font-semibold text-yellow-400 mb-2 block flex items-center gap-1">⭐ Filtros Premium</label>
                    <div class="space-y-3">
                        <div>
                            <span class="text-xs text-gray-400">Ritmo</span>
                            <div class="grid grid-cols-3 gap-1 mt-1" role="group" aria-label="Filtro por ritmo">
                                <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="ritmo" data-value="lento">🐢 Lento</button>
                                <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="ritmo" data-value="moderado">🚶 Mod.</button>
                                <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="ritmo" data-value="rapido">🏃 Rápido</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2" role="group" aria-label="Filtros premium adicionales">
                            <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="verificado" data-value="true">✅ Verificado</button>
                            <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="premium_org" data-value="true">⭐ Premium</button>
                        </div>
                    </div>
                </div>
            `;

            // Añadir event listeners a los nuevos pills
            container.querySelectorAll('.filter-pill-desktop').forEach(pill => {
                pill.addEventListener('click', () => {
                    const filterType = pill.dataset.filter;
                    const value = pill.dataset.value;

                    // Toggle selection
                    if (activeFilters[filterType] === value) {
                        activeFilters[filterType] = null;
                        pill.classList.remove('active');
                        pill.setAttribute('aria-pressed', 'false');
                        // También deseleccionar en los filtros móviles
                        document.querySelectorAll(`.filter-pill[data-filter="${filterType}"][data-value="${value}"]`).forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
                    } else {
                        // Deselect others in same group
                        container.querySelectorAll(`.filter-pill-desktop[data-filter="${filterType}"]`).forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
                        document.querySelectorAll(`.filter-pill[data-filter="${filterType}"]`).forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
                        activeFilters[filterType] = value;
                        pill.classList.add('active');
                        pill.setAttribute('aria-pressed', 'true');
                        // También seleccionar en los filtros móviles
                        document.querySelectorAll(`.filter-pill[data-filter="${filterType}"][data-value="${value}"]`).forEach(p => { p.classList.add('active'); p.setAttribute('aria-pressed', 'true'); });
                    }

                    updateFilterUI();
                    renderQuedadas();
                });
            });
        }

        function clearAdvancedFilters() {
            activeFilters = { nivel: null, horario: null, distancia: null, ritmo: null, verificado: null, premium_org: null };
            document.querySelectorAll('.filter-pill, .filter-pill-desktop').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
            updateFilterUI();
            renderQuedadas();
        }

        // Alias para el botón de limpiar filtros
        function clearAllFilters() {
            clearAdvancedFilters();
        }

        // ========== SISTEMA DE ALERTAS ==========
        function updateSaveAlertButton() {
            const hasFilters = Object.values(activeFilters).some(v => v !== null);
            const btn = document.getElementById('btn-save-alert');
            if (btn) {
                btn.classList.toggle('hidden', !hasFilters);
            }
        }

        function openSaveAlertModal() {
            if (!currentUser) {
                showToast('Inicia sesión para guardar alertas', 'error');
                openModal('modal-login');
                return;
            }

            // Llenar resumen de filtros
            const summaryEl = document.getElementById('alert-filters-summary');
            if (summaryEl) {
                const filterLabels = {
                    horario: { label: 'Horario', values: { manana: '🌅 Mañana', mediodia: '☀️ Mediodía', tarde: '🌆 Tarde', noche: '🌙 Noche' } },
                    nivel: { label: 'Nivel', values: {} },
                    distancia: { label: 'Distancia', values: { '5': '≤5 km', '10': '≤10 km', '15': '≤15 km', '21': '≤21 km', '42': 'Maratón+' } },
                    dia: { label: 'Día', values: { '0': 'Domingo', '1': 'Lunes', '2': 'Martes', '3': 'Miércoles', '4': 'Jueves', '5': 'Viernes', '6': 'Sábado' } }
                };

                let html = '';
                for (const [key, value] of Object.entries(activeFilters)) {
                    if (value) {
                        const config = filterLabels[key];
                        const displayValue = config?.values?.[value] || value;
                        html += `<p class="flex items-center gap-2"><span class="text-orange-400">•</span> ${config?.label || key}: <strong>${displayValue}</strong></p>`;
                    }
                }
                summaryEl.innerHTML = html || '<p class="text-gray-500">Sin filtros activos</p>';
            }

            // Reset form
            const nameInput = document.getElementById('alert-name');
            if (nameInput) {
                nameInput.value = '';
                document.getElementById('alert-name-count').textContent = '0';
            }

            openModal('modal-save-alert');
        }

        async function saveAlert() {
            const name = document.getElementById('alert-name')?.value?.trim();
            if (!name) {
                showToast('Ponle un nombre a la alerta', 'error');
                return;
            }

            const pushEnabled = document.getElementById('alert-push')?.checked;
            const emailEnabled = document.getElementById('alert-email')?.checked;

            if (!pushEnabled && !emailEnabled) {
                showToast('Selecciona al menos un tipo de notificación', 'error');
                return;
            }

            try {
                const sb = window.supabaseClient;
                if (!sb || !currentUser) {
                    showToast('Error de conexión', 'error');
                    return;
                }

                // Guardar en Supabase
                const { error } = await sb.from('user_alerts').insert([{
                    user_id: currentUser.id,
                    name: name,
                    filters: activeFilters,
                    notifications: { push: pushEnabled, email: emailEnabled },
                    is_active: true
                }]);

                if (error) throw error;

                closeModal('modal-save-alert');
                showToast('🔔 Alerta guardada. Te notificaremos cuando haya nuevas quedadas', 'success');

            } catch (err) {
                console.error('Error guardando alerta:', err);
                showToast('Error al guardar la alerta', 'error');
            }
        }

        // Actualizar contador de nombre de alerta
        document.addEventListener('DOMContentLoaded', () => {
            const nameInput = document.getElementById('alert-name');
            if (nameInput) {
                nameInput.addEventListener('input', (e) => {
                    const count = e.target.value.length;
                    const countEl = document.getElementById('alert-name-count');
                    if (countEl) countEl.textContent = count;
                });
            }
        });

        function applyAdvancedFilters(quedadasList) {
            return quedadasList.filter(q => {
                // Filtro nivel
                if (activeFilters.nivel && q.nivel !== activeFilters.nivel) return false;
                // Filtro horario (Mañana: 6-12, Tarde: 12-20, Noche: 20-6)
                if (activeFilters.horario && q.hora) {
                    const hour = parseInt(q.hora.split(':')[0]);
                    if (activeFilters.horario === 'manana' && (hour < 6 || hour >= 12)) return false;
                    if (activeFilters.horario === 'tarde' && (hour < 12 || hour >= 20)) return false;
                    if (activeFilters.horario === 'noche' && (hour < 20 && hour >= 6)) return false;
                }
                // Filtro distancia
                if (activeFilters.distancia && q.distancia) {
                    const dist = parseFloat(q.distancia.replace(/[^\d.]/g, ''));
                    if (activeFilters.distancia === 'corta' && dist >= 8) return false;
                    if (activeFilters.distancia === 'media' && (dist < 8 || dist > 15)) return false;
                    if (activeFilters.distancia === 'larga' && dist <= 15) return false;
                }
                // ⭐ Filtros Premium
                if (activeFilters.ritmo && q.ritmo) {
                    const ritmoStr = q.ritmo.toLowerCase();
                    const minMatch = ritmoStr.match(/(\d+):(\d+)/);
                    if (minMatch) {
                        const mins = parseInt(minMatch[1]) + parseInt(minMatch[2]) / 60;
                        if (activeFilters.ritmo === 'lento' && mins < 6) return false;
                        if (activeFilters.ritmo === 'moderado' && (mins < 5 || mins >= 6)) return false;
                        if (activeFilters.ritmo === 'rapido' && mins >= 5) return false;
                    }
                }
                if (activeFilters.verificado === 'true') {
                    if (!q.organizador?.verification_badge) return false;
                }
                if (activeFilters.premium_org === 'true') {
                    if (!q.organizador?.es_premium && !q.es_premium) return false;
                }
                return true;
            });
        }

        // ========== PREMIUM: VALORACIONES ==========
        let currentRating = 0;

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
                    .eq('user_id', currentUser.id);

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
                    .eq('reviewer_id', currentUser.id);

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
        let verifyFileData = null;

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
                    statusIcon.textContent = '🔄';
                    statusText.textContent = 'Pendiente de revisión';
                    statusDesc.textContent = `Nivel ${data.claimed_level} - Enviado el ${new Date(data.created_at).toLocaleDateString()}`;
                    statusContainer.className = 'p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30';
                } else if (data.status === 'approved') {
                    statusIcon.textContent = '✅';
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
                    verifyStatus.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">✓ Nivel ${profile.verified_level || currentUser.nivel} verificado</span>`;
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
                        verifyBtn.innerHTML = '<span>🔄</span> Pendiente';
                        verifyBtn.className = 'px-4 py-3 rounded-xl font-bold text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-2 whitespace-nowrap';
                        verifyStatus.classList.remove('hidden');
                        verifyStatus.innerHTML = `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🔄 Solicitud de ${pending.claimed_level} en revisión</span>`;
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

        // ========== PREMIUM: COMPARTIR ==========
        let currentShareQuedadaId = null;

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
        let mapState = 'normal'; // 'normal', 'minimized', 'expanded'

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
        let isMapFullscreen = false;

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

        // ========== PREMIUM: ANIMACIÓN BIENVENIDA ==========
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

        // ========== PREMIUM: BADGE EN VIVO ==========
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
                let icon = '☀️';
                let desc = 'Despejado';

                if (code === 0) {
                    icon = '☀️'; desc = 'Despejado'; condition = 'good';
                } else if (code >= 1 && code <= 3) {
                    icon = '⛅'; desc = 'Parcial nublado'; condition = 'good';
                } else if (code >= 45 && code <= 48) {
                    icon = '🌫️'; desc = 'Niebla'; condition = 'warn';
                } else if (code >= 51 && code <= 57) {
                    icon = '🌦️'; desc = 'Llovizna'; condition = 'warn';
                } else if (code >= 61 && code <= 67) {
                    icon = '🌧️'; desc = 'Lluvia'; condition = rain > 60 ? 'bad' : 'warn';
                } else if (code >= 71 && code <= 77) {
                    icon = '❄️'; desc = 'Nieve'; condition = 'bad';
                } else if (code >= 80 && code <= 82) {
                    icon = '🌧️'; desc = 'Chubascos'; condition = rain > 50 ? 'bad' : 'warn';
                } else if (code >= 95) {
                    icon = '⛈️'; desc = 'Tormenta'; condition = 'bad';
                }

                // Texto estandarizado: siempre temperatura + lluvia si > 20%
                let text = `${tempMax}°`;
                if (rain > 20) {
                    text += ` · ${rain}% 💧`;
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
                    <div class="text-xs text-gray-400">${weather.rain > 20 ? `💧 ${weather.rain}% ${t.weatherRain || 'lluvia'} · ` : ''}${tip}</div>
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
        
        // 🧹 Verificar si una quedada ya pasó (fecha+hora + 5 min de gracia)
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

        // Ver perfil de organizador - abre modal con info detallada
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
            if (totalOrganized >= 20) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">🏆 Experto</span>`;
            else if (totalOrganized >= 10) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⭐ Veterano</span>`;
            else if (totalOrganized >= 5) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">👍 Activo</span>`;
            if (rating >= 4.5 && totalReviews >= 3) badgesHtml += `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">💫 Muy valorado</span>`;

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
                                ${ciudad ? `<p class="text-sm text-gray-400">📍 ${ciudad}</p>` : ''}
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
        function showApp(withWelcome = false){document.getElementById('view-landing').classList.remove('active');document.getElementById('view-app').classList.add('active');setTimeout(()=>ensureLeaflet().then(initMap),100);updateUserUI();if(withWelcome)showWelcomeAnimation();loadUserStats();loadSocialStats();initFilterPills();initDesktopFilters();updateGeoFilterUI();updateReferralBanner(currentUser?.referral_count||0);if(typeof lazyLoadScript==='function'){lazyLoadScript('/js/strava.js');lazyLoadScript('/js/push.js');}var _ln=document.getElementById('mobile-bottom-nav');var _an=document.getElementById('app-bottom-nav');if(_ln)_ln.style.display='none';if(_an&&window.innerWidth<768)_an.style.display='block';}
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
            avatar: '🏃',
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
                }catch(_){ }
              })
              .subscribe();
          }catch(_){ }
        }

        // Override sidebar functions (online-aware)
        async function selectCommunity(id){
          selectedCommunity=id;
          sidebarView='topics';
          try{
            await detectChatMode();
            const topics = await loadTopicsForCommunity(id);
            forumTopics[id] = topics;
          }catch(_){ }
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
          }catch(_){ }
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
          forumMessages[newTopic.id]=[{id:1,author:currentUser?.nombre||'Anónimo',avatar:'🏃',content,time:'ahora',likes:0}];
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
          forumMessages[selectedTopic].push({id:Date.now(),author:currentUser?.nombre||'Anónimo',avatar:'🏃',content,time:'ahora',likes:0});
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
        async function requestAccountDeletion(){
          if(!currentUser){ showToast('Debes iniciar sesión','error'); return; }
          const txt = (document.getElementById('delete-confirm-text')?.value || '').trim().toUpperCase();
          if(txt !== 'ELIMINAR'){ showToast('Escribe ELIMINAR para confirmar','error'); return; }

          const btn = document.getElementById('btn-delete-account');
          const prev = btn ? btn.textContent : '';
          if(btn){ btn.disabled=true; btn.textContent='Eliminando...'; }

          const sb = await getSupabaseClientOrToast(12000, true);
          if(!sb){ if(btn){ btn.disabled=false; btn.textContent=prev; } return; }

          try{
            // 1) registrar solicitud (si existe tabla)
            try{
              await sb.from('account_deletion_requests').insert([{ user_id: currentUser.id, email: currentUser.email }]);
            }catch(_){ /* optional */ }

            // 2) limpiar relaciones públicas
            try{ await sb.from('participantes').delete().eq('user_id', currentUser.id); }catch(_){ }
            try{ await sb.from('quedadas').delete().eq('creador_id', currentUser.id); }catch(_){ }
            try{ await sb.from('profiles').delete().eq('id', currentUser.id); }catch(_){ }

            // 3) cerrar sesión
            try{ await sb.auth.signOut(); }catch(_){ }
            currentUser=null;

            closeModal('modal-delete-account');
            closeModal('modal-profile');
            showLanding();
            showToast('Cuenta eliminada (perfil y datos públicos).','success');
            setTimeout(()=>{ try{ openModal('modal-login'); }catch(_){ } }, 300);
          }catch(e){
            showToast('No se pudo eliminar: ' + (e?.message||e), 'error');
          }finally{
            if(btn){ btn.disabled=false; btn.textContent=prev || 'Confirmar eliminación'; }
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

            openModal('modal-profile');
            loadGamificationStats();
            loadMisQuedadas();
            loadReferralUI();
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
                     onclick="selectOnboardUbicacion('${loc.place}', '${loc.admin1 || ''}', '${loc.country}')">
                    <div class="font-medium text-white">${loc.place}</div>
                    <div class="text-xs text-gray-400">${loc.admin1 || ''} · ${loc.country === 'ES' ? 'España' : 'Portugal'}</div>
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
                console.warn('saveOnboardProfile:', e);
                showToast('Error al guardar','error');
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

            currentUser.nombre = nombre;
            currentUser.apellidos = apellidos;
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
                    console.warn('Perfil:', error.message);
                    showToast('Error guardando perfil', 'error');
                    return;
                }
            }

            updateUserUI();
            closeModal('modal-profile');
            showToast('Perfil actualizado');
        }

        

        // ===================== SUPABASE READY HELPER =====================
// Espera a que el bootstrap de Supabase termine. Evita falsos "Supabase no inicializado" por carga lenta.
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
                console.warn('Google OAuth error:', e);
                showToast('Error al iniciar con Google', 'error');
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
            if(eProf){ console.warn('Perfil:', eProf.message); }

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

            // Verificar estado premium antes de mostrar popup
            await checkPremiumStatus();
            // Mostrar popup de Premium si corresponde
            maybeShowPremiumPromo();
        }

        // ====== PREMIUM PROMO POPUP ======
        function maybeShowPremiumPromo() {
            // No mostrar si ya es premium (ventaja de ser premium: sin anuncios)
            if (isUserPremium) return;

            // Verificar última vez que se mostró
            const lastShown = localStorage.getItem('cj_premium_promo_last');
            const now = Date.now();
            const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

            if (lastShown) {
                const elapsed = now - parseInt(lastShown);
                if (elapsed < sevenDays) return; // No han pasado 7 días
            }

            // Mostrar popup después de un pequeño delay
            setTimeout(() => {
                openPremiumSales();
                localStorage.setItem('cj_premium_promo_last', now.toString());
            }, 2000); // 2 segundos después del login
        }

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
            if(!email || !email.includes('@')){ showToast('Email no válido.','error'); return; }
            if(!pass || pass.length < 6){ showToast('La contraseña debe tener al menos 6 caracteres.','error'); return; }
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
            }catch(e){ console.warn('Profile update:', e); }

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
            } catch(e) {}

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
            if(!email || !email.includes('@')){ showToast('Email no válido.','error'); return; }
            if(email !== email2){ showToast('Los emails no coinciden.','error'); return; }
            if(!pass || pass.length < 6){ showToast('La contraseña debe tener al menos 6 caracteres.','error'); return; }
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
                console.warn('Perfil update:', e && e.message ? e.message : e);
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
            if(!email || !email.includes('@')){ showToast('Introduce un email válido','error'); return; }
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

        // Exponer handlers para onclick inline (evita fallos silenciosos por scope)
        window.doResetPasswordUpdate = doResetPasswordUpdate;
        window.doResetPassword = doResetPassword;
        window.doValidateResetLink = doValidateResetLink;
        // Alias legacy: el botón del modal llama a updatePassword()
        window.updatePassword = doResetPasswordUpdate;
        window.onPlaceInputRegister = onPlaceInputRegister;
        /* === Leaflet lazy loader === */
        let _leafletP = null;
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
            // Usar OpenStreetMap España para idioma local en ambos modos
            // Modo oscuro: aplicar filtro CSS para oscurecer el mapa
            const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            if (currentTileLayer) map.removeLayer(currentTileLayer);
            currentTileLayer = L.tileLayer(tileUrl, {
                attribution: '© OpenStreetMap'
            }).addTo(map);
            // Aplicar filtro oscuro en modo dark
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                mapContainer.style.filter = isLight ? 'none' : 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9)';
            }
        }

        // ====== NEAR ME (GPS) ======
        let userLoc = null;
        let userMarker = null;
        let userCountry = 'ES'; // País del usuario (detectado por GPS o perfil)
        let geoFilterMode = 'country'; // 'country' = solo mi país, 'all' = mundial

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
                const flags = {
                    'ES': '🇪🇸', 'PT': '🇵🇹', 'AR': '🇦🇷', 'MX': '🇲🇽', 'CO': '🇨🇴', 'PE': '🇵🇪',
                    'CL': '🇨🇱', 'EC': '🇪🇨', 'VE': '🇻🇪', 'UY': '🇺🇾', 'PY': '🇵🇾', 'BO': '🇧🇴',
                    'CR': '🇨🇷', 'PA': '🇵🇦', 'GT': '🇬🇹', 'HN': '🇭🇳', 'SV': '🇸🇻', 'NI': '🇳🇮',
                    'CU': '🇨🇺', 'DO': '🇩🇴', 'PR': '🇵🇷', 'US': '🇺🇸', 'FR': '🇫🇷', 'IT': '🇮🇹',
                    'DE': '🇩🇪', 'GB': '🇬🇧', 'BR': '🇧🇷', 'PH': '🇵🇭', 'GQ': '🇬🇶'
                };
                flagEl.textContent = flags[userCountry] || '🌍';
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
                const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`);
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
                const icon=L.divIcon({
                    html:`<div style="background:linear-gradient(135deg,#f97316,#ea580c);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3)"><span style="font-size:16px">🏃</span></div>`,
                    className:'',iconSize:[36,36],iconAnchor:[18,18]
                });
                const m=L.marker([q.lat,q.lng],{icon}).addTo(map)
                  .bindPopup(`<div><b>${q.titulo}</b><br>📍 ${q.ubicacion}<br>📅 ${formatDate(q.fecha)}</div>`);
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
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6${viewbox}&q=${encodeURIComponent(qFinal)}`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
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
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
                const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
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
            // PREMIUM: Si usuario Free ya usó sus 3 quedadas, mostrar modal de upgrade directamente
            if (!isUserPremium) {
                const count = getUserQuedadasThisMonth();
                if (count >= 3) {
                    openModal('modal-limit-reached');
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
                hint.textContent = '⚠️ Máximo 100 km';
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
                    hint.textContent = '🔥 Ritmo de élite';
                    hint.className = 'text-xs text-purple-400 mt-1';
                } else if (min <= 5) {
                    hint.textContent = '⚡ Ritmo avanzado';
                    hint.className = 'text-xs text-red-400 mt-1';
                } else if (min <= 6) {
                    hint.textContent = '👍 Ritmo intermedio';
                    hint.className = 'text-xs text-yellow-400 mt-1';
                } else {
                    hint.textContent = '🌱 Ritmo principiante';
                    hint.className = 'text-xs text-green-400 mt-1';
                }
            } else if (min > 0) {
                ritmoInput.value = '';
                hint.textContent = '⚠️ Ritmo entre 3:00 y 10:00 min/km';
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
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
                console.log('🗺️ Llamando a:', url);

                const res = await fetch(url, {
                    headers: { 'User-Agent': 'CorrerJuntos/1.0' }
                });

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
                    if (textoEl) textoEl.textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    showToast('🏃 Ubicación marcada', 'success');
                }

                updateCrearProgress();

            } catch (e) {
                console.error('🗺️ ERROR REVERSE GEOCODING:', e);
                if (textoEl) textoEl.textContent = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
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
                let fechaStr = '📅 Sin fecha';
                if (fecha) {
                    const d = new Date(fecha + 'T00:00:00');
                    fechaStr = `📅 ${d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}`;
                }
                if (hora) fechaStr += ` ⏰ ${hora}`;
                previewFecha.textContent = fechaStr;
            }
            if (previewUbicacion) previewUbicacion.textContent = `📍 ${ubicacion !== 'Selecciona en el mapa...' ? ubicacion : 'Sin ubicación'}`;
            if (previewDistancia) previewDistancia.textContent = `📏 ${distancia || '--'} km`;
            if (previewRitmo) previewRitmo.textContent = `🏃 ${ritmo || '--'}`;
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

          // Tiles claros para mejor visibilidad
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
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
              const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
              const res = await fetch(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0' }});
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
              const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=es`;
              const res = await fetch(url, { headers: { 'User-Agent': 'CorrerJuntos/1.0' }});
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
                    .select('id, titulo, ciudad, fecha, hora, nivel, lat, lng, organizador_nombre, punto_encuentro')
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

            document.getElementById('qp-modal-location').textContent = [q.punto_encuentro, q.ciudad].filter(Boolean).join(', ') || (lang === 'en' ? 'Location to be confirmed' : lang === 'pt' ? 'Local a confirmar' : 'Ubicación por confirmar');

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
                    var resp = await sb.from('quedadas').select('id, titulo, ciudad, fecha, hora, nivel, lat, lng, organizador_nombre, punto_encuentro, organizador_foto').eq('id', qId).single();
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
        async function loadQuedadas(){
            // Mostrar skeletons mientras carga
            showSkeletons('lista-quedadas', 3);

            const sb = await getSupabaseClientOrToast(12000, true);
            if(!sb){
                quedadas = [];
                renderQuedadas();
                updateMarkers();
                return;
            }

            // Construir query base - incluir datos del creador/organizador
            // Premium columns (is_private,access_code,recurrence,ruta_coords) require migration 16_premium_features.sql
            const premiumCols = ',is_private,access_code,recurrence,ruta_coords';
            const baseCols = 'id,titulo,ciudad,ubicacion,direccion,lat,lng,fecha,hora,nivel,distancia,ritmo,descripcion,creador_id,created_at,es_seed,organizador_nombre,organizador_foto,participantes_seed,max_participantes';
            const joinCols = `creador:profiles!quedadas_creador_id_fkey(id,nombre,apellidos,photo_url,organizer_rating,total_reviews,total_organized,verification_badge,es_premium),participantes(user_id,status,es_seed,profiles!participantes_user_id_fkey_profiles(id,nombre,apellidos,photo_url,es_seed,es_premium))`;

            let query = window.supabaseClient
              .from('quedadas')
              .select(`${baseCols}${premiumCols},${joinCols}`)
              .order('created_at', { ascending: false });

            // Filtrar contenido seed solo para usuarios existentes (no nuevos)
            if (!isNewUser()) {
                query = query.eq('es_seed', false);
            }

            let { data, error } = await query;

            // Fallback: If premium columns don't exist yet, retry without them
            if (error && error.message && (error.message.includes('is_private') || error.message.includes('access_code') || error.message.includes('recurrence') || error.message.includes('ruta_coords'))) {
                console.warn('Premium columns not found, retrying without them:', error.message);
                let fallbackQuery = window.supabaseClient
                    .from('quedadas')
                    .select(`${baseCols},${joinCols}`)
                    .order('created_at', { ascending: false });
                if (!isNewUser()) fallbackQuery = fallbackQuery.eq('es_seed', false);
                const fallback = await fallbackQuery;
                data = fallback.data;
                error = fallback.error;
            }

            if(error){
                console.warn('loadQuedadas:', error.message);
                quedadas = [];
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
        function injectEventSchema(dataOverride) {
            try {
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
                        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR', 'url': 'https://www.correrjuntos.com', 'availability': 'https://schema.org/InStock' },
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
                        ⭐ Desbloquear con Premium
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
                    actionBtn = `<span class="px-5 py-2.5 rounded-full font-extrabold text-sm bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-2">👑 Tu quedada</span>`;
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
                        badges.push({ icon: '⭐', text: 'Premium', class: 'badge-premium', title: 'Organizador Premium' });
                    }

                    // Badge Verificado (email verificado)
                    if (creadorVerified) {
                        badges.push({ icon: '✓', text: 'Verificado', class: 'badge-verified', title: 'Email verificado' });
                    }

                    // Badge por cantidad de quedadas organizadas
                    if (creadorOrganized >= 20) {
                        badges.push({ icon: '🏆', text: 'Experto', class: 'badge-expert', title: 'Más de 20 quedadas organizadas' });
                    } else if (creadorOrganized >= 10) {
                        badges.push({ icon: '🏅', text: 'Elite', class: 'badge-elite', title: 'Más de 10 quedadas organizadas' });
                    } else if (creadorOrganized >= 5) {
                        badges.push({ icon: '⭐', text: 'Activo', class: 'badge-active', title: 'Más de 5 quedadas organizadas' });
                    }

                    // Badge por rating alto
                    if (creadorRating >= 4.5 && creadorReviews >= 3) {
                        badges.push({ icon: '💫', text: 'Top', class: 'badge-top-rated', title: 'Rating 4.5+ con 3+ reseñas' });
                    } else if (creadorRating >= 4.0 && creadorReviews >= 2) {
                        badges.push({ icon: '👍', text: 'Recomendado', class: 'badge-recommended', title: 'Rating 4.0+ con reseñas positivas' });
                    }

                    // Si no tiene badges y es organizador de al menos 1 quedada, mostrar badge "Nuevo"
                    if (badges.length === 0 && !esSeed) {
                        badges.push({ icon: '🆕', text: 'Nuevo', class: 'badge-new', title: 'Nuevo organizador' });
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
                        ${creadorRating ? `<span class="text-xs text-yellow-400 font-bold">⭐ ${creadorRating.toFixed(1)}</span>` : ''}
                        ${creadorReviews > 0 ? `<span class="text-xs text-gray-500">(${creadorReviews})</span>` : ''}
                        ${orgBadge ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${orgBadge.class} border">${orgBadge.icon}</span>` : ''}
                      </div>
                    </div>
                    ${creadorOrganized > 0 ? `<div class="text-xs text-gray-500 text-right shrink-0">${creadorOrganized} ${currentLang==='en'?'events':(currentLang==='pt'?'eventos':'quedadas')}</div>` : ''}
                  </div>`;

                // Generar lista de features (terreno + desnivel + amenities) DESTACADOS
                const featuresArray = [];
                if (q.terreno === 'asfalto') featuresArray.push({ icon: '🛣️', text: 'Asfalto' });
                if (q.terreno === 'tierra') featuresArray.push({ icon: '🌲', text: 'Tierra' });
                if (q.terreno === 'mixto') featuresArray.push({ icon: '🔀', text: 'Mixto' });
                if (q.desnivel === 'llano') featuresArray.push({ icon: '⬜', text: 'Llano' });
                if (q.desnivel === 'suave') featuresArray.push({ icon: '📐', text: 'Suave' });
                if (q.desnivel === 'moderado') featuresArray.push({ icon: '⛰️', text: 'Moderado' });
                if (q.desnivel === 'fuerte') featuresArray.push({ icon: '🏔️', text: 'Fuerte' });
                // Amenities detectados
                if (detectedAmenities.includes('fuentes')) featuresArray.push({ icon: '💧', text: 'Fuentes' });
                if (detectedAmenities.includes('banos')) featuresArray.push({ icon: '🚻', text: 'Baños' });
                if (detectedAmenities.includes('parking')) featuresArray.push({ icon: '🅿️', text: 'Parking' });
                if (detectedAmenities.includes('vestuarios')) featuresArray.push({ icon: '🚿', text: 'Vestuarios' });
                if (detectedAmenities.includes('iluminacion')) featuresArray.push({ icon: '💡', text: 'Iluminado' });
                if (detectedAmenities.includes('sombra')) featuresArray.push({ icon: '🌳', text: 'Sombra' });
                if (detectedAmenities.includes('cafe')) featuresArray.push({ icon: '☕', text: 'Café' });
                if (detectedAmenities.includes('transporte')) featuresArray.push({ icon: '🚇', text: 'Transporte' });

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
                      ${q.is_private ? `<span class="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">🔒</span>` : ''}
                      ${q.recurrence ? `<span class="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">🔄</span>` : ''}
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      <div class="flex items-center gap-2">
                        <span class="px-3 py-1.5 rounded-full text-xs font-bold ${levelBadge}">${q.nivel}</span>
                        ${isJoined && !isCreator ? `<span class="px-2 py-1 rounded-full text-xs font-bold ${myStatus === 'confirmed' ? 'bg-green-500/20 text-green-400' : myStatus === 'maybe' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}">✓</span>` : ''}
                      </div>
                      ${creadorRating ? `<span class="text-xs text-yellow-400 font-semibold">⭐ ${creadorRating.toFixed(1)}${creadorReviews > 0 ? ` <span class="text-gray-500">(${creadorReviews})</span>` : ''}</span>` : ''}
                    </div>
                  </div>

                  <!-- ═══ SECCIÓN 2: TÍTULO ═══ -->
                  <h3 class="text-xl font-bold text-white mb-2 leading-tight line-clamp-2" title="${escapeHtml(q.titulo)}">${q.titulo}</h3>

                  <!-- ═══ SECCIÓN 3: UBICACIÓN ═══ -->
                  <div class="flex items-center gap-2 mb-5">
                    <span class="text-orange-400">📍</span>
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
                  <p class="text-sm text-gray-400 line-clamp-2 mb-5">${q.descripcion}</p>` : ''}

                  <!-- ═══ SECCIÓN 6: FEATURES PREMIUM ═══ -->
                  ${q.ruta_coords ? `<div class="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20"><span class="text-xs">🗺️</span><span class="text-xs text-orange-400 font-semibold">Ruta GPS disponible</span></div>` : ''}

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
            html += renderGroup(groups.hoy, t.dateToday, '🔥', 'text-orange-400');
            html += renderGroup(groups.manana, t.dateTomorrow, '📅', 'text-blue-400');
            html += renderGroup(groups.semana, t.dateThisWeek, '📆', 'text-green-400');
            html += renderGroup(groups.proximas, t.dateLater, '🗓️', 'text-gray-400');

            list.innerHTML = html;

            // Cargar clima para cada quedada (asíncrono)
            loadWeatherForQuedadas(filtered);

            // 🎯 Cargar recomendaciones inteligentes (Premium)
            loadSmartRecommendations();
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
                    ${detailConfirmed > 0 ? `<span class="text-green-400 text-xs" title="${t.detailConfirmed}">✅ ${detailConfirmed}${q.max_participantes ? '/' + q.max_participantes : ''}</span>` : ''}
                    ${detailMaybe > 0 ? `<span class="text-yellow-400 text-xs" title="${t.detailMaybe}">🤔 ${detailMaybe}</span>` : ''}
                    ${detailInterested > 0 ? `<span class="text-blue-400 text-xs" title="${t.detailInterested}">👀 ${detailInterested}</span>` : ''}
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
                        <div class="font-bold text-white text-sm truncate">${nombre} ${apellido} ${isMe ? `<span class="text-orange-400 text-xs">(${t.detailYou})</span>` : ''}${isOrg ? ' <span class="text-orange-400">👑</span>' : ''}</div>
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
                        ${cRating ? `<span class="text-sm text-yellow-400 font-bold">⭐ ${cRating.toFixed(1)} <span class="text-gray-500 font-normal">(${cReviews} ${cReviews === 1 ? t.detailReview : t.detailReviews})</span></span>` : `<span class="text-xs text-gray-500">${t.detailNoReviews}</span>`}
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
                newLeaveBtn.innerHTML = `<span>🚪</span> ${t.detailLeave}`;
                actionBtn.parentNode.insertBefore(newLeaveBtn, actionBtn.nextSibling);
            }

            const leaveBtnEl = document.getElementById('detail-leave-btn');

            if (!currentUser) {
                actionBtn.textContent = '🏃 ' + t.detailRegisterToJoin;
                actionBtn.className = 'flex-1 min-w-[200px] py-3 rounded-xl font-black text-base bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 transition';
                actionBtn.onclick = () => { closeModal('modal-quedada-detail'); openModal('modal-register'); };
                if (leaveBtnEl) leaveBtnEl.classList.add('hidden');
            } else if (isCreator) {
                // El creador ve "Tu quedada" con opción de editar/eliminar
                actionBtn.innerHTML = `<span class="flex items-center justify-center gap-2">👑 ${t.detailYourRun}</span>`;
                actionBtn.className = 'flex-1 min-w-[180px] py-3 rounded-xl font-black text-base bg-orange-500/20 text-orange-400 border-2 border-orange-500/40 cursor-default';
                actionBtn.onclick = null;

                // Botón de eliminar para el creador
                if (leaveBtnEl) {
                    leaveBtnEl.classList.remove('hidden');
                    leaveBtnEl.innerHTML = `<span>🗑️</span> ${t.detailDeleteRun}`;
                    leaveBtnEl.className = 'px-4 py-3 rounded-xl font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2 text-sm';
                    leaveBtnEl.onclick = () => {
                        document.getElementById('leave-quedada-id').value = id;
                        const confirmText = document.getElementById('leave-confirm-text');
                        confirmText.innerHTML = '<span class="text-yellow-400 font-bold">⚠️ Eres el creador de esta quedada.</span><br>¿Estás seguro de que quieres eliminarla? Esta acción no se puede deshacer.';
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
                    leaveBtnEl.innerHTML = `<span>🚪</span> ${t.detailLeave}`;
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
                actionBtn.innerHTML = `<span class="flex items-center justify-center gap-2">🚫 Completa (${detailConfirmed}/${q.max_participantes})</span>`;
                actionBtn.className = 'flex-1 min-w-[200px] py-3 rounded-xl font-black text-base bg-red-500/20 text-red-400 border-2 border-red-500/40 cursor-not-allowed';
                actionBtn.onclick = null;
                if (leaveBtnEl) leaveBtnEl.classList.add('hidden');
            } else {
                actionBtn.textContent = '🏃 ' + t.detailJoinRun;
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
                    html: `<div style="background:linear-gradient(135deg,#f97316,#ea580c);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="font-size:14px">🏃</span></div>`,
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
                    btn.innerHTML = '🏁 Registrar mi rendimiento';
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
                    badge.innerHTML = '🔒 Privada';
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

            // Obtener bandera del país del usuario
            const flags = {
                'ES': '🇪🇸', 'PT': '🇵🇹', 'AR': '🇦🇷', 'MX': '🇲🇽', 'CO': '🇨🇴', 'PE': '🇵🇪',
                'CL': '🇨🇱', 'EC': '🇪🇨', 'VE': '🇻🇪', 'UY': '🇺🇾', 'PY': '🇵🇾', 'BO': '🇧🇴',
                'CR': '🇨🇷', 'PA': '🇵🇦', 'GT': '🇬🇹', 'HN': '🇭🇳', 'SV': '🇸🇻', 'NI': '🇳🇮',
                'CU': '🇨🇺', 'DO': '🇩🇴', 'PR': '🇵🇷', 'US': '🇺🇸', 'FR': '🇫🇷', 'IT': '🇮🇹',
                'DE': '🇩🇪', 'GB': '🇬🇧', 'BR': '🇧🇷', 'PH': '🇵🇭', 'GQ': '🇬🇶'
            };
            const countryFlag = flags[userCountry] || '🌍';

            // Obtener traducciones
            const t = I18N[currentLang] || I18N.es;

            // Filtros simplificados: Mi ciudad → Mi país → Mundial
            const filterOptions = [
                {label: '📍 ' + (t.geoMyCity || 'Mi ciudad'), value: 'city'},
                {label: countryFlag + ' ' + (t.geoMyCountry || 'Mi país'), value: 'country'},
                {label: '🌍 ' + (t.geoWorldwide || 'Mundial'), value: 'all'}
            ];

            wrap.innerHTML = '';
            const mkChip = (label, value, active=false) => {
                const div = document.createElement('div');
                div.className = 'chip px-6 py-2.5 rounded-full bg-slate-800 text-sm font-bold whitespace-nowrap' + (active ? ' active' : '');
                div.textContent = label;
                div.onclick = () => filterBy(value, div);
                return div;
            };
            filterOptions.forEach(opt => wrap.appendChild(mkChip(opt.label, opt.value, currentFilter===opt.value)));
        }

        // ========== CONFIGURACIÓN DE NOTIFICACIONES (BIENVENIDA) ==========
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
                if (notifPush && typeof requestPushPermission === 'function') {
                    try {
                        await requestPushPermission();
                    } catch(e) {
                        console.warn('Error activando push:', e);
                    }
                } else {
                    showToast('¡Preferencias guardadas!', 'success');
                }

                // Mostrar CTA para ver quedadas
                setTimeout(() => openModal('modal-onboarding-complete'), 500);
            } catch (err) {
                console.error('Error guardando preferencias:', err);
                showToast('Error al guardar preferencias', 'error');
            }
        }

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
                    const nivelEmoji = { 'Principiante': '🟢', 'Intermedio': '🟡', 'Avanzado': '🔴', 'Elite': '🟣' };
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
                    ratingHtml = `<span class="text-yellow-400">⭐ ${creador.organizer_rating}</span>`;
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
                        ${q.distancia ? `<div class="flex items-center gap-2"><span class="text-orange-500">📏</span><span>${q.distancia} km</span></div>` : ''}
                    </div>
                    <div class="flex items-center gap-2 mt-3 text-sm">
                        <span class="text-green-400" title="Confirmados">✅ ${confirmedCount}</span>
                        ${maybeCount > 0 ? `<span class="text-yellow-400" title="Posiblemente">🤔 ${maybeCount}</span>` : ''}
                        ${interestedCount > 0 ? `<span class="text-blue-400" title="Interesados">👀 ${interestedCount}</span>` : ''}
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
                    ratingHtml = `<div class="text-xs text-yellow-400 mt-1">⭐ ${r.organizer_rating} (${r.total_reviews || 0} reseñas)</div>`;
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
                currentIconEl.textContent = statusBadge.icon;
                currentTextEl.textContent = `Estado actual: ${statusBadge.text}`;

                // Marcar el estado actual
                document.getElementById(`check-${currentStatus}`).classList.remove('hidden');

                // Mostrar botón de abandonar
                leaveBtn.classList.remove('hidden');

                // Cambiar icono del header según estado
                const statusIcons = { confirmed: '✅', maybe: '🤔', interested: '👀' };
                iconEl.innerHTML = `<span class="text-3xl">${statusIcons[currentStatus] || '🏃'}</span>`;
            } else {
                // Usuario no está apuntado - mostrar opciones para unirse
                titleEl.textContent = '¿Cómo de seguro estás?';
                subtitleEl.textContent = 'Ayuda al organizador a planificar';
                currentStatusEl.classList.add('hidden');
                leaveBtn.classList.add('hidden');
                iconEl.innerHTML = '<span class="text-3xl">🏃</span>';
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
                confirmText.innerHTML = '<span class="text-yellow-400 font-bold">⚠️ Eres el creador de esta quedada.</span><br>Si la abandonas y no queda nadie, se eliminará automáticamente.';
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
                confirmText.innerHTML = '<span class="text-yellow-400 font-bold">⚠️ Eres el creador de esta quedada.</span><br>Si la abandonas y no queda nadie, se eliminará automáticamente.';
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
                        if (rpcData && rpcData.status === 'deleted_meetup') {
                            showToast(currentLang==='en'?'Run deleted (no participants left).':(currentLang==='pt'?'Encontro apagado (sem participantes).':'Quedada eliminada (no quedaban participantes).'),'success');
                        } else {
                            showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
                        }
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

                    // Verificar si quedaron participantes
                    const { data: remaining } = await window.supabaseClient
                      .from('participantes')
                      .select('id')
                      .eq('quedada_id', quedadaId);

                    if (!remaining || remaining.length === 0) {
                        // Borrar quedada si no quedan participantes
                        await window.supabaseClient.from('quedadas').delete().eq('id', quedadaId);
                        showToast(currentLang==='en'?'Run deleted (no participants left).':(currentLang==='pt'?'Encontro apagado (sem participantes).':'Quedada eliminada (no quedaban participantes).'),'success');
                    } else {
                        showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
                    }
                }

                await loadQuedadas();
            } catch(e) {
                console.error('Error al abandonar quedada:', e);
                showToast('Error: ' + e.message, 'error');
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
                    showToast(getStatusMessage(status, 'joined', quedadaId), 'success');
                    showConfetti(); // 🎉 Celebración al unirse

                    // Vibración háptica en móviles (feedback físico)
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

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
                confirmed: { icon: '✅', text: 'Confirmado', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
                maybe: { icon: '🤔', text: 'Posiblemente', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                interested: { icon: '👀', text: 'Interesado', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
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
                            if(rpcData && rpcData.status === 'deleted_meetup'){
                                showToast(currentLang==='en'?'Run deleted (no participants left).':(currentLang==='pt'?'Encontro apagado (sem participantes).':'Quedada eliminada (no quedaban participantes).'),'success');
                            } else {
                                showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
                            }
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
                        
                        // Verificar si quedaron participantes
                        const { data: remaining } = await window.supabaseClient
                          .from('participantes')
                          .select('id')
                          .eq('quedada_id', id);
                        
                        if(!remaining || remaining.length === 0){
                            // Borrar quedada si no quedan participantes
                            await window.supabaseClient.from('quedadas').delete().eq('id', id);
                            showToast(currentLang==='en'?'Run deleted (no participants left).':(currentLang==='pt'?'Encontro apagado (sem participantes).':'Quedada eliminada (no quedaban participantes).'),'success');
                        } else {
                            showToast(I18N[currentLang]?.left || (currentLang==='en'?'You left the run':(currentLang==='pt'?'Saíste do encontro':'Has salido de la quedada')),'success');
                        }
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
                console.error('Error en toggleJoin:', e);
                showToast('Error: ' + e.message, 'error');
            }
        }

        async function saveQuedada(){
            const btn = document.querySelector('#modal-crear button[onclick="saveQuedada()"]');
            const btnText = btn ? btn.textContent : '🚀 Publicar';

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

                // Coordenadas del pin fijo
                const lat = parseFloat(document.getElementById('q-lat').value) || (pinCoords?.lat) || null;
                const lng = parseFloat(document.getElementById('q-lng').value) || (pinCoords?.lng) || null;

                // Validaciones
                if(!titulo){
                    showToast('Escribe un título para la quedada','error');
                    if(btn){ btn.disabled = false; btn.textContent = btnText; }
                    return;
                }
                if(!lat || !lng){
                    showToast('Selecciona una ubicación en el mapa','error');
                    if(btn){ btn.disabled = false; btn.textContent = btnText; }
                    return;
                }
                if(!fecha || !hora){
                    showToast('Indica fecha y hora de la quedada','error');
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
                    } catch(_) {}
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
                console.error('Error inesperado:', e);
                showToast('Error inesperado: ' + e.message, 'error');
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
                } catch(_) {}
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
                        const t = I18N[currentLang] || I18N.es;
                        showToast(t.premiumPrefSaved || 'Preferencia guardada', 'success');
                    }
                } catch(_) {}
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
                } catch(_) {}
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
        async function checkPremiumStatus() {
            if (!currentUser) {
                isUserPremium = false;
                updatePremiumUI();
                return;
            }

            try {
                const sb = await getSupabaseClientOrToast(8000, false);
                if (!sb) return;

                // Verificar en tabla profiles (campo es_premium)
                const { data, error } = await sb
                    .from('profiles')
                    .select('es_premium')
                    .eq('id', currentUser.id)
                    .single();

                if (data && data.es_premium === true) {
                    isUserPremium = true;
                    window.isUserPremium = true;
                } else {
                    isUserPremium = false;
                    window.isUserPremium = false;
                }
            } catch (e) {
                console.warn('Error checking premium status:', e);
                isUserPremium = false;
                window.isUserPremium = false;
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

            // También actualizar estadísticas premium si existe la función
            if (typeof updateStatsUI === 'function') {
                try { updateStatsUI(); } catch(e) {}
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

                // Cargar badges
                loadUserBadges(asistidas, creadas);

            } catch (e) {
                console.warn('Error en loadGamificationStats:', e);
            }
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
                        { icon: '🏃', name: currentLang === 'en' ? 'First Run' : 'Primera Carrera', desc: currentLang === 'en' ? 'Join your first run' : 'Asiste a tu primera quedada', current: _q, target: 1, unlocked: _q >= 1 },
                        { icon: '👑', name: currentLang === 'en' ? 'Leader' : 'Líder', desc: currentLang === 'en' ? 'Create your first run' : 'Crea tu primera quedada', current: _c, target: 1, unlocked: _c >= 1 },
                        { icon: '👥', name: currentLang === 'en' ? 'Social Runner' : 'Social Runner', desc: currentLang === 'en' ? 'Meet 5 different runners' : 'Conoce a 5 runners diferentes', current: _r, target: 5, unlocked: _r >= 5 },
                        { icon: '🎖️', name: currentLang === 'en' ? 'Veteran' : 'Veterano', desc: currentLang === 'en' ? 'Complete 10 runs' : 'Completa 10 quedadas', current: _q, target: 10, unlocked: _q >= 10 },
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
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
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
                                <div class="font-bold text-white truncate">${r.nombre || ''} ${r.apellidos || ''} ${isPremium ? '⭐' : ''}</div>
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
                                <span class="text-3xl mb-2 block">📍</span>
                                <p class="text-white font-bold text-sm mb-1">${quedadasCount > 0 ? (currentLang === 'en' ? `${quedadasCount} runs waiting for you` : `${quedadasCount} quedadas te esperan`) : (currentLang === 'en' ? 'No runs yet' : 'Sin quedadas aún')}</p>
                                <p class="text-gray-400 text-xs mb-3">${currentLang === 'en' ? 'Join one and meet your running crew' : 'Únete a una y conoce tu grupo de running'}</p>
                                <button onclick="closeModal('modal-profile'); scrollToQuedadas()" class="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/25 transition flex items-center justify-center gap-2">
                                    📍 ${currentLang === 'en' ? 'Discover runs' : 'Descubrir quedadas'}
                                </button>
                            </div>
                            <p class="text-gray-500 text-xs mb-2">${currentLang === 'en' ? 'Or create your own:' : '¿O prefieres crear la tuya?'}</p>
                            <button onclick="closeModal('modal-profile'); openModalCrear()" class="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-1 w-full">
                                🏃 ${currentLang === 'en' ? 'Create my run' : 'Crear mi quedada'}
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
                                <p class="text-xs text-gray-400 truncate">📍 ${q.punto_encuentro || q.ciudad || (currentLang === 'en' ? 'No location' : 'Sin ubicación')}</p>
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
                title.innerHTML = '<span>👥</span> Seguidores';
                subtitle.textContent = 'Personas que te siguen';
            } else {
                title.innerHTML = '<span>👤</span> Siguiendo';
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
                            <span class="text-4xl mb-3 block">${type === 'seguidores' ? '👥' : '🔍'}</span>
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
                                <div class="user-list-name">${u.nombre || ''} ${u.apellidos || ''} ${isPremium ? '⭐' : ''}</div>
                                <div class="user-list-meta">
                                    ${u.nivel ? `<span>${getNivelEmoji(u.nivel)} ${u.nivel}</span>` : ''}
                                    ${u.ciudad ? `<span>📍 ${u.ciudad}</span>` : ''}
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
            if (n === 'principiante') return '🌱';
            if (n === 'intermedio') return '🏃';
            if (n === 'avanzado') return '🔥';
            if (n === 'elite') return '⚡';
            return '🌱';
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
                            ${isPremium ? '<span class="ml-1">⭐</span>' : ''}
                            ${profile.verification_badge ? '<span class="ml-1 text-blue-400">✓</span>' : ''}
                        </h3>

                        <!-- Nivel y ciudad -->
                        <p class="text-gray-400 text-sm mb-4">
                            ${profile.nivel ? `${getNivelEmoji(profile.nivel)} ${profile.nivel.charAt(0).toUpperCase() + profile.nivel.slice(1)}` : ''}
                            ${profile.nivel && profile.ciudad ? ' • ' : ''}
                            ${profile.ciudad ? `📍 ${profile.ciudad}` : ''}
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

                        <!-- Botón seguir -->
                        ${isMe ? '' : `
                            <button id="btn-follow-profile" class="btn-follow ${isFollowing ? 'following' : 'not-following'} px-8 py-3" onclick="toggleFollow('${userId}', this)">
                                ${isFollowing ? '✓ Siguiendo' : 'Seguir'}
                            </button>
                        `}
                    </div>

                    <!-- Stats de running -->
                    <div class="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                        <h4 class="text-sm font-bold text-gray-400 mb-3">📊 Estadísticas</h4>
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
                'sales-f7-title','sales-f7-desc','sales-extra-title','sales-compare-title',
                'sales-col-free','sales-col-premium','sales-row-quedadas','sales-row-participantes',
                'sales-row-stats','sales-row-comentarios','sales-row-heatmap','sales-row-privadas',
                'sales-row-gps','sales-row-ads','sales-price-badge','sales-price-period','sales-price-desc',
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
                'sales-extra-title':'salesExtraTitle',
                'sales-compare-title':'salesCompareTitle',
                'sales-col-free':'salesColFree','sales-col-premium':'salesColPremium',
                'sales-row-quedadas':'salesRowQuedadas','sales-row-participantes':'salesRowParticipantes',
                'sales-row-stats':'salesRowStats','sales-row-comentarios':'salesRowComentarios',
                'sales-row-heatmap':'salesRowHeatmap','sales-row-privadas':'salesRowPrivadas',
                'sales-row-gps':'salesRowGps','sales-row-ads':'salesRowAds',
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
                        user_id: currentUser.id,
                        email: currentUser.email,
                        success_url: window.location.origin + '/?premium=success',
                        cancel_url: window.location.origin + '/?premium=canceled'
                    })
                });

                const data = await response.json();
                console.log('Checkout response:', data);

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
                console.error('Error checkout:', e);
                showToast('Error al iniciar el pago: ' + e.message, 'error');
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
                        user_id: currentUser.id,
                        email: currentUser.email,
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
                } catch(e) {}
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
                content.innerHTML=`<div class="p-4 border-b border-slate-800"><button onclick="sidebarView='communities';renderSidebar()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-4"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>Volver</button><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style="background:${c.color}20">${c.icon}</div><div><h3 class="font-bold">${c.name}</h3><p class="text-sm text-gray-500">${c.members} miembros</p></div></div></div><div class="p-4 border-b border-slate-800"><button onclick="sidebarView='newTopic';renderSidebar()" class="w-full btn-gradient py-3 rounded-xl font-bold text-sm">Nuevo tema</button></div><div class="p-4">${topics.map(t=>`<div onclick="selectTopic(${t.id})" class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-3 cursor-pointer hover:border-orange-500/30">${t.pinned?'<span class="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold mb-2 inline-block">📌</span>':''}<h4 class="font-bold mb-2">${t.title}</h4><div class="flex justify-between text-sm text-gray-500"><span>${t.author}</span><span>${t.replies} resp</span></div></div>`).join('')}</div>`;
            }else if(sidebarView==='messages'){
                const topic=(forumTopics[selectedCommunity]||[]).find(t=>t.id===selectedTopic);const messages=forumMessages[selectedTopic]||[];
                content.innerHTML=`<div class="p-4 border-b border-slate-800"><button onclick="sidebarView='topics';renderSidebar()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-3"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>Volver</button><h3 class="font-bold">${topic?.title||'Tema'}</h3></div><div class="flex-1 overflow-y-auto p-4" style="max-height:calc(100vh - 280px)">${messages.map(m=>`<div class="message-bubble mb-4"><div class="flex items-start gap-3"><div class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-xl">${m.avatar}</div><div class="flex-1"><div class="flex items-center gap-2 mb-1"><span class="font-bold text-sm">${m.author}</span><span class="text-xs text-gray-500">${m.time}</span></div><p class="text-gray-300 bg-slate-800 rounded-2xl rounded-tl-none p-3 text-sm">${m.content}</p></div></div></div>`).join('')}</div><div class="p-4 border-t border-slate-800"><div class="flex gap-3"><input type="text" id="new-message" placeholder="Escribe..." class="input-dark flex-1 px-4 py-3 rounded-xl text-sm" aria-label="Escribe..."><button onclick="sendMessage()" class="btn-gradient px-4 py-3 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></button></div></div>`;
            }else if(sidebarView==='newTopic'){
                content.innerHTML=`<div class="p-4 border-b border-slate-800"><button onclick="sidebarView='topics';renderSidebar()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-3"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>Volver</button><h3 class="font-bold">Nuevo tema</h3></div><div class="p-4"><input type="text" id="topic-title" placeholder="Título..." class="input-dark w-full px-4 py-3 rounded-xl mb-4" aria-label="Título..."><textarea id="topic-content" placeholder="Mensaje..." rows="6" class="input-dark w-full px-4 py-3 rounded-xl resize-none mb-4" aria-label="Mensaje..."></textarea><button onclick="createTopic()" class="w-full btn-gradient py-3 rounded-xl font-bold">Publicar</button></div>`;
            }
        }

        // selectCommunity/selectTopic: online-aware versions are defined above.

        // createTopic/sendMessage: online-aware versions are defined above.
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
        try {
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
        try{ await checkPremiumStatus(); }catch(_){}
        try{ checkPremiumUrlParams(); }catch(_){}
        // Mostrar popup premium al cargar sesión existente (después de verificar estado premium)
        try{ maybeShowPremiumPromo(); }catch(_){}
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
        console.log('OAuth check:', { __cjHasCode, __cjIsRecovery, __cjIsStravaCallback, search: window.location.search });
        if(__cjHasCode && !__cjIsRecovery && !__cjIsStravaCallback){
          const sp = new URLSearchParams(window.location.search || '');
          const code = sp.get('code');
          console.log('OAuth code found:', code ? code.substring(0,20)+'...' : null);
          if(code){
            try{
              console.log('Calling exchangeCodeForSession...');
              const { data: oauthData, error: oauthErr } = await sb.auth.exchangeCodeForSession(code);
              console.log('exchangeCodeForSession result:', { hasData: !!oauthData, hasSession: !!(oauthData && oauthData.session), error: oauthErr });
              if(oauthErr){
                console.warn('OAuth exchangeCodeForSession:', oauthErr.message);
                showToast('Error al iniciar sesión con Google: ' + oauthErr.message, 'error');
              } else if(oauthData && oauthData.session){
                __cjOAuthSessionEstablished = true;
                console.log('OAuth session established!');
                // Limpia el code de la URL
                try{
                  const u = new URL(window.location.href);
                  u.searchParams.delete('code');
                  window.history.replaceState({}, document.title, u.toString());
                }catch(_){ }
                // Hidratar usuario y mostrar la app
                await hydrateUserFromSession();
                console.log('After hydrate, currentUser:', window.currentUser);
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
                  console.log('No currentUser after OAuth, may need profile completion');
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
        console.warn("Supabase session check:", e && e.message ? e.message : e);
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
            // Mostrar popup premium si es un login (no recarga de página)
            if(event === 'SIGNED_IN') {
              try{ maybeShowPremiumPromo(); }catch(_){}
            }
            // Procesar callback de Strava si hay código de Strava en la URL
            const stravaParams = new URLSearchParams(window.location.search || '');
            const stravaScope = stravaParams.get('scope');
            const stravaCode = stravaParams.get('code');
            if(stravaCode && stravaScope && (stravaScope.includes('read') || stravaScope.includes('activity'))) {
              console.log('Procesando callback de Strava...');
              try {
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

