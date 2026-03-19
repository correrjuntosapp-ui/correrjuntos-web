// ========================= CENTRALIZED STATE =========================
// Single source of truth for the CorrerJuntos web app.
// Loaded BEFORE app.js so that all modules can read/write AppState.
// Backward-compat shims keep the 700+ existing references working.
// Pattern: IIFE (same as validation.js, error-handler.js, toast.js)
(function() {
    'use strict';

    // ─── AppState ───────────────────────────────────────────────
    window.AppState = {
        // User session
        user: null,   // { id, email, nombre, apellidos, ciudad, nivel, ... }

        // Premium
        premium: {
            isPremium: false,
            plan: 'free'        // 'free' | 'premium'
        },

        // Map instances & data
        map: {
            instance: null,     // Leaflet map (dashboard)
            markers: [],        // Current map markers
            crear: null,        // Leaflet map (create modal)
            markerCrear: null,  // Pin on create map
            initialized: false
        },

        // Quedadas
        quedadas: [],

        // Geolocation & filters
        geo: {
            placeCenter: null,      // city/province centroid for recentering
            pinCoords: null,        // exact meetup pin
            userLoc: null,          // { lat, lng } from GPS
            userCountry: 'ES',      // ISO country code
            geoFilterMode: 'country' // 'country' | 'all'
        },

        // UI
        ui: {
            currentLang: 'es',
            currentFilter: 'country',
            mapState: 'normal',     // 'normal' | 'minimized' | 'expanded'
            isMapFullscreen: false,
            sidebarView: 'communities',
            selectedCommunity: null,
            selectedTopic: null
        },

        // Auth flags
        auth: {
            profileCompletionRequired: false
        },

        // Filters
        filters: {
            active: { nivel: null, horario: null, distancia: null, ritmo: null, verificado: null, premium_org: null },
            visible: false
        }
    };

    // ─── Debug flag (set to true in console for verbose logging) ─
    window.__CJ_DEBUG__ = false;

    // ─── Plan features (read-only config) ───────────────────────
    window.PLAN_FEATURES = {
        free:    { maxActiveMeetups: 3, canDM: false, advancedFilters: false, seeProfileViews: false, priorityListing: false },
        premium: { maxActiveMeetups: Infinity, canDM: true, advancedFilters: true, seeProfileViews: true, priorityListing: true }
    };

    // ─── Helper: getEffectivePlan ───────────────────────────────
    window.getEffectivePlan = function(profile) {
        if (!profile) return 'free';
        if (profile.plan === 'premium') {
            if (profile.plan_until && new Date(profile.plan_until) < new Date()) return 'free';
            return 'premium';
        }
        if (profile.es_premium === true) return 'premium';
        return profile.plan || 'free';
    };

    // ─── Helper: can(feature) ───────────────────────────────────
    window.can = function(feature) {
        return PLAN_FEATURES[AppState.premium.plan]?.[feature] ?? false;
    };

    // ─── Backward-compat shims ──────────────────────────────────
    // These let existing code keep using `currentUser`, `isUserPremium`, etc.
    // as if they were simple globals. Reads/writes are redirected to AppState.

    // currentUser ↔ AppState.user
    Object.defineProperty(window, 'currentUser', {
        get: function() { return AppState.user; },
        set: function(v) { AppState.user = v; },
        configurable: true
    });

    // isUserPremium ↔ AppState.premium.isPremium
    Object.defineProperty(window, 'isUserPremium', {
        get: function() { return AppState.premium.isPremium; },
        set: function(v) { AppState.premium.isPremium = !!v; },
        configurable: true
    });

    // userPlan ↔ AppState.premium.plan
    Object.defineProperty(window, 'userPlan', {
        get: function() { return AppState.premium.plan; },
        set: function(v) { AppState.premium.plan = v || 'free'; },
        configurable: true
    });

    // map ↔ AppState.map.instance
    Object.defineProperty(window, 'map', {
        get: function() { return AppState.map.instance; },
        set: function(v) { AppState.map.instance = v; },
        configurable: true
    });

    // markers ↔ AppState.map.markers
    Object.defineProperty(window, 'markers', {
        get: function() { return AppState.map.markers; },
        set: function(v) { AppState.map.markers = v || []; },
        configurable: true
    });

    // mapCrear ↔ AppState.map.crear
    Object.defineProperty(window, 'mapCrear', {
        get: function() { return AppState.map.crear; },
        set: function(v) { AppState.map.crear = v; },
        configurable: true
    });

    // markerCrear ↔ AppState.map.markerCrear
    Object.defineProperty(window, 'markerCrear', {
        get: function() { return AppState.map.markerCrear; },
        set: function(v) { AppState.map.markerCrear = v; },
        configurable: true
    });

    // quedadas ↔ AppState.quedadas
    Object.defineProperty(window, 'quedadas', {
        get: function() { return AppState.quedadas; },
        set: function(v) { AppState.quedadas = v || []; },
        configurable: true
    });

    // placeCenter ↔ AppState.geo.placeCenter
    Object.defineProperty(window, 'placeCenter', {
        get: function() { return AppState.geo.placeCenter; },
        set: function(v) { AppState.geo.placeCenter = v; },
        configurable: true
    });

    // pinCoords ↔ AppState.geo.pinCoords
    Object.defineProperty(window, 'pinCoords', {
        get: function() { return AppState.geo.pinCoords; },
        set: function(v) { AppState.geo.pinCoords = v; },
        configurable: true
    });

    // userLoc ↔ AppState.geo.userLoc
    Object.defineProperty(window, 'userLoc', {
        get: function() { return AppState.geo.userLoc; },
        set: function(v) { AppState.geo.userLoc = v; },
        configurable: true
    });

    // userCountry ↔ AppState.geo.userCountry
    Object.defineProperty(window, 'userCountry', {
        get: function() { return AppState.geo.userCountry; },
        set: function(v) { AppState.geo.userCountry = v || 'ES'; },
        configurable: true
    });

    // geoFilterMode ↔ AppState.geo.geoFilterMode
    Object.defineProperty(window, 'geoFilterMode', {
        get: function() { return AppState.geo.geoFilterMode; },
        set: function(v) { AppState.geo.geoFilterMode = v || 'country'; },
        configurable: true
    });

    // currentLang ↔ AppState.ui.currentLang
    Object.defineProperty(window, 'currentLang', {
        get: function() { return AppState.ui.currentLang; },
        set: function(v) { AppState.ui.currentLang = v || 'es'; },
        configurable: true
    });

    // currentFilter ↔ AppState.ui.currentFilter
    Object.defineProperty(window, 'currentFilter', {
        get: function() { return AppState.ui.currentFilter; },
        set: function(v) { AppState.ui.currentFilter = v || 'country'; },
        configurable: true
    });

    // mapState ↔ AppState.ui.mapState
    Object.defineProperty(window, 'mapState', {
        get: function() { return AppState.ui.mapState; },
        set: function(v) { AppState.ui.mapState = v || 'normal'; },
        configurable: true
    });

    // isMapFullscreen ↔ AppState.ui.isMapFullscreen
    Object.defineProperty(window, 'isMapFullscreen', {
        get: function() { return AppState.ui.isMapFullscreen; },
        set: function(v) { AppState.ui.isMapFullscreen = !!v; },
        configurable: true
    });

})();
