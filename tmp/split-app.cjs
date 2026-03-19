/**
 * split-app.cjs
 * Extracts functions from app.js into separate module files.
 * Each module is wrapped in an IIFE and exposes functions on window.
 */
const fs = require('fs');
const path = require('path');

const APP_JS = path.join(__dirname, '..', 'js', 'app.js');
const MODULES_DIR = path.join(__dirname, '..', 'js', 'modules');

const lines = fs.readFileSync(APP_JS, 'utf8').split('\n');

// Helper: extract lines (1-indexed, inclusive)
function extract(start, end) {
    return lines.slice(start - 1, end).join('\n');
}

// ─── UI MODULE ────────────────────────────────────────────
const ui = {
    header: `// ========================= UI MODULE =========================
// Modal management, formatting helpers, utility functions.
// Loaded AFTER state.js. Exposes functions on window.* for backward compat.
(function() {
    'use strict';
`,
    ranges: [
        [150, 164],    // escapeLocationText, escapeInlineArg
        [1619, 1630],  // timeAgo
        [3456, 3470],  // showWelcomeAnimation
        [3575, 3602],  // formatDate, formatDateShort, formatHora
        [3623, 3709],  // openModal, closeModal, closeAllModals
        [5660, 5663],  // escapeHtml
        [5821, 5835],  // scrollToMap
        [7176, 7190],  // isNewUser
        [8245, 8315],  // toggleWelcomeLevelAll, skipWelcomeNotif, saveWelcomeNotif
    ],
    exports: [
        'escapeLocationText', 'escapeInlineArg', 'timeAgo', 'showWelcomeAnimation',
        'formatDate', 'formatDateShort', 'formatHora',
        'openModal', 'closeModal', 'closeAllModals',
        'escapeHtml', 'scrollToMap', 'isNewUser',
        'toggleWelcomeLevelAll', 'skipWelcomeNotif', 'saveWelcomeNotif'
    ]
};

// ─── AUTH MODULE ──────────────────────────────────────────
const auth = {
    header: `// ========================= AUTH MODULE =========================
// Login, registration, password reset, session management.
// Loaded AFTER state.js, error-handler.js, validation.js, ui.js.
(function() {
    'use strict';
`,
    ranges: [
        [3855, 3856],  // showApp (single long line)
        [3857, 3871],  // processDeepLinkAfterLogin
        [3872, 3873],  // showLanding, updateUserUI
        [3874, 3905],  // logout, hideSuggestionsRegister
        [3906, 3947],  // onPlaceInputRegister
        [4584, 4604],  // getSupabaseClientOrToast
        [4605, 4636],  // loginWithGoogle
        [4637, 4751],  // doLogin
        [4752, 4777],  // togglePasswordVisibility
        [4778, 4916],  // validateLoginEmail, validateRegEmail, validatePasswordRealtime
        [4917, 5003],  // doRegisterSimple
        [5004, 5123],  // doRegister
        [5124, 5335],  // doForgotPasswordSend, doResetPasswordUpdate, clearRecoveryStateHard, doValidateResetLink, doResetPassword
    ],
    exports: [
        'showApp', 'processDeepLinkAfterLogin', 'showLanding', 'updateUserUI',
        'logout', 'hideSuggestionsRegister', 'onPlaceInputRegister',
        'getSupabaseClientOrToast', 'loginWithGoogle', 'doLogin',
        'togglePasswordVisibility', 'validateLoginEmail', 'validateRegEmail',
        'validatePasswordRealtime', 'doRegisterSimple', 'doRegister',
        'doForgotPasswordSend', 'doResetPasswordUpdate', 'doValidateResetLink', 'doResetPassword'
    ]
};

