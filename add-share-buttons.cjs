const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');

const shareButtonsHTML = `
<!-- Share Buttons -->
<div class="share-article" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:32px 0;padding:20px;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.15);border-radius:16px">
  <span style="color:#94a3b8;font-size:.85rem;font-weight:600">Compartir:</span>
  <a href="#" onclick="event.preventDefault();window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(document.title+' '+location.href),'_blank','width=600,height=400')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#25D366;color:#fff;border-radius:999px;font-size:.8rem;font-weight:700;text-decoration:none;transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
    <svg style="width:16px;height:16px" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.682-1.228A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.204 0-4.243-.7-5.912-1.892l-.413-.297-2.783.73.744-2.717-.326-.436A9.962 9.962 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
    WhatsApp
  </a>
  <a href="#" onclick="event.preventDefault();window.open('https://x.com/intent/tweet?text='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(location.href)+'&via=CorrerJuntos','_blank','width=600,height=400')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#1e293b;color:#fff;border-radius:999px;font-size:.8rem;font-weight:700;text-decoration:none;transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
    <svg style="width:14px;height:14px" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    X
  </a>
  <a href="#" onclick="event.preventDefault();navigator.clipboard.writeText(location.href).then(function(){var b=this;b.textContent='✓ Copiado';setTimeout(function(){b.innerHTML='📋 Copiar link'},2000)}.bind(this))" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:rgba(255,255,255,.08);color:#cbd5e1;border:1px solid rgba(255,255,255,.12);border-radius:999px;font-size:.8rem;font-weight:600;text-decoration:none;cursor:pointer;transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📋 Copiar link</a>
</div>`;

let updated = 0;
let skipped = 0;

for (const file of files) {
    const filePath = path.join(blogDir, file);
    let html = fs.readFileSync(filePath, 'utf-8');

    // Skip if already has share buttons
    if (html.includes('share-article')) {
        skipped++;
        continue;
    }

    // Find the author box - insert share buttons right after it
    const authorBoxEnd = html.indexOf('</div>\n</div>\n<!-- Author Box End -->');
    if (authorBoxEnd !== -1) {
        const insertPos = authorBoxEnd + '</div>\n</div>\n<!-- Author Box End -->'.length;
        html = html.slice(0, insertPos) + '\n' + shareButtonsHTML + html.slice(insertPos);
        fs.writeFileSync(filePath, html, 'utf-8');
        updated++;
        continue;
    }

    // Alternative: insert after the first h1 + intro paragraph area
    // Look for the first <h2 in article content as insertion point
    const articleContent = html.indexOf('<article');
    if (articleContent !== -1) {
        // Find first h2 after article tag
        const firstH2 = html.indexOf('<h2', articleContent);
        if (firstH2 !== -1) {
            html = html.slice(0, firstH2) + shareButtonsHTML + '\n' + html.slice(firstH2);
            fs.writeFileSync(filePath, html, 'utf-8');
            updated++;
            continue;
        }
    }

    // Fallback: insert before newsletter section
    const newsletter = html.indexOf('class="cta-box"');
    if (newsletter !== -1) {
        const divBefore = html.lastIndexOf('<div', newsletter);
        if (divBefore !== -1) {
            html = html.slice(0, divBefore) + shareButtonsHTML + '\n' + html.slice(divBefore);
            fs.writeFileSync(filePath, html, 'utf-8');
            updated++;
            continue;
        }
    }

    console.log('Could not find insertion point for:', file);
    skipped++;
}

console.log(`Share buttons added to ${updated} files, ${skipped} skipped`);
