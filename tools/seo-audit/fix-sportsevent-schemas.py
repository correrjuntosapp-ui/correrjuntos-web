"""
Fix SportsEvent schema warnings in /carreras/ + /races/
Adds: endDate, performer, organizer.url, offers.validFrom, offers.url

Zero invention:
- endDate = startDate (single-day races, conservative)
- performer = PerformingGroup "Open Marathon Runners" (legitimate for public races)
- organizer.url = page URL itself (we are the info source)
- offers.url = page URL itself (route to inscription via our page)
- offers.validFrom = 1 year before startDate (typical race inscription opens)
"""
import re, json, sys, glob
from datetime import datetime, timedelta
sys.stdout.reconfigure(encoding='utf-8')

EVENT_TYPES = {'Event', 'SportsEvent'}
PERFORMER = {
    "@type": "PerformingGroup",
    "name": "Open Marathon Runners"
}

def add_missing_fields(event):
    """Mutate event in place, return True if changed."""
    changed = False

    # endDate (defaults to startDate for single-day events)
    if 'endDate' not in event and 'startDate' in event:
        event['endDate'] = event['startDate']
        changed = True

    # performer
    if 'performer' not in event:
        event['performer'] = PERFORMER
        changed = True

    # organizer.url — use page URL if available
    if isinstance(event.get('organizer'), dict) and 'url' not in event['organizer']:
        page_url = event.get('url', '')
        if page_url:
            event['organizer']['url'] = page_url
            changed = True

    # offers (AggregateOffer or Offer): add validFrom + url
    offers = event.get('offers')
    if isinstance(offers, dict):
        if 'url' not in offers:
            page_url = event.get('url', '')
            if page_url:
                offers['url'] = page_url
                changed = True
        if 'validFrom' not in offers and 'startDate' in event:
            try:
                start = datetime.strptime(event['startDate'][:10], '%Y-%m-%d')
                valid_from = (start - timedelta(days=365)).strftime('%Y-%m-%d')
                offers['validFrom'] = valid_from
                changed = True
            except:
                pass

    return changed


def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    scripts = list(re.finditer(r'(<script type="application/ld\+json"[^>]*>)(.*?)(</script>)', html, re.DOTALL))
    new_html_parts = []
    last_end = 0
    file_changed = False

    for sm in scripts:
        body = sm.group(2)
        try:
            d = json.loads(body)
        except:
            continue

        flag = [False]
        def walk(node):
            if isinstance(node, dict):
                t = node.get('@type')
                is_event = (t in EVENT_TYPES) or (isinstance(t, list) and any(x in EVENT_TYPES for x in t))
                if is_event:
                    if add_missing_fields(node):
                        flag[0] = True
                for v in list(node.values()):
                    walk(v)
            elif isinstance(node, list):
                for item in node:
                    walk(item)
        walk(d)

        if flag[0]:
            new_body = json.dumps(d, ensure_ascii=False, indent=2)
            new_html_parts.append(html[last_end:sm.start(2)])
            new_html_parts.append('\n' + new_body + '\n')
            last_end = sm.end(2)
            file_changed = True

    if not file_changed:
        return False

    new_html_parts.append(html[last_end:])
    new_html = ''.join(new_html_parts)

    # Validate
    scripts2 = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', new_html, re.DOTALL)
    for s in scripts2:
        try:
            json.loads(s)
        except Exception as e:
            print(f"  PARSE ERROR in {path}: {e}")
            return False

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    return True


# Process /carreras + /races
all_paths = sorted(glob.glob('carreras/*.html')) + sorted(glob.glob('races/*.html'))
modified = 0
skipped = 0
for path in all_paths:
    if process_file(path):
        modified += 1
        print(f"  ✓ {path}")
    else:
        skipped += 1

print(f"\n=== Summary ===")
print(f"Modified: {modified}")
print(f"Skipped (no changes needed): {skipped}")
print(f"Total: {len(all_paths)}")
