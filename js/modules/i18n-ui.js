/**
 * i18n-ui.js — Language UI application module
 * Extracted from app.js to reduce monolith size.
 * Exposes: applyLanguageUI, updateMetaTags, changeLanguage, STORAGE_LANG
 */
(function(){
    'use strict';

    var STORAGE_LANG = 'cj_lang';
    window.STORAGE_LANG = STORAGE_LANG;

    function applyLanguageUI(){
        var t = I18N[currentLang] || I18N.es;
        if(!t) return;

        var lblCity=document.getElementById('lbl-city');
        if(lblCity) lblCity.textContent = t.createMeetCityLabel || lblCity.textContent;
        var countrySel=document.getElementById('q-country');
        if(countrySel){
          countrySel.options[0].text = currentLang==='en'?'Spain':(currentLang==='pt'?'Espanha':'España');
          countrySel.options[1].text = 'Portugal';
        }
        var cityInp=document.getElementById('q-city-search');
        if(cityInp) cityInp.placeholder = t.createMeetCityPh || cityInp.placeholder;
        document.documentElement.setAttribute('lang', currentLang);

        var langSel = document.getElementById('lang-select');
        if(langSel && langSel.value !== currentLang) langSel.value = currentLang;

        var setText = function(id, val) { var el = document.getElementById(id); if(el) el.textContent = val; };

        setText('nav-login', t.navLogin);
        setText('nav-register', t.navRegister);
        setText('landing-subtitle', t.landingSubtitle);
        setText('landing-differentiator', t.landingDifferentiator);
        setText('landing-cta-start', t.landingStart);
        setText('landing-cta-web', t.landingUseWeb || 'Usar versión web');
        setText('landing-cta-login', t.landingHave);
        setText('top-banner-text', t.topBannerText || 'Usa la app de CorrerJuntos');
        setText('app-title', t.appTitle + ' ');
        setText('app-title-highlight', t.appTitleHi);
        setText('app-subtitle', t.appSubtitle);
        setText('map-label', t.mapLabel);
        setText('showing-prefix', t.showingPrefix);
        setText('showing-suffix', t.showingSuffix);
        if (window.__CJ_PWA_SET_TEXT__) { window.__CJ_PWA_SET_TEXT__(t); }

        setText('landing-headline-1', t.landingHeadline1);
        setText('landing-headline-2', t.landingHeadline2);
        setText('landing-trust-text', t.landingTrust);
        setText('landing-cta-secondary', t.landingCtaSecondary);
        setText('stat-label-runners', t.statLabelRunners);
        setText('stat-label-quedadas', t.statLabelQuedadas);
        setText('stat-label-ciudades', t.statLabelCiudades);
        setText('stat-label-proximas', t.statLabelProximas);
        setText('newsletter-title', t.newsletterTitle);
        setText('newsletter-subtitle', t.newsletterSubtitle);
        setText('newsletter-btn', t.newsletterBtn);
        setText('newsletter-privacy', t.newsletterPrivacy);
        setText('newsletter-success-msg', t.newsletterSuccess);
        setText('newsletter-error-msg', t.newsletterError);
        setText('cities-section-title', t.citiesSectionTitle);
        setText('cities-section-subtitle', t.citiesSectionSubtitle);
        setText('cities-view-all', t.citiesViewAll);
        setText('benefit-1-title', t.benefit1Title);
        setText('benefit-1-desc', t.benefit1Desc);
        setText('benefit-2-title', t.benefit2Title);
        setText('benefit-2-desc', t.benefit2Desc);
        setText('benefit-3-title', t.benefit3Title);
        setText('benefit-3-desc', t.benefit3Desc);
        setText('available-worldwide', t.availableWorldwide);
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
        setText('security-faq-1-q', t.securityFaq1Q);
        setText('security-faq-1-a', t.securityFaq1A);
        setText('security-faq-2-q', t.securityFaq2Q);
        setText('security-faq-2-a', t.securityFaq2A);
        setText('security-faq-3-q', t.securityFaq3Q);
        setText('security-faq-3-a', t.securityFaq3A);
        setText('security-faq-4-q', t.securityFaq4Q);
        setText('security-faq-4-a', t.securityFaq4A);
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
        setText('cta-final-title', t.ctaFinalTitle);
        setText('cta-final-subtitle', t.ctaFinalSubtitle);
        setText('footer-download-title', t.footerDownload);
        setText('footer-legal-title', t.footerLegal);
        setText('footer-terms', t.footerTerms);
        setText('footer-privacy', t.footerPrivacy);
        setText('footer-cookies', t.footerCookies);
        setText('footer-cookie-settings', t.footerCookieSettings || '⚙ Configurar cookies');
        setText('cookie-banner-text', t.cookieBannerText);
        var cbAccept = document.getElementById('cookie-banner-accept');
        var cbReject = document.getElementById('cookie-banner-reject');
        var cbCustomize = document.getElementById('cookie-banner-customize');
        var cbSave = document.getElementById('cookie-banner-save');
        var cbMore = document.getElementById('cookie-banner-more');
        if(cbAccept) cbAccept.textContent = t.cookieBannerAccept;
        if(cbReject) cbReject.textContent = t.cookieBannerReject;
        if(cbCustomize) cbCustomize.textContent = t.cookieBannerCustomize || 'Personalizar';
        if(cbSave) cbSave.textContent = t.cookieBannerSave || 'Guardar preferencias';
        if(cbMore) cbMore.textContent = t.cookieBannerMore;
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
        var badgeEl = document.getElementById('landing-badge');
        if(badgeEl) {
            badgeEl.innerHTML = t.landingBadge;
        }

        setText('app-nav-home-label', t.nav_home || 'Inicio');
        setText('app-nav-map-label', t.nav_map || 'Mapa');
        setText('app-nav-create-label', t.nav_create || 'Crear');
        setText('app-nav-social-label', t.nav_social || 'Social');
        setText('app-nav-profile-label', t.nav_profile || 'Perfil');
        setText('matching-title', 'Social');
        setText('matching-subtitle', t.social_find_partner || 'Encuentra tu compañero ideal de running');
        setText('matching-tab-results', t.matchingTabResults || 'Compatibles');
        setText('matching-tab-requests', t.matchingTabRequests || 'Solicitudes');
        setText('matching-edit-profile-btn', t.matchingEditProfile || 'Editar perfil');
        setText('matching-loading-text', t.matchingLoading || 'Buscando runners compatibles...');
        setText('matching-empty-title', t.matchingEmptyTitle || 'No hay runners en tu ciudad todavía');
        setText('matching-empty-desc', t.matchingEmptyDesc || 'Sé el primero en activar Matching.');
        setText('matching-premium-title', t.matchingPremiumTitle || 'Desbloquea todos los matches');
        setText('matching-premium-desc', t.matchingPremiumDesc || 'Los usuarios Premium ven todos los runners compatibles.');
        setText('matching-premium-cta', t.matchingPremiumCta || 'Hazte Premium');
        setText('matching-received-title', t.matchingReceivedTitle || 'Solicitudes recibidas');
        setText('matching-sent-title', t.matchingSentTitle || 'Solicitudes enviadas');
        setText('matching-accepted-title', t.matchingAcceptedTitle || 'Matches aceptados');
        setText('matching-no-received', t.matchingNoReceived || 'No tienes solicitudes pendientes');
        setText('matching-no-sent', t.matchingNoSent || 'No has enviado solicitudes');
        setText('matching-no-accepted', t.matchingNoAccepted || 'Aún no tienes matches');
        setText('mp-title', t.mpTitle || 'Tu perfil de Matching');
        setText('mp-subtitle', t.mpSubtitle || 'Para encontrar runners compatibles contigo');
        setText('mp-ritmo-label', t.mpRitmoLabel || 'Tu ritmo (min/km)');
        setText('mp-dias-label', t.mpDiasLabel || 'Días preferidos');
        setText('mp-horario-label', t.mpHorarioLabel || 'Horario preferido');
        setText('mp-objetivo-label', t.mpObjetivoLabel || 'Tu objetivo');
        setText('mp-bio-label', t.mpBioLabel || 'Bio de matching');
        setText('mp-visible-label', t.mpVisibleLabel || 'Visible en Matching');
        setText('mp-visible-desc', t.mpVisibleDesc || 'Otros runners pueden encontrarte');
        setText('mp-save-btn', t.mpSaveBtn || 'Guardar perfil');
        setText('social-community-title', t.social_community_active || 'Comunidad activa');
        setText('social-quick-links-title', t.social_quick_links || 'Accesos rápidos');
        setText('social-stat-runners-label', t.social_active_runners || 'runners activos');
        setText('social-stat-quedadas-label', t.social_weekly_runs || 'quedadas esta semana');
        setText('social-stat-cities-label', t.social_cities || 'ciudades');
        setText('social-link-profile', t.nav_profile || 'Mi perfil');
        setText('social-link-ranking', 'Ranking');
        setText('social-link-connections', t.matchingAcceptedTitle || 'Conexiones');
        setText('social-link-badges', t.btn_achievements || 'Logros');
        setText('social-app-cta-title', t.social_app_cta_title || 'Tracking GPS y mucho más');
        setText('social-app-cta-desc', t.social_app_cta_desc || 'Descarga la app para registrar tus actividades');
        setText('label-theme-toggle', t.theme_toggle || 'Modo oscuro');

        var loginTitle = document.querySelector('#modal-login h2');
        if(loginTitle) loginTitle.textContent = t.loginTitle;
        var loginLabels = document.querySelectorAll('#modal-login label');
        if(loginLabels.length>=2){
            loginLabels[0].textContent = t.loginEmail;
            loginLabels[1].textContent = t.loginPass;
        }
        var loginBtn = document.querySelector('#modal-login button[onclick="doLogin()"]');
        if(loginBtn) loginBtn.textContent = t.loginBtn;

        var regTitle = document.querySelector('#modal-register h2');
        if(regTitle) regTitle.textContent = t.registerTitle;
        var rt=document.getElementById('reg-title-text'); if(rt) rt.textContent=t.registerTitle;
        var rn=document.getElementById('reg-lbl-name'); if(rn) rn.textContent=t.regLblName||rn.textContent;
        var rln=document.getElementById('reg-lbl-lastname'); if(rln) rln.textContent=t.regLblLast||rln.textContent;
        var ra=document.getElementById('reg-lbl-age'); if(ra) ra.textContent=t.regLblAge||ra.textContent;
        var rAgePh=document.getElementById('reg-age-ph'); if(rAgePh) rAgePh.textContent=t.regAgePh||rAgePh.textContent;
        var rl=document.getElementById('reg-lbl-level'); if(rl) rl.textContent=t.regLblLevel||rl.textContent;
        var rLevelPh=document.getElementById('reg-level-ph'); if(rLevelPh) rLevelPh.textContent=t.regLevelPh||rLevelPh.textContent;
        var rc=document.getElementById('reg-lbl-country'); if(rc) rc.textContent=t.regLblCountry||rc.textContent;
        var rcity=document.getElementById('reg-lbl-city'); if(rcity) rcity.textContent=t.regLblCity||rcity.textContent;
        var rwa=document.getElementById('reg-lbl-wa'); if(rwa) rwa.textContent=t.regLblWA||rwa.textContent;
        var rEmail=document.getElementById('reg-lbl-email'); if(rEmail) rEmail.textContent=t.regLblEmail||rEmail.textContent;
        var rEmail2=document.getElementById('reg-lbl-email2'); if(rEmail2) rEmail2.textContent=t.regLblEmail2||rEmail2.textContent;
        var rPass=document.getElementById('reg-lbl-pass'); if(rPass) rPass.textContent=t.regLblPass||rPass.textContent;
        var rPass2=document.getElementById('reg-lbl-pass2'); if(rPass2) rPass2.textContent=t.regLblPass2||rPass2.textContent;
        var rb=document.getElementById('reg-btn'); if(rb) rb.textContent=t.regBtn||rb.textContent;
        document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
          var k=el.getAttribute('data-i18n-ph');
          if(t[k]) el.setAttribute('placeholder', t[k]);
        });
        var rLegAge=document.getElementById('reg-legal-age-text'); if(rLegAge) rLegAge.textContent=t.regLegalAge||rLegAge.textContent;
        var rLegTerms=document.getElementById('reg-legal-terms-text'); if(rLegTerms){
          var links=rLegTerms.querySelectorAll('a');
          var termTxt=currentLang==='en'?'terms':(currentLang==='pt'?'termos':'términos');
          var privTxt=currentLang==='en'?'privacy':(currentLang==='pt'?'privacidade':'privacidad');
          if(links.length>=2){ links[0].textContent=termTxt; links[1].textContent=privTxt; }
          if(currentLang==='en') rLegTerms.childNodes[0].textContent='I accept ';
          else if(currentLang==='pt') rLegTerms.childNodes[0].textContent='Aceito ';
          else rLegTerms.childNodes[0].textContent='Acepto ';
          if(rLegTerms.childNodes.length>2) rLegTerms.childNodes[2].textContent=' y ';
        }
        var rLegWA=document.getElementById('reg-legal-wa-text'); if(rLegWA) rLegWA.textContent=t.regLegalWA||rLegWA.textContent;
        var levelSel=document.getElementById('reg-nivel');
        if(levelSel && levelSel.tagName === 'SELECT' && levelSel.options && Array.isArray(t.regLevelOpts)){
          try {
            var opts = Array.from(levelSel.options);
            if(opts.length>=1){
              for(var i=1;i<opts.length && i<=t.regLevelOpts.length;i++){ opts[i].textContent=t.regLevelOpts[i-1]; }
            }
          } catch(e) { console.warn('Error updating level options:', e); }
        }

        var crearTitle = document.querySelector('#modal-crear h2');
        if(crearTitle) crearTitle.textContent = t.createMeetTitle;
        var crearSub = document.querySelector('#modal-crear p');
        if(crearSub) crearSub.textContent = t.createMeetSubtitle;

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

        setText('create-basic-info', t.createBasicInfo);
        setText('create-meeting-point', t.createMeetingPoint);
        setText('create-title-label', t.createTitleLabel);
        setText('create-drag-hint', t.createDragMap);
        setText('create-cancel-btn', t.createCancel);
        setText('create-publish-btn', t.createPublish);
        var createTitleInput = document.getElementById('q-titulo');
        if(createTitleInput) createTitleInput.placeholder = t.createTitlePh || createTitleInput.placeholder;
        var createSearchInput = document.getElementById('q-buscar-lugar');
        if(createSearchInput) createSearchInput.placeholder = t.createSearchPlace || createSearchInput.placeholder;

        setText('ranking-title', t.rankingTitle);
        setText('ranking-subtitle', t.rankingSubtitle);

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

        setText('alert-toggle-label', t.alertToggleLabel);
        setText('alert-toggle-desc', t.alertToggleDesc);
        setText('alert-radius-label', t.alertRadiusLabel);

        setText('achievements-title', t.achievementsTitle);
        setText('achievements-subtitle', t.achievementsSubtitle);

        setText('header-hello', t.hello);
        setText('header-profile', t.myProfile);
        setText('header-logout', t.logout);
        setText('header-create-desktop', t.createRun);
        setText('header-create-mobile', t.createRun);

        setText('label-following', t.following);
        setText('label-followers', t.followers);
        setText('label-total-runs', t.totalRuns);
        setText('label-km-run', t.kmRun);
        setText('label-runners-known', t.runnersKnown);
        setText('label-upcoming', t.upcomingRuns);
        setText('btn-ranking', 'Ranking');
        setText('btn-achievements', t.achievementsTab || 'Achievements');

        setText('progress-title', t.myProgress);
        setText('label-points', t.points);
        setText('label-created', t.created);
        setText('label-attended', t.attended);
        setText('label-badges', t.badges);
        setText('badges-empty-text', t.completeBadges);
        setText('btn-view-ranking', t.viewRanking);

        setText('my-runs-title', t.myRuns);
        setText('btn-refresh', t.refresh);
        setText('tab-upcoming', t.upcoming);
        setText('tab-completed', t.completed);

        setText('ranking-title', t.weeklyRanking || t.rankingTitle);
        setText('ranking-subtitle', t.top10 || t.rankingSubtitle);
        setText('ranking-position-label', t.yourPosition);

        setText('detail-label-meeting', t.detailMeetingPoint);
        setText('detail-label-level', t.detailLevelRequired);
        setText('detail-label-desc', t.detailDescription);
        setText('detail-label-rating', t.detailRating);
        setText('detail-label-organizer', t.detailOrganizer);
        setText('detail-label-participants', t.detailParticipants);
        setText('detail-btn-rate', t.detailRate);
        setText('detail-btn-share', t.detailShare);
        setText('detail-btn-close', t.detailClose);

        setText('app-available-text', t.appAvailableOn);
        setText('app-download-ios', t.appDownloadOn);
        setText('app-download-android', t.appGetItOn);
        setText('app-download-ios-2', t.appDownloadOn || 'Descargar en');
        setText('app-download-android-2', t.appDownloadOn || 'Descargar en');

        if (typeof updateStatsUI === 'function') updateStatsUI();

        setText('premium-stats-title', t.detailedStats);
        setText('premium-stats-desc', t.statsDesc);
        setText('premium-unlock-btn', t.unlockPremium);

        setText('premium-unlock-all', t.premiumUnlockAll);
        setText('premium-feat-1', t.premiumAdvancedStats);
        setText('premium-feat-2', t.premiumUnlimitedRuns);
        setText('premium-feat-3', t.premiumExclusiveBadges);
        setText('premium-get-btn', t.premiumGetBtn);
        setText('premium-cancel-text', t.premiumCancelAnytime);
        setText('premium-you-are', t.premiumYouAre);
        setText('premium-manage-btn', t.premiumManage);

        setText('notif-push-title', t.notifPush);
        setText('notif-on-device', t.notifOnDevice);
        setText('notif-which-receive', t.notifWhichReceive);
        setText('notif-pref-24h', t.notifReminder24h);
        setText('notif-pref-1h', t.notifReminder1h);
        setText('notif-pref-joins', t.notifSomeoneJoins);
        setText('notif-pref-new-city', t.notifNewRunCity);
        setText('notif-pref-cancelled', t.notifRunCancelled);

        setText('danger-zone-title', t.dangerZone);
        setText('danger-zone-desc', t.dangerZoneDesc);
        setText('delete-account-btn', t.deleteAccount);
        setText('profile-close-btn', t.closeBtn);

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

        setText('feed-title', t.feedTitle);
        setText('map-preview-title', t.mapPreviewTitle);
        setText('map-preview-subtitle', t.mapPreviewSubtitle);
        setText('map-preview-cta', t.mapPreviewCta);
        setText('mockups-title', t.mockupsTitle);
        setText('mockups-subtitle', t.mockupsSubtitle);
        setText('preview-badge', t.previewBadge);
        setText('preview-title', t.previewTitle);
        setText('preview-subtitle', t.previewSubtitle);
        setText('preview-cta', t.previewCta);
        setText('qp-modal-cta', t.previewModalCta);
        setText('apps-coming-badge', t.appsComingBadge);
        setText('apps-coming-text', t.appsComingText);
        setText('hero-ios-label', t.appDownloadOn || 'Descargar en');
        setText('hero-android-label', t.appDownloadOn || 'Descargar en');
        setText('social-follow-title', t.socialFollowTitle);
        setText('social-follow-subtitle', t.socialFollowSubtitle);
        setText('social-share-btn', t.socialShareBtn);
        setText('share-banner-text', t.shareBannerText);
        setText('share-banner-btn', t.shareBannerBtn);
        setText('banner-referral-title', t.bannerReferralTitle);
        setText('banner-referral-desc', t.bannerReferralDesc);
        setText('banner-referral-btn', t.bannerReferralBtn);
        if (typeof loadQuedadasPreview === 'function') loadQuedadasPreview();

        renderCityChips();
    }
    window.applyLanguageUI = applyLanguageUI;

    function updateMetaTags(lang) {
        var m = META_I18N[lang] || META_I18N.es;
        document.title = m.title;
        document.documentElement.setAttribute('lang', lang);
        var setMeta = function(sel, val) { var el = document.querySelector(sel); if(el) el.setAttribute('content', val); };
        setMeta('meta[name="description"]', m.description);
        setMeta('meta[name="keywords"]', m.keywords);
        setMeta('meta[property="og:title"]', m.ogTitle);
        setMeta('meta[property="og:description"]', m.ogDesc);
        setMeta('meta[property="og:locale"]', m.ogLocale);
        setMeta('meta[name="twitter:title"]', m.ogTitle);
        setMeta('meta[name="twitter:description"]', m.ogDesc);
    }
    window.updateMetaTags = updateMetaTags;

    function changeLanguage(lang){
        var supported = ['es','en','pt','ru'];
        currentLang = supported.indexOf(lang) !== -1 ? lang : 'es';
        localStorage.setItem(STORAGE_LANG, currentLang);
        document.documentElement.lang = currentLang;
        if (!I18N[currentLang]) {
            var s = document.createElement('script');
            s.src = '/data/i18n-' + currentLang + '.js';
            s.onload = function() { updateMetaTags(currentLang); applyLanguageUI(); };
            s.onerror = function() { currentLang = 'es'; document.documentElement.lang = 'es'; updateMetaTags('es'); applyLanguageUI(); };
            document.head.appendChild(s);
        } else {
            updateMetaTags(currentLang);
            applyLanguageUI();
        }
    }
    window.changeLanguage = changeLanguage;

})();
