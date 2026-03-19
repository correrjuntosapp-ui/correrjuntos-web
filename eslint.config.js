// ESLint flat config for CorrerJuntos
// Focuses on catching real bugs, not style enforcement

export default [
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'script',
            globals: {
                // Browser globals
                window: 'readonly', document: 'readonly', navigator: 'readonly',
                localStorage: 'readonly', fetch: 'readonly', console: 'readonly',
                setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly',
                clearInterval: 'readonly', alert: 'readonly', confirm: 'readonly',
                URLSearchParams: 'readonly', URL: 'readonly', Blob: 'readonly',
                AbortController: 'readonly', FormData: 'readonly', Image: 'readonly',
                MutationObserver: 'readonly', IntersectionObserver: 'readonly',
                requestAnimationFrame: 'readonly', performance: 'readonly',
                // App globals (from modules)
                AppState: 'readonly', CJ: 'readonly', PLAN_FEATURES: 'readonly',
                I18N: 'readonly', META_I18N: 'readonly', L: 'readonly',
                currentUser: 'readonly', currentLang: 'readonly',
                showToast: 'readonly', openModal: 'readonly', closeModal: 'readonly',
                closeAllModals: 'readonly', applyLanguageUI: 'readonly',
                updateMetaTags: 'readonly', changeLanguage: 'readonly', STORAGE_LANG: 'readonly',
                // Supabase
                supabase: 'readonly',
            },
        },
        rules: {
            // Catch real bugs
            'no-undef': 'warn',
            'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
            'no-dupe-keys': 'error',
            'no-duplicate-case': 'error',
            'no-empty': ['warn', { allowEmptyCatch: false }],
            'no-extra-semi': 'warn',
            'no-unreachable': 'error',
            'no-constant-condition': 'warn',
            'use-isnan': 'error',
            'valid-typeof': 'error',
            // Prevent silent errors
            'no-empty-pattern': 'error',
            'no-self-assign': 'error',
            'no-self-compare': 'error',
            'eqeqeq': ['warn', 'smart'],
        },
    },
    {
        // Ignore minified files, data files, external libs
        ignores: [
            '**/*.min.js',
            'data/**',
            'node_modules/**',
            'blog/**',
            'tools/**',
            'correr-juntos-app/**',
        ],
    },
];
