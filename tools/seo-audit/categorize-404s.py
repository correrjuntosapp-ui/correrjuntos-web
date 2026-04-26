"""Categorize 62 GSC 404 URLs into: with-redirect / real-404 / file-exists."""
import csv, sys, os
sys.stdout.reconfigure(encoding='utf-8')

# Read CSV
urls = []
with open('tools/seo-audit/gsc/urls404.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)
    for row in reader:
        if row:
            urls.append(row[0].replace('https://www.correrjuntos.com', ''))

print(f"Total URLs: {len(urls)}")

# Existing files in repo
existing = set()
for root, _, files in os.walk('.'):
    if any(x in root for x in ['node_modules', 'correr-juntos-app', 'tmp', '.git', '.claude']):
        continue
    for fname in files:
        if not fname.endswith('.html'):
            continue
        path = os.path.join(root, fname).replace('\\', '/')
        if path.startswith('./'):
            path = path[1:]
        if path.endswith('/index.html'):
            existing.add(path[:-11] or '/')
        else:
            existing.add(path[:-5])

# Read vercel.json
with open('vercel.json', 'r', encoding='utf-8') as f:
    vercel = f.read()

categories = {'has_redirect': [], 'real_404': [], 'unknown': []}
for url in urls:
    if '"source": "' + url + '"' in vercel:
        categories['has_redirect'].append(url)
    elif url in existing:
        categories['unknown'].append(url)
    else:
        categories['real_404'].append(url)

print()
print(f"=== Already in vercel.json redirects: {len(categories['has_redirect'])} ===")
for u in categories['has_redirect']:
    print(f"  {u}")

print()
print(f"=== Real 404 (need redirect or accept): {len(categories['real_404'])} ===")
for u in categories['real_404']:
    print(f"  {u}")

print()
print(f"=== Files exist in repo (weird, why does Google see 404?): {len(categories['unknown'])} ===")
for u in categories['unknown']:
    print(f"  {u}")
