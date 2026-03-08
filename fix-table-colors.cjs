const fs = require('fs');
const path = require('path');

// Find all HTML files with the light-mode table color bug
const dirs = ['blog', 'blog/en'];
let fixed = 0;

dirs.forEach(dir => {
  fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.html') || file === 'index.html') return;
    const fp = path.join(dir, file);
    let c = fs.readFileSync(fp, 'utf8');

    // Fix 1: Change light-mode .specs-table td color from dark-mode gray to warm dark
    if (c.includes('.specs-table td{color:#cbd5e1}')) {
      c = c.replace('.specs-table td{color:#cbd5e1}', '.specs-table td{color:#3d3229}');

      // Fix 2: Ensure dark-mode .specs-table rules exist
      if (!c.includes('.dark-mode .specs-table td{color:#cbd5e1}')) {
        // Add dark-mode specs-table rules if they reference .comparison-table
        if (c.includes('.dark-mode .comparison-table td{color:#cbd5e1}')) {
          c = c.replace(
            '.dark-mode .comparison-table th{background:rgba(249,115,22,.12)}',
            '.dark-mode .comparison-table th,.dark-mode .specs-table th{background:rgba(249,115,22,.12)}'
          );
          c = c.replace(
            '.dark-mode .comparison-table td{color:#cbd5e1;border-bottom-color:rgba(255,255,255,.06)}',
            '.dark-mode .comparison-table td,.dark-mode .specs-table td{color:#cbd5e1;border-bottom-color:rgba(255,255,255,.06)}'
          );
          c = c.replace(
            '.dark-mode .comparison-table td:first-child{color:#fff}',
            '.dark-mode .comparison-table td:first-child,.dark-mode .specs-table td:first-child{color:#fff}'
          );
        } else {
          // No comparison-table dark rules — add specs-table dark rules before closing </style>
          const darkRules = '.dark-mode .specs-table th{background:rgba(249,115,22,.12)}.dark-mode .specs-table td{color:#cbd5e1;border-bottom-color:rgba(255,255,255,.06)}.dark-mode .specs-table td:first-child{color:#fff}';
          // Insert before the last .dark-mode rule or before </style>
          const insertPoint = c.lastIndexOf('.dark-mode .cookie-banner');
          if (insertPoint > -1) {
            c = c.slice(0, insertPoint) + darkRules + '\n' + c.slice(insertPoint);
          }
        }
      }

      fs.writeFileSync(fp, c);
      fixed++;
      console.log('  Fixed: ' + fp);
    }
  });
});

console.log('\nTotal fixed: ' + fixed);
