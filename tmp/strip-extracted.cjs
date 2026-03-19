/**
 * strip-extracted.cjs
 * Removes extracted function bodies from app.js by replacing them with
 * a single-line comment indicating where they moved.
 *
 * Strategy: For each range, replace lines with a comment.
 * We process ranges in REVERSE order to avoid line number shifts.
 */
const fs = require('fs');
const path = require('path');

const APP_JS = path.join(__dirname, '..', 'js', 'app.js');
let lines = fs.readFileSync(APP_JS, 'utf8').split('\n');

// All extracted ranges (from the split script) + their destinations
const extractions = [
    // UI module
    { start: 150, end: 164, dest: 'ui.js' },
    { start: 1619, end: 1630, dest: 'ui.js' },
    { start: 3456, end: 3470, dest: 'ui.js' },
    { start: 3575, end: 3602, dest: 'ui.js' },
    { start: 3621, end: 3622, dest: 'ui.js' },  // __cjPrevFocus, __cjFocusableSelector vars
    { start: 3623, end: 3709, dest: 'ui.js' },
    { start: 5660, end: 5663, dest: 'ui.js' },
    { start: 5821, end: 5835, dest: 'ui.js' },
    { start: 7176, end: 7190, dest: 'ui.js' },
    { start: 8245, end: 8315, dest: 'ui.js' },

    // Auth module
    { start: 3855, end: 3856, dest: 'auth.js' },
    { start: 3857, end: 3871, dest: 'auth.js' },
    { start: 3872, end: 3873, dest: 'auth.js' },
    { start: 3874, end: 3905, dest: 'auth.js' },
    { start: 3906, end: 3947, dest: 'auth.js' },
    { start: 4584, end: 4604, dest: 'auth.js' },
    { start: 4605, end: 4636, dest: 'auth.js' },
    { start: 4637, end: 4751, dest: 'auth.js' },
    { start: 4752, end: 4777, dest: 'auth.js' },
    { start: 4778, end: 4916, dest: 'auth.js' },
    { start: 4917, end: 5003, dest: 'auth.js' },
    { start: 5004, end: 5123, dest: 'auth.js' },
    { start: 5124, end: 5335, dest: 'auth.js' },

    // Profile module
    { start: 1204, end: 1205, dest: 'profile.js' },
    { start: 1206, end: 1442, dest: 'profile.js' },
    { start: 1443, end: 1514, dest: 'profile.js' },
    { start: 2491, end: 2491, dest: 'profile.js' },  // verifyFileData declaration
    { start: 2493, end: 2755, dest: 'profile.js' },
    { start: 2852, end: 3122, dest: 'profile.js' },
    { start: 3123, end: 3268, dest: 'profile.js' },
    { start: 4136, end: 4208, dest: 'profile.js' },
    { start: 4209, end: 4288, dest: 'profile.js' },
    { start: 4289, end: 4341, dest: 'profile.js' },
    { start: 4342, end: 4494, dest: 'profile.js' },
    { start: 4495, end: 4583, dest: 'profile.js' },

    // Map core module
    { start: 3270, end: 3355, dest: 'map-core.js' },
    { start: 3356, end: 3455, dest: 'map-core.js' },
    { start: 5335, end: 5335, dest: 'map-core.js' },  // _leafletP declaration
    { start: 5336, end: 5372, dest: 'map-core.js' },
    { start: 5373, end: 5458, dest: 'map-core.js' },
    { start: 5459, end: 5604, dest: 'map-core.js' },
    { start: 5605, end: 5663, dest: 'map-core.js' },
    { start: 5664, end: 5776, dest: 'map-core.js' },
    { start: 5777, end: 5915, dest: 'map-core.js' },
    { start: 5916, end: 5996, dest: 'map-core.js' },
    { start: 5997, end: 6151, dest: 'map-core.js' },
    { start: 6152, end: 6376, dest: 'map-core.js' },
    { start: 6377, end: 6606, dest: 'map-core.js' },

    // Quedadas module
    { start: 1515, end: 1618, dest: 'quedadas.js' },
    { start: 2753, end: 2753, dest: 'quedadas.js' },  // currentShareQuedadaId
    { start: 2755, end: 2851, dest: 'quedadas.js' },
    { start: 3367, end: 3367, dest: 'quedadas.js' },  // floatingCardQuedada
    { start: 3472, end: 3574, dest: 'quedadas.js' },
    { start: 3604, end: 3622, dest: 'quedadas.js' },
    { start: 3710, end: 3854, dest: 'quedadas.js' },
    { start: 7191, end: 7400, dest: 'quedadas.js' },
    { start: 7401, end: 7856, dest: 'quedadas.js' },
    { start: 7857, end: 7883, dest: 'quedadas.js' },
    { start: 7884, end: 8244, dest: 'quedadas.js' },
    { start: 8316, end: 8656, dest: 'quedadas.js' },
    { start: 8657, end: 8827, dest: 'quedadas.js' },
    { start: 8827, end: 9095, dest: 'quedadas.js' },
    { start: 9096, end: 9363, dest: 'quedadas.js' },
    { start: 9364, end: 9482, dest: 'quedadas.js' },
    { start: 9483, end: 9545, dest: 'quedadas.js' },
    { start: 9546, end: 9707, dest: 'quedadas.js' },
    { start: 9708, end: 9777, dest: 'quedadas.js' },

    // Filters module
    { start: 2003, end: 2004, dest: 'filters.js' },  // activeFilters, filtersVisible
    { start: 2006, end: 2321, dest: 'filters.js' },
];

// Sort by start line DESCENDING so we can safely splice
extractions.sort((a, b) => b.start - a.start);

// Merge overlapping ranges (since we sorted DESC, merge adjacent)
const merged = [];
for (const r of extractions) {
    if (merged.length > 0) {
        const last = merged[merged.length - 1];
        // Check if this range overlaps or is adjacent to the last
        if (r.end >= last.start - 1) {
            // Extend the merged range
            last.start = Math.min(last.start, r.start);
            last.dest = last.dest.includes(r.dest) ? last.dest : last.dest + '+' + r.dest;
            continue;
        }
    }
    merged.push({ ...r });
}

console.log(`Processing ${merged.length} merged ranges (from ${extractions.length} original)...`);

let totalRemoved = 0;
for (const { start, end, dest } of merged) {
    const count = end - start + 1;
    const comment = `        // → moved to js/modules/${dest} (${count} lines)`;
    lines.splice(start - 1, count, comment);
    totalRemoved += count - 1; // -1 because we insert 1 comment line
}

// Write result
fs.writeFileSync(APP_JS, lines.join('\n'), 'utf8');

const newLineCount = lines.length;
console.log(`\nDone!`);
console.log(`Lines removed: ~${totalRemoved}`);
console.log(`app.js now: ${newLineCount} lines`);
