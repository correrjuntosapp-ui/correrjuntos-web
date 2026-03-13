// ========================= PREMIUM FEATURES =========================
// C4: Extracted from app.js to reduce initial bundle size.
// Loaded on-demand when matching screen is opened or premium features are needed.
// All functions access globals from app.js (currentUser, currentLang, isUserPremium, etc.)

(function(){
    'use strict';

    /* ══════════════════════════════════════════════
       MATCHING PREVIEW (Dashboard)
       ══════════════════════════════════════════════ */

    window.renderMatchingPreview = function() {
        var section = document.getElementById('matching-preview-section');
        var list = document.getElementById('matching-preview-list');
        if (!section || !list || !currentUser || !currentUser.ciudad) return;
        var runnerMap = new Map();
        var today = new Date().toISOString().split('T')[0];
        quedadas.filter(function(q){ return q.ciudad && q.ciudad.toLowerCase() === currentUser.ciudad.toLowerCase() && q.fecha >= today; }).forEach(function(q){
            (q.asistentes_info || []).forEach(function(a){
                if (a.user_id !== currentUser.id && !runnerMap.has(a.user_id)) {
                    runnerMap.set(a.user_id, { id: a.user_id, nombre: a.nombre || 'Runner', photo: a.photo_url || '', nivel: q.nivel || '' });
                }
            });
        });
        var runners = Array.from(runnerMap.values()).slice(0, 4);
        if (runners.length === 0) return;
        section.classList.remove('hidden');
        list.innerHTML = runners.map(function(r){
            var initials = (r.nombre || 'R').charAt(0).toUpperCase();
            var photo = r.photo ? '<img src="'+r.photo+'" class="w-10 h-10 rounded-full object-cover" alt="" loading="lazy"/>' : '<div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white text-sm">'+initials+'</div>';
            return '<div class="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center cursor-pointer hover:border-orange-500/30 transition" onclick="openUserProfile(\''+r.id+'\'); trackPremiumCTA(\'matching\')"><div class="flex justify-center mb-2">'+photo+'</div><p class="text-sm font-semibold text-white truncate">'+r.nombre+'</p><p class="text-xs text-gray-500">'+(r.nivel || currentUser.ciudad)+'</p><button class="mt-2 text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold hover:bg-orange-500/30 transition">Conectar</button></div>';
        }).join('');
    };

    window.renderSmartAlertsPreview = function() {
        var section = document.getElementById('smart-alerts-section');
        var list = document.getElementById('alerts-preview-list');
        var countEl = document.getElementById('alerts-count');
        if (!section || !list || !currentUser) return;
        if (typeof getEffectivePlan === 'function' && getEffectivePlan() === 'premium') { section.classList.add('hidden'); return; }
        var today = new Date().toISOString().split('T')[0];
        var matching = quedadas.filter(function(q){
            return q.fecha >= today && q.ciudad &&
                q.ciudad.toLowerCase() === (currentUser.ciudad || '').toLowerCase() &&
                (!currentUser.nivel || !q.nivel || q.nivel === currentUser.nivel || q.nivel === 'Todos');
        }).slice(0, 3);
        if (matching.length === 0) return;
        section.classList.remove('hidden');
        if (countEl) countEl.textContent = matching.length;
        list.innerHTML = matching.map(function(q, i){
            if (i === 0) {
                return '<div class="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50"><span class="text-orange-400">\uD83C\uDFC3</span><div class="flex-1 min-w-0"><p class="text-sm text-white font-semibold truncate">'+q.titulo+'</p><p class="text-xs text-gray-500">'+(q.hora || '')+' \xB7 '+(q.nivel || '')+'</p></div><span class="text-xs text-green-400 font-semibold">'+(q.asistentes_info || []).filter(function(a){ return a.status === 'confirmed' || !a.status; }).length+' runners</span></div>';
            }
            return '<div class="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 opacity-50"><span class="text-gray-500">\uD83D\uDD12</span><div class="flex-1 min-w-0"><p class="text-sm text-gray-500 font-semibold blur-sm">'+q.titulo+'</p><p class="text-xs text-gray-600 blur-sm">'+(q.hora || '')+'</p></div></div>';
        }).join('');
    };

    /* ══════════════════════════════════════════════
       PREMIUM PAYWALL
       ══════════════════════════════════════════════ */

    var PREMIUM_COPY = {
        create_meetup_limit: {
            icon: '\uD83D\uDCC5', title: 'Crea quedadas ilimitadas', titleEN: 'Create unlimited runs',
            bullets: ['Organiza tu propio grupo', 'Aparece primero en tu ciudad', 'M\u00e1s visibilidad para tus quedadas'],
            bulletsEN: ['Organize your own group', 'Appear first in your city', 'More visibility for your runs']
        },
        advanced_filters: {
            icon: '\uD83D\uDD0D', title: 'Encuentra tu ritmo ideal', titleEN: 'Find your ideal pace',
            bullets: ['Filtra por pace real', 'Evita grupos incompatibles', 'Ahorra tiempo y encuentra tu nivel'],
            bulletsEN: ['Filter by real pace', 'Avoid incompatible groups', 'Save time and find your level']
        },
        direct_messages: {
            icon: '\uD83D\uDCAC', title: 'Mensajes privados', titleEN: 'Private messages',
            bullets: ['Habla 1 a 1 con corredores', 'Coordina entrenamientos m\u00e1s f\u00e1cil', 'Crea tu grupo estable'],
            bulletsEN: ['Talk 1-on-1 with runners', 'Coordinate training easier', 'Build your stable group']
        },
        matching_preview: {
            icon: '\uD83C\uDFC3', title: 'Encuentra runners compatibles', titleEN: 'Find compatible runners',
            bullets: ['Filtros por ritmo real y nivel', 'Runners en tu zona y horario', 'Conecta y corre acompa\u00f1ado'],
            bulletsEN: ['Filter by real pace and level', 'Runners in your area and schedule', 'Connect and run together']
        },
        smart_alerts: {
            icon: '\uD83D\uDD14', title: 'Alertas inteligentes', titleEN: 'Smart alerts',
            bullets: ['Notificaciones de quedadas compatibles', 'Filtrado por nivel y distancia', 'No te pierdas tu quedada ideal'],
            bulletsEN: ['Notifications for compatible runs', 'Filtered by level and distance', 'Never miss your ideal run']
        }
    };

    window.openPremiumModal = function(featureKey) {
        var copy = PREMIUM_COPY[featureKey];
        if (!copy) { if(typeof openPremiumSales==='function') openPremiumSales(); return; }
        var isEN = currentLang === 'en';
        var iconEl = document.getElementById('paywall-icon');
        var titleEl = document.getElementById('paywall-title');
        var bulletsEl = document.getElementById('paywall-bullets');
        if (iconEl) iconEl.textContent = copy.icon;
        if (titleEl) titleEl.textContent = isEN ? copy.titleEN : copy.title;
        var bullets = isEN ? copy.bulletsEN : copy.bullets;
        if (bulletsEl) bulletsEl.innerHTML = bullets.map(function(b){
            return '<li class="flex items-start gap-2 text-gray-300 text-sm"><span class="text-green-400 mt-0.5">\u2713</span>'+b+'</li>';
        }).join('');
        openModal('modal-premium-paywall');
        if (typeof gtag === 'function') gtag('event', 'premium_paywall_view', { feature: featureKey });
    };

    /* ══════════════════════════════════════════════
       ENHANCED PREMIUM STATS
       ══════════════════════════════════════════════ */

    window.loadEnhancedStats = async function() {
        if (!isUserPremium || !currentUser) return;
        try {
            var sb = await getSupabaseClientOrToast(5000, false);
            if (!sb) return;

            var result = await sb.from('participantes')
                .select('ritmo_real, distancia_real, completed_at, quedada_id, quedadas(ciudad, fecha)')
                .eq('user_id', currentUser.id)
                .not('completed_at', 'is', null)
                .limit(200);
            var participaciones = result.data;
            if (!participaciones || !participaciones.length) return;

            var paces = participaciones
                .filter(function(p){ return p.ritmo_real; })
                .map(function(p){
                    var m = p.ritmo_real.match(/(\d+):(\d+)/);
                    return m ? parseInt(m[1]) + parseInt(m[2])/60 : 0;
                })
                .filter(function(v){ return v > 0; });
            var bestPace = paces.length ? Math.min.apply(null, paces) : null;

            var distances = participaciones.filter(function(p){ return p.distancia_real; }).map(function(p){ return parseFloat(p.distancia_real); });
            var longest = distances.length ? Math.max.apply(null, distances) : null;

            var cityCount = {};
            participaciones.forEach(function(p){
                var c = p.quedadas && p.quedadas.ciudad;
                if (c) cityCount[c] = (cityCount[c] || 0) + 1;
            });
            var citySorted = Object.entries(cityCount).sort(function(a, b){ return b[1] - a[1]; });
            var favCity = citySorted.length ? citySorted[0][0] : null;

            var now = new Date();
            var thisMonthNum = now.getMonth();
            var lastMonthNum = (thisMonthNum - 1 + 12) % 12;
            var thisYear = now.getFullYear();

            var thisMonth = participaciones.filter(function(p){
                var d = new Date(p.completed_at);
                return d.getMonth() === thisMonthNum && d.getFullYear() === thisYear;
            });
            var lastMonth = participaciones.filter(function(p){
                var d = new Date(p.completed_at);
                return d.getMonth() === lastMonthNum;
            });

            var statBestPace = document.getElementById('stat-best-pace');
            var statLongest = document.getElementById('stat-longest');
            var statFavCity = document.getElementById('stat-fav-city');

            if (statBestPace && bestPace) {
                var mins = Math.floor(bestPace);
                var secs = Math.round((bestPace - mins) * 60);
                statBestPace.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
            }
            if (statLongest && longest) statLongest.textContent = longest.toFixed(1) + ' km';
            if (statFavCity && favCity) statFavCity.textContent = favCity;

            var comp = document.getElementById('stat-monthly-comparison');
            if (comp) {
                var thisKm = thisMonth.reduce(function(s, p){ return s + (parseFloat(p.distancia_real) || 0); }, 0);
                var lastKm = lastMonth.reduce(function(s, p){ return s + (parseFloat(p.distancia_real) || 0); }, 0);
                var qArrow = thisMonth.length >= lastMonth.length ? '\u2191' : '\u2193';
                var qColor = thisMonth.length >= lastMonth.length ? 'text-green-400' : 'text-red-400';
                var kmArrow = thisKm >= lastKm ? '\u2191' : '\u2193';
                var kmColor = thisKm >= lastKm ? 'text-green-400' : 'text-red-400';

                comp.innerHTML = '<div><div class="text-lg font-bold text-white">'+thisMonth.length+'</div><div class="text-[10px] text-gray-500">Quedadas</div><div class="text-xs '+qColor+'">'+qArrow+' vs '+lastMonth.length+'</div></div>' +
                    '<div><div class="text-lg font-bold text-white">'+thisKm.toFixed(1)+'</div><div class="text-[10px] text-gray-500">Km</div><div class="text-xs '+kmColor+'">'+kmArrow+' vs '+lastKm.toFixed(1)+'</div></div>' +
                    '<div><div class="text-lg font-bold text-white">'+(bestPace ? Math.floor(bestPace)+':'+Math.round((bestPace - Math.floor(bestPace))*60).toString().padStart(2,'0') : '--')+'</div><div class="text-[10px] text-gray-500">Mejor ritmo</div></div>';
            }
        } catch (e) {
            console.warn('Enhanced stats error:', e);
        }
    };

    /* ══════════════════════════════════════════════
       PREMIUM PROMO POPUP
       ══════════════════════════════════════════════ */

    window.maybeShowPremiumPromo = function() {
        if (isUserPremium) return;
        var lastShown = localStorage.getItem('cj_premium_promo_last');
        var now = Date.now();
        var sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (lastShown) {
            var elapsed = now - parseInt(lastShown);
            if (elapsed < sevenDays) return;
        }
        setTimeout(function(){
            if(typeof openPremiumSales === 'function') openPremiumSales();
            localStorage.setItem('cj_premium_promo_last', now.toString());
        }, 2000);
    };

    /* ══════════════════════════════════════════════
       RUNNER MATCHING (full module)
       ══════════════════════════════════════════════ */

    var MATCHING_DAYS_ES = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
    var MATCHING_DAYS_SHORT = ['L','M','X','J','V','S','D'];
    var MATCHING_HORARIOS = ['manana','mediodia','tarde','noche'];
    var MATCHING_HORARIOS_LABELS_ES = {'manana':'Ma\u00f1ana','mediodia':'Mediod\u00eda','tarde':'Tarde','noche':'Noche'};
    var MATCHING_HORARIOS_LABELS_EN = {'manana':'Morning','mediodia':'Midday','tarde':'Afternoon','noche':'Night'};
    var MATCHING_OBJETIVOS_ES = ['mantenimiento','5k','10k','media','maraton','trail','social'];
    var MATCHING_OBJETIVOS_LABELS_ES = {'mantenimiento':'Mantenimiento','5k':'5K','10k':'10K','media':'Media marat\u00f3n','maraton':'Marat\u00f3n','trail':'Trail','social':'Social'};
    var MATCHING_OBJETIVOS_LABELS_EN = {'mantenimiento':'Maintenance','5k':'5K','10k':'10K','media':'Half marathon','maraton':'Marathon','trail':'Trail','social':'Social'};

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

    function initMatchingProfileForm(){
        var minSel = document.getElementById('mp-ritmo-min');
        var maxSel = document.getElementById('mp-ritmo-max');
        if(!minSel || minSel.options.length > 1) return;
        var paces = buildPaceOptions();
        paces.forEach(function(p){
            minSel.add(new Option(p, p));
            maxSel.add(new Option(p, p));
        });
        minSel.value = '5:00';
        maxSel.value = '6:00';

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

        var objSel = document.getElementById('mp-objetivo');
        if(objSel && objSel.options.length <= 1){
            objSel.innerHTML = '';
            var objLabels = currentLang === 'en' ? MATCHING_OBJETIVOS_LABELS_EN : MATCHING_OBJETIVOS_LABELS_ES;
            MATCHING_OBJETIVOS_ES.forEach(function(o){
                objSel.add(new Option(objLabels[o], o));
            });
        }

        var bioEl = document.getElementById('mp-bio');
        var countEl = document.getElementById('mp-bio-count');
        if(bioEl && countEl){
            bioEl.addEventListener('input', function(){ countEl.textContent = this.value.length; });
        }
    }

    async function loadMatchingProfileForm(){
        if(!currentUser) return;
        var sb = await getSupabaseClientOrToast(8000, false);
        if(!sb) return;
        var result = await sb.from('profiles').select('ritmo_min,ritmo_max,dias_preferidos,horario_preferido,objetivo,bio_matching,matching_visible').eq('id', currentUser.id).single();
        var data = result.data;
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

    window.saveMatchingProfile = async function(){
        if(!currentUser){ showToast('Inicia sesi\u00f3n primero','error'); return; }
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

        var result = await sb.from('profiles').update({
            ritmo_min: ritmoMin, ritmo_max: ritmoMax, dias_preferidos: dias,
            horario_preferido: horario, objetivo: objetivo, bio_matching: bio, matching_visible: visible
        }).eq('id', currentUser.id);

        if(result.error){
            showToast('Error al guardar: ' + result.error.message, 'error');
            return;
        }

        showToast(currentLang === 'en' ? 'Matching profile saved!' : 'Perfil de matching guardado!', 'success');
        closeModal('modal-matching-profile');
        if(document.getElementById('modal-matching') && document.getElementById('modal-matching').classList.contains('active')){
            loadMatchingResults();
        }
    };

    window.openMatchingScreen = async function(){
        if(!currentUser){ openModal('modal-login'); return; }

        initMatchingProfileForm();
        openModal('modal-matching');

        var cityLabel = document.getElementById('matching-city-label');
        if(cityLabel && currentUser.ciudad){
            cityLabel.textContent = '\uD83D\uDCCD ' + currentUser.ciudad;
        }

        var sb = await getSupabaseClientOrToast(8000, false);
        if(!sb) return;
        var result = await sb.from('profiles').select('ritmo_min,dias_preferidos').eq('id', currentUser.id).single();
        var data = result.data;

        if(!data || !data.ritmo_min || !data.dias_preferidos || data.dias_preferidos.length === 0){
            closeModal('modal-matching');
            loadMatchingProfileForm();
            openModal('modal-matching-profile');
            return;
        }

        loadMatchingResults();
        loadMatchingRequests();
    };

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

        var result = await sb.rpc('find_compatible_runners', { p_limit: 20 });

        loading.classList.add('hidden');

        if(result.error){
            console.warn('Matching error:', result.error.message);
            empty.classList.remove('hidden');
            return;
        }

        var data = result.data;
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
                cards.innerHTML += html;
            } else if(!isUserPremium){
                blurred.innerHTML += html;
            } else {
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
        var name = runner.nombre || 'Runner';
        var verified = runner.verification_badge ? ' <span title="Verificado" style="color:#22c55e;font-size:.75rem">\u2713</span>' : '';
        var score = runner.score || 0;
        var scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#94a3b8';

        var ritmo = '';
        if(runner.ritmo_min && runner.ritmo_max) ritmo = runner.ritmo_min + '-' + runner.ritmo_max + '/km';

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
                (ritmo ? '<div class="flex items-center gap-1 mt-1"><span class="text-gray-500 text-xs">\u23F1\uFE0F</span><span class="text-gray-300 text-xs">' + ritmo + '</span>' + (nivel ? '<span class="text-gray-600 text-xs">\xB7</span><span class="text-gray-400 text-xs">' + nivel + '</span>' : '') + '</div>' : '') +
                (dias || horario ? '<div class="flex items-center gap-1 mt-0.5"><span class="text-gray-500 text-xs">\uD83D\uDCC5</span><span class="text-gray-300 text-xs">' + dias + (horario ? ' ' + horario.toLowerCase() : '') + '</span></div>' : '') +
                (objetivo ? '<div class="flex items-center gap-1 mt-0.5"><span class="text-gray-500 text-xs">\uD83C\uDFAF</span><span class="text-gray-400 text-xs">' + objetivo + '</span></div>' : '') +
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

    window.sendMatchRequest = async function(toUserId){
        if(!currentUser){ showToast('Inicia sesi\u00f3n','error'); return; }
        if(!isUserPremium){ openModal('modal-premium-sales'); return; }
        var sb = await getSupabaseClientOrToast(8000);
        if(!sb) return;

        var result = await sb.from('match_requests').insert({
            from_user_id: currentUser.id, to_user_id: toUserId, status: 'pending'
        });

        if(result.error){
            if(result.error.code === '23505'){
                showToast(currentLang === 'en' ? 'Request already sent' : 'Solicitud ya enviada', 'info');
            } else {
                showToast('Error: ' + result.error.message, 'error');
            }
            return;
        }

        showToast(currentLang === 'en' ? 'Request sent!' : 'Solicitud enviada!', 'success');
        loadMatchingResults();
        loadMatchingRequests();
    };

    async function loadMatchingRequests(){
        if(!currentUser) return;
        var sb = await getSupabaseClientOrToast(8000, false);
        if(!sb) return;

        var isEN = currentLang === 'en';

        var reqResult = await sb.from('match_requests')
            .select('id,from_user_id,to_user_id,status,message,created_at')
            .or('from_user_id.eq.' + currentUser.id + ',to_user_id.eq.' + currentUser.id)
            .order('created_at', { ascending: false });

        var requests = reqResult.data || [];

        var received = requests.filter(function(r){ return r.to_user_id === currentUser.id && r.status === 'pending'; });
        var sent = requests.filter(function(r){ return r.from_user_id === currentUser.id && r.status === 'pending'; });
        var accepted = requests.filter(function(r){ return r.status === 'accepted'; });

        var userIds = [];
        requests.forEach(function(r){
            if(r.from_user_id !== currentUser.id && userIds.indexOf(r.from_user_id) < 0) userIds.push(r.from_user_id);
            if(r.to_user_id !== currentUser.id && userIds.indexOf(r.to_user_id) < 0) userIds.push(r.to_user_id);
        });

        var profiles = {};
        if(userIds.length > 0){
            var profResult = await sb.from('profiles').select('id,nombre,photo_url,ciudad,nivel').in('id', userIds);
            if(profResult.data) profResult.data.forEach(function(p){ profiles[p.id] = p; });
        }

        function defaultPhoto(name){
            return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23334155" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="40">' + ((name||'?').charAt(0).toUpperCase()) + '</text></svg>';
        }

        var receivedEl = document.getElementById('matching-received-list');
        var noReceived = document.getElementById('matching-no-received');
        if(received.length === 0){
            receivedEl.innerHTML = '';
            if(noReceived){ receivedEl.appendChild(noReceived); noReceived.classList.remove('hidden'); }
        } else {
            receivedEl.innerHTML = received.map(function(r){
                var p = profiles[r.from_user_id] || {};
                var photo = p.photo_url || defaultPhoto(p.nombre);
                return '<div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">' +
                    '<img src="' + photo + '" class="w-10 h-10 rounded-full object-cover border border-slate-700">' +
                    '<div class="flex-1"><h4 class="font-bold text-white text-sm">' + escapeHtml(p.nombre || 'Runner') + '</h4>' +
                    '<p class="text-gray-500 text-xs">' + escapeHtml(p.ciudad || '') + (p.nivel ? ' \xB7 ' + escapeHtml(p.nivel) : '') + '</p></div>' +
                    '<div class="flex gap-2">' +
                      '<button onclick="respondMatchRequest(\'' + r.id + '\',\'accepted\')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">' + (isEN ? 'Accept' : 'Aceptar') + '</button>' +
                      '<button onclick="respondMatchRequest(\'' + r.id + '\',\'rejected\')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">' + (isEN ? 'Decline' : 'Rechazar') + '</button>' +
                    '</div></div>';
            }).join('');
        }

        var sentEl = document.getElementById('matching-sent-list');
        var noSent = document.getElementById('matching-no-sent');
        if(sent.length === 0){
            sentEl.innerHTML = '';
            if(noSent){ sentEl.appendChild(noSent); noSent.classList.remove('hidden'); }
        } else {
            sentEl.innerHTML = sent.map(function(r){
                var p = profiles[r.to_user_id] || {};
                var photo = p.photo_url || defaultPhoto(p.nombre);
                return '<div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">' +
                    '<img src="' + photo + '" class="w-10 h-10 rounded-full object-cover border border-slate-700">' +
                    '<div class="flex-1"><h4 class="font-bold text-white text-sm">' + escapeHtml(p.nombre || 'Runner') + '</h4>' +
                    '<p class="text-gray-500 text-xs">' + escapeHtml(p.ciudad || '') + '</p></div>' +
                    '<span class="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">' + (isEN ? 'Pending' : 'Pendiente') + '</span></div>';
            }).join('');
        }

        var acceptedEl = document.getElementById('matching-accepted-list');
        var noAccepted = document.getElementById('matching-no-accepted');
        if(accepted.length === 0){
            acceptedEl.innerHTML = '';
            if(noAccepted){ acceptedEl.appendChild(noAccepted); noAccepted.classList.remove('hidden'); }
        } else {
            acceptedEl.innerHTML = accepted.map(function(r){
                var otherId = r.from_user_id === currentUser.id ? r.to_user_id : r.from_user_id;
                var p = profiles[otherId] || {};
                var photo = p.photo_url || defaultPhoto(p.nombre);
                return '<div class="bg-green-500/5 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">' +
                    '<img src="' + photo + '" class="w-10 h-10 rounded-full object-cover border-2 border-green-500/30">' +
                    '<div class="flex-1"><h4 class="font-bold text-white text-sm">' + escapeHtml(p.nombre || 'Runner') + '</h4>' +
                    '<p class="text-gray-500 text-xs">' + escapeHtml(p.ciudad || '') + (p.nivel ? ' \xB7 ' + escapeHtml(p.nivel) : '') + '</p></div>' +
                    '<span class="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">\u2713 Match</span></div>';
            }).join('');
        }
    }

    window.respondMatchRequest = async function(requestId, status){
        var sb = await getSupabaseClientOrToast(8000);
        if(!sb) return;

        var result = await sb.from('match_requests').update({
            status: status, updated_at: new Date().toISOString()
        }).eq('id', requestId);

        if(result.error){
            showToast('Error: ' + result.error.message, 'error');
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

    // Signal that premium features are loaded
    window._premiumFeaturesLoaded = true;
    console.log('[Premium Features] Module loaded');

})();
