// ========================= ERROR HANDLER =========================
// Standardized error handling for CorrerJuntos.
// Replaces ad-hoc try/catch patterns with consistent logging + user feedback.
// Includes beacon reporting for critical errors to /api/error-report.
// Pattern: IIFE exposing via window.CJ (same as validation.js, toast.js)
(function() {
    'use strict';

    window.CJ = window.CJ || {};

    // In-memory error log for debugging (accessible via console: window.__CJ_ERROR_LOG__)
    var errorLog = [];
    window.__CJ_ERROR_LOG__ = errorLog;

    var MAX_LOG_SIZE = 100;

    // ─── Beacon reporting config ──────────────────────────────────
    var _sessionId = 'cj_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    var _reportCount = 0;
    var MAX_REPORTS_PER_SESSION = 5;
    var CRITICAL_CONTEXTS = [
        'checkout', 'login', 'register', 'saveQuedada', 'saveProfile',
        'auth', 'unhandledrejection', 'globalError'
    ];

    /**
     * Report critical errors to /api/error-report via sendBeacon.
     * Non-blocking, survives page unload, max 5 per session.
     */
    CJ._reportError = function(entry) {
        if (_reportCount >= MAX_REPORTS_PER_SESSION) return;
        _reportCount++;
        var payload = JSON.stringify({
            context: entry.context || 'unknown',
            message: entry.message || 'Unknown error',
            stack: entry.stack || null,
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 200),
            sessionId: _sessionId,
            severity: entry.severity || 'error',
            timestamp: entry.timestamp || new Date().toISOString()
        });
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/error-report', new Blob([payload], { type: 'application/json' }));
            } else {
                fetch('/api/error-report', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(function(){});
            }
        } catch (_) { /* never throw from error reporter */ }
    };

    /**
     * Log an error with context. Shows toast to user and accumulates in error log.
     * @param {Error|object|string} error - The error object or message
     * @param {string} context - Where the error happened (e.g., 'login', 'saveQuedada')
     * @param {object} [options] - { silent: bool, duration: number }
     *   silent=true: log only, no toast (for non-critical background errors)
     *   duration: toast display time in ms (default 4000)
     */
    CJ.handleApiError = function(error, context, options) {
        options = options || {};
        var msg = '';
        if (error && error.message) {
            msg = error.message;
        } else if (typeof error === 'string') {
            msg = error;
        } else {
            msg = 'Error desconocido';
        }

        // Log to console with context
        console.error('[CJ:' + context + ']', error);

        // Accumulate in memory log (circular buffer)
        errorLog.push({
            context: context,
            message: msg,
            timestamp: new Date().toISOString(),
            stack: error && error.stack ? error.stack.substring(0, 500) : null
        });
        if (errorLog.length > MAX_LOG_SIZE) {
            errorLog.shift();
        }

        // Show toast to user (unless silent)
        if (!options.silent && typeof showToast === 'function') {
            var userMsg = CJ._localizeError(msg, context);
            showToast(userMsg, 'error', options.duration || 4000);
        }

        // Auto-report critical errors via beacon
        var isCritical = options.severity === 'critical' || CRITICAL_CONTEXTS.indexOf(context) !== -1;
        if (isCritical) {
            CJ._reportError({
                context: context,
                message: msg,
                stack: error && error.stack ? error.stack.substring(0, 500) : null,
                severity: options.severity || 'error',
                timestamp: new Date().toISOString()
            });
        }
    };

    /**
     * Wraps an async function with standardized error handling.
     * Usage: var safeFn = CJ.wrapAsync(myAsyncFn, 'myContext');
     * @param {Function} fn - Async function to wrap
     * @param {string} context - Error context label
     * @returns {Function} Wrapped function
     */
    CJ.wrapAsync = function(fn, context) {
        return async function() {
            try {
                return await fn.apply(this, arguments);
            } catch(e) {
                CJ.handleApiError(e, context);
            }
        };
    };

    /**
     * Localize common Supabase/API error messages for the user.
     * Keeps technical details in console, shows friendly message in toast.
     */
    CJ._localizeError = function(msg, context) {
        var lang = (window.AppState && window.AppState.ui && window.AppState.ui.currentLang)
            || (typeof currentLang !== 'undefined' ? currentLang : 'es');
        var isEN = lang === 'en';

        var lower = (msg || '').toLowerCase();

        // Network errors
        if (lower.includes('fetch') || lower.includes('network') || lower.includes('timeout') || lower.includes('failed to fetch')) {
            return isEN ? 'Connection error. Check your internet.' : 'Error de conexión. Comprueba tu internet.';
        }
        // Auth errors
        if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
            return isEN ? 'Wrong email or password.' : 'Email o contraseña incorrectos.';
        }
        if (lower.includes('email not confirmed')) {
            return isEN ? 'Please confirm your email first.' : 'Confirma tu email primero.';
        }
        if (lower.includes('already registered') || lower.includes('already exists')) {
            return isEN ? 'This email is already registered.' : 'Este email ya está registrado.';
        }
        // Rate limiting
        if (lower.includes('rate limit') || lower.includes('too many')) {
            return isEN ? 'Too many attempts. Wait a moment.' : 'Demasiados intentos. Espera un momento.';
        }
        // RLS / permission
        if (lower.includes('permission') || lower.includes('rls') || lower.includes('policy')) {
            return isEN ? 'Permission error. Try logging in again.' : 'Error de permisos. Intenta iniciar sesión de nuevo.';
        }
        // Generic with context
        if (context) {
            return isEN ? 'Error in ' + context + '. Try again.' : 'Error en ' + context + '. Inténtalo de nuevo.';
        }
        return isEN ? 'Something went wrong. Try again.' : 'Algo salió mal. Inténtalo de nuevo.';
    };

    /**
     * Get error log for debugging (e.g., for support tickets).
     * @returns {Array} Recent errors
     */
    CJ.getErrorLog = function() {
        return errorLog.slice();
    };

    /**
     * Clear error log.
     */
    CJ.clearErrorLog = function() {
        errorLog.length = 0;
    };

    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        var reason = event.reason;
        var msg = reason && reason.message ? reason.message : String(reason);
        console.error('[CJ:unhandled]', reason);
        var entry = {
            context: 'unhandledrejection',
            message: msg,
            timestamp: new Date().toISOString(),
            stack: reason && reason.stack ? reason.stack.substring(0, 500) : null
        };
        errorLog.push(entry);
        if (errorLog.length > MAX_LOG_SIZE) errorLog.shift();
        CJ._reportError(entry);
    });

    // Global error handler for sync errors
    window.addEventListener('error', function(event) {
        var entry = {
            context: 'globalError',
            message: event.message || 'Unknown error',
            timestamp: new Date().toISOString(),
            stack: (event.filename || '') + ':' + (event.lineno || '')
        };
        errorLog.push(entry);
        if (errorLog.length > MAX_LOG_SIZE) errorLog.shift();
        CJ._reportError(entry);
    });

})();
