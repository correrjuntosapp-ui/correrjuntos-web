"""
Reusable Product+Offer schema injector for blog comparativa pages.
Reads existing ItemList in JSON-LD, expands each item with Product schema.
Validates Amazon image URLs (SL1500), normalizes body images.
Zero invention: only data extracted from HTML.
"""
import json, re, sys, urllib.request, urllib.error
sys.stdout.reconfigure(encoding='utf-8')

def slugify(name):
    s = name.lower().replace('&', 'and')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return re.sub(r'-+', '-', s).strip('-')

def check_url(url, timeout=5):
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except:
        return 0

def extract_products(html):
    pattern = r'<h[23][^>]*>\s*(\d{1,2})\.\s*(.+?)(?:\s*&mdash;\s*(.+?))?</h[23]>'
    matches = list(re.finditer(pattern, html))
    products = []
    for i, m in enumerate(matches):
        pos = int(m.group(1))
        if pos > 15:
            continue
        name = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        name = name.replace('&amp;', '&').replace('&mdash;', '-').replace('&nbsp;', ' ')
        qualifier = ''
        if m.group(3):
            qualifier = re.sub(r'<[^>]+>', '', m.group(3)).strip().replace('&amp;', '&')
        # If name contains " - " (regular hyphen separator), split: name | qualifier
        if not qualifier and ' - ' in name:
            parts = name.split(' - ', 1)
            name = parts[0].strip()
            qualifier = parts[1].strip()
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else min(start + 3500, len(html))
        block = html[start:end]
        desc_m = re.search(r'<p[^>]*>(.*?)</p>', block, re.DOTALL)
        desc = ''
        if desc_m:
            desc = re.sub(r'<[^>]+>', '', desc_m.group(1))
            desc = desc.replace('&amp;', '&').replace('&mdash;', '-').replace('&nbsp;', ' ')
            desc = re.sub(r'&\w+;', ' ', desc)
            desc = re.sub(r'\s+', ' ', desc).strip()
        imgs = re.findall(r'<img[^>]+src="(https?://m\.media-amazon\.com/[^"]+)"', block)
        # Match either amazon.es/dp/X OR amzn.to/X shortlink
        link_m = re.search(r'href="(https?://(?:www\.amazon\.[a-z.]+|amzn\.to)/[^"]+)"', block)
        products.append({
            'position': pos,
            'name': name,
            'qualifier': qualifier,
            'description': desc[:280],
            'image_orig': imgs[0] if imgs else '',
            'amazon_url': link_m.group(1) if link_m else '',
        })
    return products

BRAND_OVERRIDES = {
    'SiS': 'SiS', '226ERS': '226ERS', 'High5': 'High5', 'PowerBar': 'PowerBar',
    'Maurten': 'Maurten', 'Nuun': 'Nuun', 'Tailwind': 'Tailwind',
    'Isostar': 'Isostar', 'Crown': 'Crown Sport', 'Hoka': 'Hoka',
    'Nike': 'Nike', 'Asics': 'Asics', 'Adidas': 'Adidas', 'Brooks': 'Brooks',
    'Saucony': 'Saucony', 'New': 'New Balance', 'On': 'On',
    'Salomon': 'Salomon', 'Garmin': 'Garmin', 'COROS': 'COROS', 'Polar': 'Polar',
    'Apple': 'Apple', 'Suunto': 'Suunto', 'NOW': 'NOW Foods',
    'Nordic': 'Nordic Naturals', 'OmegaXL': 'OmegaXL', 'Solgar': 'Solgar',
    'Carlson': 'Carlson', 'Ovega-3': 'Ovega-3', 'Nature': 'Nature Made',
    'Wiley': 'Wiley', 'GU': 'GU', 'Honey': 'Honey Stinger',
    'Clif': 'Clif', 'Salt': 'SaltStick', 'Spring': 'Spring Energy',
    'Fitletic': 'Fitletic', 'Nathan': 'Nathan', 'Flipbelt': 'Flipbelt',
    'SPIbelt': 'SPIbelt', 'CamelBak': 'CamelBak',
    'Ultimate': 'Ultimate Direction',
}

def infer_brand(name):
    first = name.split()[0]
    return BRAND_OVERRIDES.get(first, first)

