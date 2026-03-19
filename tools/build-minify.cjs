/**
 * build-minify.cjs
 * Minifies all JS modules + app.js using terser.
 * Run: node tools/build-minify.cjs
 */
const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FILES = [
    // Core modules
    'js/modules/state.js',
    'js/modules/validation.js',
    'js/modules/error-handler.js',
    'js/modules/toast.js',
    'js/modules/skeletons.js',
    'js/modules/confetti.js',
    'js/modules/darkmode.js',
    'js/modules/badges.js',
    'js/modules/i18n-ui.js',
    // Feature modules (Phase 4)
    'js/modules/ui.js',
    'js/modules/auth.js',
    'js/modules/profile.js',
    'js/modules/map-core.js',
    'js/modules/quedadas.js',
    'js/modules/filters.js',
    // Premium + PWA
    'js/premium-features.js',
    'js/pwa.js',
    // Main app
    'js/app.js',
];

const TERSER_OPTS = {
    compress: {
        dead_code: true,
        drop_console: false, // Keep console.warn for error reporting
        passes: 2,
    },
    mangle: {
        reserved: ['AppState', 'I18N', 'META_I18N', 'PLAN_FEATURES', 'COUNTRY_CODE_FLAGS', 'LOCATIONS_ES_PT'],
    },
    output: {
        comments: false,
    },
};

(async () => {
    let totalOriginal = 0;
    let totalMinified = 0;
    let errors = 0;

    for (const relPath of FILES) {
        const srcPath = path.join(ROOT, relPath);
        const outPath = srcPath.replace(/\.js$/, '.min.js');

        if (!fs.existsSync(srcPath)) {
            console.log(`  SKIP ${relPath} (not found)`);
            continue;
        }

        const src = fs.readFileSync(srcPath, 'utf8');
        try {
            const result = await minify(src, TERSER_OPTS);
            if (result.error) throw result.error;

            fs.writeFileSync(outPath, result.code, 'utf8');
            const origSize = (src.length / 1024).toFixed(1);
            const minSize = (result.code.length / 1024).toFixed(1);
            const savings = (100 - (result.code.length / src.length * 100)).toFixed(0);
            console.log(`  ✅ ${relPath}: ${origSize}KB → ${minSize}KB (-${savings}%)`);
            totalOriginal += src.length;
            totalMinified += result.code.length;
        } catch (e) {
            console.error(`  ❌ ${relPath}: ${e.message}`);
            errors++;
        }
    }

    console.log(`\n  Total: ${(totalOriginal/1024).toFixed(0)}KB → ${(totalMinified/1024).toFixed(0)}KB (-${(100 - totalMinified/totalOriginal*100).toFixed(0)}%)`);
    if (errors) console.log(`  ${errors} error(s)`);
    else console.log('  All files minified successfully!');
})();
