"""Audit Offers missing hasMerchantReturnPolicy / shippingDetails."""
import re, json, sys, os
sys.stdout.reconfigure(encoding='utf-8')

SKIP_DIRS = ['node_modules', 'correr-juntos-app', 'tmp', '.git', '.claude', 'output']

problem_files = []
for root, _, files in os.walk('.'):
    if any(x in root for x in SKIP_DIRS):
        continue
    for fname in files:
        if not fname.endswith('.html'):
            continue
        path = os.path.join(root, fname).replace(os.sep, '/').lstrip('./')
        try:
            with open(path, 'r', encoding='utf-8', errors='replace') as f:
                html = f.read()
        except:
            continue
        if '"@type":"Offer"' not in html and '"@type": "Offer"' not in html:
            continue
        scripts = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
        offers_in_file = []
        for s in scripts:
            try:
                d = json.loads(s)
            except:
                continue
            queue = [d]
            while queue:
                n = queue.pop(0)
                if isinstance(n, dict):
                    if n.get('@type') == 'Offer':
                        missing = []
                        if 'hasMerchantReturnPolicy' not in n:
                            missing.append('hasMerchantReturnPolicy')
                        if 'shippingDetails' not in n:
                            missing.append('shippingDetails')
                        offers_in_file.append({'missing': missing})
                    queue.extend(n.values())
                elif isinstance(n, list):
                    queue.extend(n)
        total = len(offers_in_file)
        with_missing = sum(1 for o in offers_in_file if o['missing'])
        if total and with_missing:
            problem_files.append((path, total, with_missing))

print(f"=== Files with Offer missing hasMerchantReturnPolicy / shippingDetails ===")
print(f"{'Path':<65} {'Total':<8} {'Missing':<8}")
print("=" * 85)
total_offers = 0
total_missing = 0
for path, total, miss in sorted(problem_files):
    total_offers += total
    total_missing += miss
    print(f"{path:<65} {total:>5}    {miss:>5}")
print(f"\nTotal Offers: {total_offers} | With missing fields: {total_missing}")