// ─── PROFILE MODULE ───────────────────────────────────────
const profile = {
    header: `// ========================= PROFILE MODULE =========================
// User profile, onboarding, avatar, stats, referrals, stats card.
// Loaded AFTER state.js, error-handler.js, validation.js, ui.js.
(function() {
    'use strict';
`,
    ranges: [
        [1204, 1205],  // userStats declaration
        [1206, 1442],  // loadUserStats, updateStatsUI
        [1443, 1514],  // loadPersonalHeatmap
        [2493, 2562],  // openVerifyLevelModal, onVerifyMethodChange, onVerifyFileSelected
        [2562, 2755],  // loadVerificationStatus, submitVerification, loadProfileVerificationStatus
        [2852, 3122],  // referral system
        [3123, 3268],  // openStatsCard, downloadStatsCard, shareStatsCard, loadQRLib, showQuedadaQR, downloadQR
        [4136, 4208],  // requestAccountDeletion
        [4209, 4288],  // setProfileAvatar, resizeImageToDataUrl, onProfilePhotoSelected
        [4289, 4341],  // openProfile
        [4342, 4494],  // selectOnboardLevel..saveOnboardProfile
        [4495, 4583],  // saveProfile
    ],
    exports: [
        'userStats',
        'loadUserStats', 'updateStatsUI', 'loadPersonalHeatmap',
        'openVerifyLevelModal', 'onVerifyMethodChange', 'onVerifyFileSelected',
        'loadVerificationStatus', 'submitVerification', 'loadProfileVerificationStatus',
        'generateReferralCode', 'detectReferralParam', 'applyReferralAfterRegistration',
        'checkReferralRewards', 'ensureReferralCode', 'loadReferralUI',
        'updateRewardCard', 'updateReferralBanner', 'dismissReferralBanner',
        'openProfileAndScrollToReferral', 'copyReferralLink',
        'shareReferralWhatsApp', 'shareReferralNative',
        'openStatsCard', 'downloadStatsCard', 'shareStatsCard',
        'loadQRLib', 'showQuedadaQR', 'downloadQR',
        'requestAccountDeletion',
        'setProfileAvatar', 'resizeImageToDataUrl', 'onProfilePhotoSelected',
        'openProfile', 'selectOnboardLevel', 'searchOnboardUbicacion',
        'selectOnboardUbicacion', 'detectarUbicacionGPS', 'saveOnboardProfile',
        'saveProfile'
    ]
};

// ─── MAP CORE MODULE ──────────────────────────────────────
const mapCore = {
    header: `// ========================= MAP CORE MODULE =========================
// Leaflet map initialization, markers, geocoding, crear modal map.
// Loaded AFTER state.js, ui.js.
(function() {
    'use strict';
`,
    ranges: [
        [3270, 3355],  // toggleMapSize, toggleFullscreenMap
        [3356, 3455],  // getNivelColor
        [5336, 5372],  // ensureLeaflet, ensureHtml2Canvas
        [5373, 5458],  // initMap, recenterMap, updateMapTiles, COUNTRY_CENTERS
        [5459, 5604],  // getCountryCenter..locateMe
        [5605, 5663],  // updateMarkers, getCrearCountryCode, escapeHtml (dup)
        [5664, 5776],  // address suggestions crear
        [5777, 5915],  // openModalCrear, restoreDraftQuedada, updateCrearProgress
        [5916, 5996],  // actualizarHoraCompleta, actualizarDistancia, actualizarRitmo
        [5997, 6151],  // animatePinCrear, hacerReverseGeocodingClic, useMyLocationCrear
        [6152, 6376],  // desc counter, terreno, amenities, ritmo sugerido, preview, saveDraft
        [6377, 6606],  // initMapCrear, reverseGeocode, onSearchPlaceCrear, selectSearchPlace, updateMapCrear
    ],
    exports: [
        'toggleMapSize', 'toggleFullscreenMap', 'getNivelColor',
        'ensureLeaflet', 'ensureHtml2Canvas',
        'initMap', 'recenterMap', 'updateMapTiles',
        'getCountryCenter', 'matchesCountry',
        'setGeoFilterMode', 'updateGeoFilterUI', 'detectUserCountry',
        'haversineKm', 'setLocateBtnActive', 'locateMe',
        'updateMarkers', 'getCrearCountryCode',
        'renderAddressSuggestionsCrear', 'closeAddressSuggestionsCrear',
        'fetchAddressSuggestionsCrear', 'onAddressInputCrear',
        'selectAddressResultCrear', 'tryFillAddressFromCoords',
        'openModalCrear', 'restoreDraftQuedada', 'updateCrearProgress',
        'actualizarHoraCompleta', 'actualizarDistancia', 'actualizarRitmo',
        'animatePinCrear', 'hacerReverseGeocodingClic', 'useMyLocationCrear',
        'updateDescCounter', 'addDescSnippet',
        'selectTerreno', 'selectDesnivel', 'toggleAmenity',
        'resetTerrenoAmenities', 'updateRitmoSugerido',
        'togglePreviewCrear', 'updatePreviewCrear', 'saveDraftQuedada',
        'initMapCrear', 'reverseGeocode',
        'onSearchPlaceCrear', 'selectSearchPlace', 'updateMapCrear'
    ]
};

