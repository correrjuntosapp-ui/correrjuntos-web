#!/usr/bin/env python3
"""
Fix Google Search Console issues for SportsEvent structured data.
Adds 'organizer' object to each SportsEvent missing it, and adds 'url'
to organizer blocks missing it.
"""
import re
import os
import sys

FILES = [
    'blog/calendario-carreras-populares-2026.html',
    'blog/en/running-races-spain-2026.html',
    'blog/mejores-carreras-running-andalucia-2026.html',
    'blog/cursa-de-la-merce-2026.html',
]


def find_balanced(s, start):
    """Find matching } for { at start position."""
    depth = 0
    for i in range(start, len(s)):
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                return i
    return -1


def fix_file(filepath):
    with open(filepath, encoding='utf-8') as f:
        content = f.read()

    original = content
    fixed_count = 0
    url_added = 0

    # Find all SportsEvent @type matches (regex handles spaces)
    matches = list(re.finditer(r'"@type"\s*:\s*"SportsEvent"', content))

    # Process in REVERSE order so positions stay valid
    for m in reversed(matches):
        # Walk back to opening {
        bs = m.start()
        while bs > 0 and content[bs] != '{':
            bs -= 1
        if content[bs] != '{':
            continue

        # Find matching }
        be = find_balanced(content, bs)
        if be == -1:
            continue

        block = content[bs:be + 1]

        # Extract name and url from event (search whole block)
        name_match = re.search(r'"name"\s*:\s*"([^"]+)"', block)
        url_match = re.search(r'"url"\s*:\s*"([^"]+)"', block)

        if '"organizer"' in block:
            # Check if organizer has url inside it
            org_match = re.search(
                r'"organizer"\s*:\s*\{([^}]+)\}',
                block, re.DOTALL
            )
            if org_match and '"url"' not in org_match.group(1):
                if not url_match:
                    continue
                # Add url to existing organizer
                org_content = org_match.group(1).strip().rstrip(',')
                new_org = f'"organizer": {{{org_content}, "url": "{url_match.group(1)}"}}'
                new_block = block[:org_match.start()] + new_org + block[org_match.end():]
                content = content[:bs] + new_block + content[be + 1:]
                url_added += 1
            continue

        # No organizer at all — add it
        if not name_match or not url_match:
            continue
        event_name = name_match.group(1)
        event_url = url_match.group(1)
        safe_name = event_name.replace('"', '\\"')
        organizer = (
            f',\n      "organizer": {{'
            f'"@type": "Organization", '
            f'"name": "{safe_name}", '
            f'"url": "{event_url}"'
            f'}}'
        )

        # Insert before closing } of the block
        # Block ends with "}"  → strip the } and append organizer + }
        new_block = block[:-1].rstrip() + organizer + '\n    }'
        content = content[:bs] + new_block + content[be + 1:]
        fixed_count += 1

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return fixed_count, url_added
    return 0, 0


def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    total_fixed = 0
    total_url = 0
    for filepath in FILES:
        full = os.path.join(project_root, filepath)
        if not os.path.exists(full):
            print(f'  {filepath}: not found')
            continue
        fixed, url = fix_file(full)
        total_fixed += fixed
        total_url += url
        if fixed or url:
            print(f'[OK] {filepath}: +{fixed} organizers, +{url} urls')
        else:
            print(f'     {filepath}: no changes')

    print(f'\n[DONE] Total: {total_fixed} organizers added + {total_url} urls added')


if __name__ == '__main__':
    main()