def process_page(filepath, list_name, currency='EUR'):
    print(f"\n=== Processing {filepath} ===")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    products = extract_products(html)
    print(f"Extracted {len(products)} products")
    if not products:
        print("ABORT: no products found")
        return False

    for p in products:
        if not p['image_orig']:
            p['image_final'] = None
            continue
        sl1500 = re.sub(r'_AC_S[XY]\d+_', '_AC_SL1500_', p['image_orig'])
        code = check_url(sl1500)
        p['image_final'] = sl1500 if code == 200 else p['image_orig']
        print(f"  #{p['position']}: {p['name'][:35]:<35} img {'OK' if code == 200 else 'fallback'}")

    valid = [p for p in products if p['name'] and p['amazon_url']]
    if len(valid) < len(products):
        print(f"WARNING: {len(products) - len(valid)} skipped (missing name/url)")

    items = []
    for p in valid:
        slug = slugify(p['name'])
        brand = infer_brand(p['name'])
        desc_parts = []
        if p['qualifier']:
            desc_parts.append(p['qualifier'].rstrip('.').strip())
        if p['description']:
            desc_parts.append(p['description'].rstrip('.').strip())
        description = ('. '.join(desc_parts).strip())[:280]
        if description and not description.endswith('.'):
            description += '.'
        product = {
            "@type": "Product",
            "@id": f"https://www.correrjuntos.com/products/{slug}",
            "name": p['name'],
            "brand": {"@type": "Brand", "name": brand},
            "description": description,
            "offers": {"@type": "Offer", "url": p['amazon_url'], "priceCurrency": currency},
        }
        if p.get('image_final'):
            product['image'] = p['image_final']
        items.append({"@type": "ListItem", "position": p['position'], "item": product})

    new_itemlist = {
        "@type": "ItemList",
        "name": list_name,
        "numberOfItems": len(items),
        "itemListElement": items,
    }

    flag = [False]
    def replace_in(node):
        if isinstance(node, dict):
            if node.get('@type') == 'ItemList':
                node.clear()
                node.update(new_itemlist)
                flag[0] = True
                return True
            for v in list(node.values()):
                if replace_in(v):
                    return True
        elif isinstance(node, list):
            for item in node:
                if replace_in(item):
                    return True
        return False

    scripts = list(re.finditer(r'(<script type="application/ld\+json"[^>]*>)(.*?)(</script>)', html, re.DOTALL))
    new_html_parts = []
    last_end = 0
    injected = False
    for sm in scripts:
        body = sm.group(2)
        try:
            d = json.loads(body)
        except:
            continue
        if replace_in(d):
            new_body = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
            new_html_parts.append(html[last_end:sm.start(2)])
            new_html_parts.append(new_body)
            last_end = sm.end(2)
            injected = True
            break

    if not injected:
        new_script = '<script type="application/ld+json">' + json.dumps(new_itemlist, ensure_ascii=False, separators=(',', ':')) + '</script>\n'
        if '</head>' in html:
            html = html.replace('</head>', new_script + '</head>', 1)
            new_html_parts = [html]
            last_end = len(html)
            print("  ItemList ADDED as new script (no existing found)")
        else:
            print("  ABORT: cannot inject")
            return False
    else:
        new_html_parts.append(html[last_end:])

    html = ''.join(new_html_parts)

    img_before = len(re.findall(r'_AC_S[XY]\d+_', html))
    html = re.sub(r'(m\.media-amazon\.com/images/I/[A-Za-z0-9+%-]+)\._AC_S[XY]\d+_\.', r'\1._AC_SL1500_.', html)
    img_after = len(re.findall(r'_AC_S[XY]\d+_', html))
    print(f"  Body images normalized: {img_before - img_after}/{img_before}")

    scripts2 = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
    for s in scripts2:
        try:
            json.loads(s)
        except Exception as e:
            print(f"  PARSE ERROR: {e}")
            return False

    issues = sum(1 for p in valid if p['name'] not in html)
    if issues:
        print(f"  WARNING: {issues}/{len(valid)} names missing from HTML")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  WRITTEN. Products: {len(items)}, valid JSON, coherence: {len(valid) - issues}/{len(valid)}")
    return True


PAGES = [
    ('blog/en/best-omega-3-running.html', '10 Best Omega-3 Supplements for Runners 2026', 'EUR'),
    ('blog/en/best-energy-gels-running.html', '10 Best Energy Gels for Running 2026', 'EUR'),
    ('blog/en/running-belts.html', '8 Best Running Belts 2026', 'EUR'),
    ('blog/mejores-zapatillas-running-asfalto.html', '10 Mejores Zapatillas Running Asfalto 2026', 'EUR'),
]

if __name__ == '__main__':
    if len(sys.argv) > 1:
        idx = int(sys.argv[1])
        path, name, curr = PAGES[idx]
        process_page(path, name, curr)
    else:
        for path, name, curr in PAGES:
            process_page(path, name, curr)
