// ========================= VALIDATION MODULE =========================
// Input validation and sanitization helpers for CorrerJuntos.
// Pattern: IIFE exposing via window.CJ.validate (same as toast.js)
(function() {
    'use strict';

    window.CJ = window.CJ || {};

    CJ.validate = {
        /**
         * RFC-compliant basic email validation.
         * Rejects: user@, @domain, user@.com, spaces, double @@
         */
        email: function(v) {
            if (!v || typeof v !== 'string') return false;
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
        },

        /**
         * Password: minimum 6 characters.
         */
        password: function(v) {
            return typeof v === 'string' && v.length >= 6;
        },

        /**
         * Checks that a date+time string is in the future.
         * @param {string} dateTimeStr - ISO-like string, e.g. "2026-03-20T09:00"
         */
        futureDate: function(dateTimeStr) {
            if (!dateTimeStr) return false;
            var d = new Date(dateTimeStr);
            return !isNaN(d.getTime()) && d > new Date();
        },

        /**
         * Validates lat/lng are finite numbers within valid ranges.
         * Fixes the lat=0/lng=0 bug (falsy but valid for equator/prime meridian).
         */
        coordinates: function(lat, lng) {
            var la = parseFloat(lat);
            var ln = parseFloat(lng);
            return Number.isFinite(la) && Number.isFinite(ln)
                && la >= -90 && la <= 90
                && ln >= -180 && ln <= 180;
        },

        /**
         * Escapes HTML special characters to prevent XSS in innerHTML contexts.
         */
        sanitizeHTML: function(v) {
            return String(v || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        /**
         * Checks that string length does not exceed max.
         * Returns true if valid (within limit) or empty.
         */
        maxLength: function(v, max) {
            if (!v) return true;
            return String(v).length <= max;
        },

        /**
         * Truncates string to max length if needed.
         */
        truncate: function(v, max) {
            if (!v) return '';
            var s = String(v);
            return s.length > max ? s.substring(0, max) : s;
        },

        /**
         * Validates a phone number (digits only, 6-15 chars).
         */
        phone: function(v) {
            if (!v) return true; // optional field
            return /^\d{6,15}$/.test(v.replace(/[\s\-\+\(\)]/g, ''));
        },

        /**
         * Validates a URL (basic check for social links).
         */
        url: function(v) {
            if (!v) return true; // optional field
            try { new URL(v); return true; } catch(_) { return false; }
        }
    };

    window.CJ.validate = CJ.validate;
})();
