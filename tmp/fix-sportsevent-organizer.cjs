#!/usr/bin/env node
/**
 * Fix Google Search Console issues:
 * 1. "Falta el campo 'organizer'" — add organizer object to SportsEvents missing it
 * 2. "Falta el campo 'url' en organizer" — add url to organizer blocks missing it
 *
 * Approach for organizer: use event name as organizer name + event url as organizer url
 * (semantically correct: the race's official website IS the organizer's website).
 */

const fs = require('fs');
const path = require('path');

const FILES = [
  'blog/calendario-carreras-populares-2026.html',
  'blog/en/running-races-spain-2026.html',
  'blog/mejores-carreras-running-andalucia-2026.html',
  'blog/cursa-de-la-merce-2026.html',
];

function findBalancedBlock(str, startIdx) {
  // Find matching closing } for the { at startIdx
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function fixFile(filepath) {
  const fullPath = path.join(__dirname, '..', filepath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalLength = content.length;

  let fixedCount = 0;
  let urlAddedCount = 0;
  let pos = 0;

  while (true) {
    // Find next SportsEvent
    const idx = content.indexOf('"@type":"SportsEvent"', pos);
    if (idx === -1) break;

    // Find the opening { before this @type
    let blockStart = idx;
    while (blockStart > 0 && content[blockStart] !== '{') blockStart--;
    if (content[blockStart] !== '{') {
      pos = idx + 1;
      continue;
    }

    // Find the matching closing }
    const blockEnd = findBalancedBlock(content, blockStart);
    if (blockEnd === -1) {
      pos = idx + 1;
      continue;
    }

    const block = content.substring(blockStart, blockEnd + 1);

    // Already has organizer?
    if (block.includes('"organizer"')) {
      // Check if organizer has url inside
      const orgMatch = block.match(/"organizer"\s*:\s*\{([^}]+)\}/);
      if (orgMatch && !orgMatch[1].includes('"url"')) {
        // Add url to existing organizer
        const nameMatch = block.match(/"name"\s*:\s*"([^"]+)"/);
        const urlMatch = block.match(/"url"\s*:\s*"([^"]+)"/);
        if (urlMatch) {
          const orgWithUrl = `"organizer":{${orgMatch[1].trim()},"url":"${urlMatch[1]}"}`;
          const newBlock = block.replace(/"organizer"\s*:\s*\{[^}]+\}/, orgWithUrl);
          content = content.substring(0, blockStart) + newBlock + content.substring(blockEnd + 1);
          urlAddedCount++;
          pos = blockStart + newBlock.length;
          continue;
        }
      }
      pos = blockEnd + 1;
      continue;
    }

    // Extract name and url from event
    const nameMatch = block.match(/"name"\s*:\s*"([^"]+)"/);
    const urlMatch = block.match(/"url"\s*:\s*"([^"]+)"/);

    if (!nameMatch || !urlMatch) {
      pos = blockEnd + 1;
      continue;
    }

    // Build organizer
    const eventName = nameMatch[1];
    const eventUrl = urlMatch[1];
    // Escape any quotes in name
    const safeName = eventName.replace(/"/g, '\\"');
    const organizer = `,"organizer":{"@type":"Organization","name":"${safeName}","url":"${eventUrl}"}`;

    // Insert organizer right before the closing } of the block
    const newBlock = block.substring(0, block.length - 1) + organizer + '}';
    content = content.substring(0, blockStart) + newBlock + content.substring(blockEnd + 1);

    fixedCount++;
    pos = blockStart + newBlock.length;
  }

  if (fixedCount > 0 || urlAddedCount > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ ${filepath}: +${fixedCount} organizer added, ${urlAddedCount} url added (${content.length - originalLength} bytes diff)`);
  } else {
    console.log(`  ${filepath}: no changes needed`);
  }

  return { fixed: fixedCount, urlAdded: urlAddedCount };
}

console.log('🔧 Fixing SportsEvent organizer fields per Google Search Console alerts\n');
let totalFixed = 0;
let totalUrl = 0;
for (const f of FILES) {
  try {
    const result = fixFile(f);
    totalFixed += result.fixed;
    totalUrl += result.urlAdded;
  } catch (e) {
    console.error(`✗ ${f}: ${e.message}`);
  }
}
console.log(`\n✅ Done: ${totalFixed} organizers added + ${totalUrl} urls added across ${FILES.length} files`);
