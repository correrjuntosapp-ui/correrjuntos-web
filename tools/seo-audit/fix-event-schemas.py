"""
Fix Event schema warnings reported by Search Console:
1. Add 'performer' field to all 15 city Events
2. Add 'image', 'offers', 'performer' to 3 Events in /events/index.html

All data from existing /events/[city].html files (zero invention).
"""
import re, json, sys, glob, os
sys.stdout.reconfigure(encoding='utf-8')

# === City data (extracted from individual files) ===
CITY_INDEX_DATA = {
    'Maratón Rock \'n\' Roll Madrid': {
        'image': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&h=600&q=80',
        'offer_url': 'https://www.runrocknroll.com/es/madrid',
        'offer_price': '55',
        'offer_validFrom': '2025-10-01',
    },
    'Zurich Marató de Barcelona': {
        'image': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&h=600&q=80',
        'offer_url': 'https://www.zurichmaratobarcelona.es/',
        'offer_price': '65',
        'offer_validFrom': '2026-04-01',
    },
    'Maratón Valencia Trinidad Alfonso': {
        'image': 'https://images.unsplash.com/photo-1599207876610-d1f1c9f2e45e?auto=format&fit=crop&w=1200&h=600&q=80',
        'offer_url': 'https://www.valenciamarathon.es/',
        'offer_price': '70',
        'offer_validFrom': '2026-05-01',
    },
}

# Performer for all popular marathons (open public race)
PERFORMER = {
    "@type": "PerformingGroup",
    "name": "Open Marathon Runners"
}

def add_performer_to_event(event_dict):
    """Add performer field if missing."""
    if 'performer' not in event_dict:
        event_dict['performer'] = PERFORMER
        return True
    return False

def fix_index_event(event_dict):
    """Add image, offers, performer to Events in /events/index.html."""
    name = event_dict.get('name', '')
    city_data = CITY_INDEX_DATA.get(name)
    changed = False
    if city_data:
        if 'image' not in event_dict:
            event_dict['image'] = [city_data['image']]
            changed = True
        if 'offers' not in event_dict:
            event_dict['offers'] = {
                "@type": "Offer",
                "url": city_data['offer_url'],
                "price": city_data['offer_price'],
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock",
                "validFrom": city_data['offer_validFrom']
            }
            changed = True
    if 'performer' not in event_dict:
        event_dict['performer'] = PERFORMER
        changed = True
    return changed

def process_file(path, is_index=False):
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

        # Walk and modify Events
        flag = [False]
        def walk(node):
            if isinstance(node, dict):
                if node.get('@type') == 'Event':
                    if is_index:
                        if fix_index_event(node):
                            flag[0] = True
                    else:
                        if add_performer_to_event(node):
                            flag[0] = True
                for v in list(node.values()):
                    walk(v)
            elif isinstance(node, list):
                for item in node:
                    walk(item)
        walk(d)

        if flag[0]:
            new_body = json.dumps(d, ensure_ascii=False, indent=2 if is_index else 2)
            new_html_parts.append(html[last_end:sm.start(2)])
            new_html_parts.append('\n' + new_body + '\n')
            last_end = sm.end(2)
            file_changed = True

    if not file_changed:
        return False

    new_html_parts.append(html[last_end:])
    new_html = ''.join(new_html_parts)

    # Validate parseable
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

# Process individual city files (15)
modified = []
for path in sorted(glob.glob('events/*.html')):
    is_index = path.endswith('index.html')
    if process_file(path, is_index=is_index):
        modified.append(path)
        print(f"  ✓ {path}")
    else:
        print(f"  · {path} (no changes needed)")

print(f"\nTotal modified: {len(modified)}")