// ─── QUEDADAS MODULE ──────────────────────────────────────
const quedadas = {
    header: `// ========================= QUEDADAS MODULE =========================
// Quedada CRUD, attendance, comments, sharing, weather, city views.
// Loaded AFTER state.js, error-handler.js, validation.js, ui.js, map-core.js, profile.js.
(function() {
    'use strict';
`,
    ranges: [
        [1515, 1618],  // loadQuedadaComments, postComment
        [2755, 2851],  // openShareModal..copyShareLink
        [3472, 3574],  // isQuedadaLive, getWeather, loadDetailWeather, getRunningTip
        [3604, 3622],  // isQuedadaPasada, getUserName
        [3710, 3854],  // viewOrganizerProfile, showOrganizerModal
        [7191, 7400],  // loadQuedadas, injectEventSchema
        [7401, 7856],  // renderQuedadas
        [7857, 7883],  // loadWeatherForQuedadas
        [7884, 8244],  // openQuedadaDetail, renderCityChips
        [8316, 8656],  // filterBy, ciudadView, loadCiudadData, renderCiudadQuedadas, renderCiudadRunners, checkCiudadParam
        [8657, 8827],  // openAttendanceModal, openLeaveConfirmModal, openLeaveConfirmFromCard, confirmLeaveQuedada
        [8827, 9095],  // confirmAttendance, getStatusMessage, getStatusBadge, toggleJoin
        [9096, 9363],  // saveQuedada, sendPushToNearbyUsers
        [9364, 9482],  // togglePrivateFields..updateRouteDisplay
        [9483, 9545],  // getUserQuedadasThisMonth, updateQuedadaCounter, updatePremiumCrearUI
        [9546, 9707],  // toggleAlertPreference..verifyPrivateCode
        [9708, 9777],  // openPostRunModal, savePostRunData
    ],
    exports: [
        'loadQuedadaComments', 'postComment',
        'openShareModal', 'getShareText', 'smartShare',
        'shareCorrerJuntos', 'shareWhatsApp', 'shareTwitter', 'copyShareLink',
        'isQuedadaLive', 'getWeather', 'loadDetailWeather', 'getRunningTip',
        'isQuedadaPasada', 'getUserName',
        'viewOrganizerProfile', 'showOrganizerModal',
        'loadQuedadas', 'injectEventSchema', 'renderQuedadas',
        'loadWeatherForQuedadas', 'openQuedadaDetail', 'renderCityChips',
        'filterBy', 'openCiudadView', 'closeCiudadView', 'switchCiudadTab',
        'loadCiudadData', 'renderCiudadQuedadas', 'renderCiudadRunners', 'checkCiudadParam',
        'openAttendanceModal', 'openLeaveConfirmModal', 'openLeaveConfirmFromCard',
        'confirmLeaveQuedada', 'confirmAttendance',
        'getStatusMessage', 'getStatusBadge', 'toggleJoin',
        'saveQuedada', 'sendPushToNearbyUsers',
        'togglePrivateFields', 'toggleRecurrenceFields', 'selectRecurrence',
        'generateAccessCode', 'toggleRouteDrawing', 'addRoutePoint',
        'undoLastRoutePoint', 'clearRouteDrawing', 'updateRouteDisplay',
        'getUserQuedadasThisMonth', 'updateQuedadaCounter', 'updatePremiumCrearUI',
        'toggleAlertPreference', 'selectAlertRadius', 'loadAlertPreferences',
        'showVerificationBanner', 'openVerificationFlow', 'verifyPrivateCode',
        'openPostRunModal', 'savePostRunData'
    ]
};

// ─── Build each module ────────────────────────────────────
const modules = {
    'ui.js': ui,
    'auth.js': auth,
    'profile.js': profile,
    'map-core.js': mapCore,
    'quedadas.js': quedadas,
};

for (const [filename, mod] of Object.entries(modules)) {
    let content = mod.header;

    for (const [start, end] of mod.ranges) {
        content += '\n';
        // Extract and dedent (remove leading 8-space indent from app.js)
        const block = extract(start, end)
            .split('\n')
            .map(l => l.startsWith('        ') ? l.slice(8) : l)
            .join('\n');
        content += block + '\n';
    }

    // Add exports
    content += '\n    // ─── Expose to window ────────────────────────────────\n';
    for (const exp of mod.exports) {
        content += `    window.${exp} = ${exp};\n`;
    }
    content += '})();\n';

    const outPath = path.join(MODULES_DIR, filename);
    fs.writeFileSync(outPath, content, 'utf8');
    const lineCount = content.split('\n').length;
    console.log(`✅ ${filename}: ${lineCount} lines written`);
}

console.log('\nDone! All modules extracted.');
