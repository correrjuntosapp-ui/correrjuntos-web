# -*- coding: utf-8 -*-
import os, re, json, html, csv
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import posixpath
from collections import Counter, defaultdict, deque

ROOT = r"C:\Users\guett\OneDrive\Escritorio\correrjuntosV2"
BLOG_DIR = os.path.join(ROOT, "blog")
OUT_DIR = os.path.join(ROOT, "tmp")
os.makedirs(OUT_DIR, exist_ok=True)

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.meta = {}
        self.og = {}
        self.twitter = {}
        self.canonical = ""
        self.preconnect = []
        self.alternates = []
        self.h_counts = {"h1":0,"h2":0,"h3":0}
        self.h_texts = {"h1":[],"h2":[],"h3":[]}
        self.links = []
        self.images = []
        self.jsonld = []
        self.rel_next = False
        self.rel_prev = False

        self._in_title = False
        self._title_buf = []
        self._heading_tag = None
        self._heading_buf = []
        self._curr_link = None
        self._in_jsonld = False
        self._jsonld_buf = []

    def handle_starttag(self, tag, attrs):
        d = {k.lower(): (v if v is not None else "") for k,v in attrs}
        tag = tag.lower()

        if tag == "title":
            self._in_title = True
            self._title_buf = []
        elif tag in ("h1","h2","h3"):
            self.h_counts[tag] += 1
            self._heading_tag = tag
            self._heading_buf = []
        elif tag == "meta":
            name = d.get("name", "").strip().lower()
            prop = d.get("property", "").strip().lower()
            content = d.get("content", "").strip()
            if name:
                self.meta[name] = content
                if name.startswith("twitter:"):
                    self.twitter[name] = content
            if prop and prop.startswith("og:"):
                self.og[prop] = content
        elif tag == "link":
            rel = d.get("rel", "").lower().split()
            href = d.get("href", "").strip()
            if "canonical" in rel:
                self.canonical = href
            if "preconnect" in rel and href:
                self.preconnect.append(href)
            if "alternate" in rel and href:
                hreflang = d.get("hreflang", "").strip().lower()
                if hreflang:
                    self.alternates.append((hreflang, href))
            if "next" in rel:
                self.rel_next = True
            if "prev" in rel:
                self.rel_prev = True
        elif tag == "a":
            href = d.get("href", "").strip()
            self._curr_link = {"href": href, "text": ""}
        elif tag == "img":
            self.images.append({
                "src": d.get("src",""),
                "alt": d.get("alt", None),
                "loading": d.get("loading",""),
                "width": d.get("width", ""),
                "height": d.get("height", ""),
            })
        elif tag == "script":
            if d.get("type", "").strip().lower() == "application/ld+json":
                self._in_jsonld = True
                self._jsonld_buf = []

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "title" and self._in_title:
            self.title = "".join(self._title_buf).strip()
            self._in_title = False
        elif tag in ("h1","h2","h3") and self._heading_tag == tag:
            txt = re.sub(r"\s+", " ", "".join(self._heading_buf)).strip()
            if txt:
                self.h_texts[tag].append(txt)
            self._heading_tag = None
        elif tag == "a" and self._curr_link is not None:
            self._curr_link["text"] = re.sub(r"\s+", " ", self._curr_link["text"]).strip()
            self.links.append(self._curr_link)
            self._curr_link = None
        elif tag == "script" and self._in_jsonld:
            txt = "".join(self._jsonld_buf).strip()
            if txt:
                self.jsonld.append(txt)
            self._in_jsonld = False

    def handle_data(self, data):
        if self._in_title:
            self._title_buf.append(data)
        if self._heading_tag is not None:
            self._heading_buf.append(data)
        if self._curr_link is not None:
            self._curr_link["text"] += data
        if self._in_jsonld:
            self._jsonld_buf.append(data)


def clean_path(path):
    if not path:
        return "/"
    path = re.sub(r"/{2,}", "/", path)
    if not path.startswith("/"):
        path = "/" + path
    return path


def rel_to_url_path(rel):
    rel = rel.replace("\\", "/")
    if rel == "index.html":
        return "/blog/"
    if rel.endswith("/index.html"):
        sub = rel[:-10].rstrip("/")
        return clean_path("/blog/" + sub + "/")
    if rel.endswith(".html"):
        return clean_path("/blog/" + rel[:-5])
    return clean_path("/blog/" + rel)


def make_aliases(path):
    path = clean_path(path)
    aliases = set([path])
    if path.endswith("/"):
        if path != "/":
            aliases.add(path.rstrip("/"))
        aliases.add(path + "index.html")
    else:
        aliases.add(path + "/")
        aliases.add(path + ".html")
    if path.endswith(".html"):
        nohtml = path[:-5]
        aliases.add(nohtml)
        aliases.add(nohtml + "/")
    return {clean_path(a) if a.startswith('/') else a for a in aliases if a}


def strip_qf(u):
    if not u:
        return ""
    return u.split("#",1)[0].split("?",1)[0]


def normalize_internal_href(href, current_path):
    href = href.strip()
    if not href:
        return None, None
    low = href.lower()
    if low.startswith(("mailto:","tel:","javascript:","data:")):
        return None, None
    if href.startswith("#"):
        return None, None

    parsed = urlparse(href)
    if parsed.scheme in ("http","https"):
        host = parsed.netloc.lower()
        path = clean_path(unquote(parsed.path or "/"))
        if host.endswith("correrjuntos.com"):
            return "site", path
        return "external", href

    if href.startswith("//"):
        p2 = urlparse("https:" + href)
        host = p2.netloc.lower()
        path = clean_path(unquote(p2.path or "/"))
        if host.endswith("correrjuntos.com"):
            return "site", path
        return "external", href

    raw = strip_qf(href)
    if raw.startswith("/"):
        path = clean_path(raw)
    else:
        base = current_path if current_path.endswith("/") else current_path.rsplit("/",1)[0] + "/"
        path = posixpath.normpath(posixpath.join(base, raw))
        if raw.endswith("/") and not path.endswith("/"):
            path += "/"
        path = clean_path(path)
    return "site", path


def normalize_visible_text(raw_html):
    t = re.sub(r"(?is)<script\b[^>]*>.*?</script>", " ", raw_html)
    t = re.sub(r"(?is)<style\b[^>]*>.*?</style>", " ", t)
    t = re.sub(r"(?is)<[^>]+>", " ", t)
    t = html.unescape(t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def extract_schema_types(jsonld_list):
    types = set()
    for txt in jsonld_list:
        try:
            obj = json.loads(txt)
        except Exception:
            obj = None
        if obj is not None:
            stack = [obj]
            while stack:
                it = stack.pop()
                if isinstance(it, dict):
                    t = it.get("@type")
                    if isinstance(t, str):
                        types.add(t)
                    elif isinstance(t, list):
                        for x in t:
                            if isinstance(x, str):
                                types.add(x)
                    for v in it.values():
                        if isinstance(v, (dict, list)):
                            stack.append(v)
                elif isinstance(it, list):
                    stack.extend(it)
        else:
            for m in re.findall(r'"@type"\s*:\s*"([^"]+)"', txt):
                types.add(m)
    return sorted(types)

# Load pages
pages = []
for root, _, files in os.walk(BLOG_DIR):
    for fn in files:
        if not fn.lower().endswith(".html"):
            continue
        full = os.path.join(root, fn)
        rel = os.path.relpath(full, BLOG_DIR)
        with open(full, "r", encoding="utf-8", errors="ignore") as f:
            raw = f.read()
        p = PageParser(); p.feed(raw)
        url_path = rel_to_url_path(rel)
        visible = normalize_visible_text(raw)
        words = re.findall(r"\b[\wÀ-ÿ]+\b", visible, flags=re.UNICODE)
        schema_types = extract_schema_types(p.jsonld)
        pages.append({
            "file": full,
            "rel": rel.replace("\\","/"),
            "path": url_path,
            "title": p.title,
            "title_len": len(p.title),
            "meta_desc": p.meta.get("description", ""),
            "meta_len": len(p.meta.get("description", "")),
            "robots": p.meta.get("robots", ""),
            "canonical": p.canonical,
            "og": p.og,
            "twitter": p.twitter,
            "h1_count": p.h_counts["h1"],
            "h2_count": p.h_counts["h2"],
            "h3_count": p.h_counts["h3"],
            "h1_text": " | ".join(p.h_texts["h1"]),
            "preconnect": p.preconnect,
            "alternates": p.alternates,
            "links": p.links,
            "images": p.images,
            "schema_types": schema_types,
            "word_count": len(words),
            "raw": raw,
            "rel_next": p.rel_next,
            "rel_prev": p.rel_prev,
        })

# Path map
canonical_path_by_alias = {}
page_by_path = {}
for pg in pages:
    page_by_path[pg["path"]] = pg
for pg in pages:
    for a in make_aliases(pg["path"]):
        canonical_path_by_alias[a] = pg["path"]

# Analyze links and graph
generic_anchors = {
    "aqui","aquí","haz clic aquí","haz click aqui","haz click aquí","click here","here",
    "leer más","lee más","ver más","más","mas","más info","info","saber más","descubre más",
    "este artículo","este articulo","este post","artículo","articulo","post","link"
}
app_link_markers = ["apps.apple.com", "play.google.com", "/app", "correr-juntos-app", "/quedadas", "/cities", "/ciudades"]
cta_keywords = ["descarga", "descargar", "únete", "unete", "encuentra", "probar", "empieza", "comienza", "app"]

edges = defaultdict(set)
indegree = Counter()

for pg in pages:
    current = pg["path"]
    blog_out = 0
    app_out = 0
    external_out = 0
    broken_blog = []
    weak_anchor = 0
    total_anchor = 0

    for lk in pg["links"]:
        href = lk.get("href","")
        txt = (lk.get("text","") or "").strip().lower()
        kind, norm = normalize_internal_href(href, current)

        if txt:
            total_anchor += 1
            tnorm = re.sub(r"\s+"," ",txt)
            if tnorm in generic_anchors or len(tnorm) <= 3:
                weak_anchor += 1

        if kind == "external":
            external_out += 1
            if any(m in href.lower() for m in app_link_markers):
                app_out += 1
        elif kind == "site" and norm:
            if norm.startswith("/blog"):
                c = canonical_path_by_alias.get(norm)
                if not c:
                    alt = norm.rstrip("/") if norm != "/" else norm
                    c = canonical_path_by_alias.get(alt) or canonical_path_by_alias.get(alt + "/")
                if c:
                    blog_out += 1
                    if c != current:
                        edges[current].add(c)
                        indegree[c] += 1
                else:
                    if not re.search(r"/tag/|/search|\?|#", norm):
                        broken_blog.append(norm)
            else:
                if any(m in norm.lower() for m in app_link_markers):
                    app_out += 1

    pg["blog_out_links"] = blog_out
    pg["app_links"] = app_out
    pg["external_links"] = external_out
    pg["broken_blog_links"] = broken_blog
    pg["weak_anchor_count"] = weak_anchor
    pg["anchor_count"] = total_anchor

for pg in pages:
    indegree.setdefault(pg["path"], 0)

# BFS depth
seed_paths = ["/blog/", "/blog/en/"]
click_depth = {p: None for p in indegree}
q = deque()
for s in seed_paths:
    if s in click_depth:
        click_depth[s] = 0
        q.append(s)
while q:
    cur = q.popleft()
    for nxt in edges.get(cur, []):
        if click_depth[nxt] is None:
            click_depth[nxt] = click_depth[cur] + 1
            q.append(nxt)

# Sitemap paths
sitemap_paths = set()
sitemap_file = os.path.join(ROOT, "sitemap-blog.xml")
if os.path.exists(sitemap_file):
    with open(sitemap_file, "r", encoding="utf-8", errors="ignore") as f:
        sm = f.read()
    for loc in re.findall(r"<loc>(.*?)</loc>", sm, flags=re.I):
        p = clean_path(urlparse(loc.strip()).path or "/")
        c = canonical_path_by_alias.get(p) or canonical_path_by_alias.get(p.rstrip("/")) or canonical_path_by_alias.get(p.rstrip("/")+"/")
        sitemap_paths.add(c or p)

# Robots
robots_txt = ""
robots_file = os.path.join(ROOT, "robots.txt")
if os.path.exists(robots_file):
    with open(robots_file, "r", encoding="utf-8", errors="ignore") as f:
        robots_txt = f.read()

for pg in pages:
    path = pg["path"]
    can = pg["canonical"].strip()
    can_ok = False
    can_abs = can.lower().startswith(("http://","https://"))
    can_path = ""
    if can_abs:
        can_path = clean_path(urlparse(can).path or "/")
    elif can.startswith("/"):
        can_path = clean_path(can)
    if can_path:
        c = canonical_path_by_alias.get(can_path) or canonical_path_by_alias.get(can_path.rstrip("/")) or canonical_path_by_alias.get(can_path.rstrip("/")+"/")
        if c == path:
            can_ok = True
    pg["canonical_ok"] = can_ok
    pg["canonical_abs"] = can_abs

    og_img = pg["og"].get("og:image", "")
    pg["has_og_image"] = bool(og_img)
    pg["og_image_abs"] = og_img.startswith(("http://","https://"))

    pg["has_title"] = bool(pg["title"].strip())
    pg["has_meta_desc"] = bool(pg["meta_desc"].strip())
    pg["is_noindex"] = "noindex" in pg["robots"].lower()
    pg["has_schema"] = len(pg["schema_types"]) > 0
    pg["has_blogposting"] = "BlogPosting" in pg["schema_types"]
    pg["has_breadcrumb_schema"] = "BreadcrumbList" in pg["schema_types"]

    imgs = pg["images"]
    pg["img_count"] = len(imgs)
    pg["img_missing_alt"] = sum(1 for i in imgs if i.get("alt") in (None, ""))
    pg["img_missing_wh"] = sum(1 for i in imgs if not (i.get("width") and i.get("height")))
    pg["img_lazy"] = sum(1 for i in imgs if (i.get("loading") or "").lower() == "lazy")
    pg["img_non_lazy"] = sum(1 for i in imgs if (i.get("loading") or "").lower() != "lazy")
    amz = [i for i in imgs if "amazon" in (i.get("src") or "").lower() or "m.media-amazon.com" in (i.get("src") or "").lower()]
    pg["amazon_img_count"] = len(amz)
    pg["amazon_missing_wh"] = sum(1 for i in amz if not (i.get("width") and i.get("height")))

    hosts = []
    for h in pg["preconnect"]:
        if h.startswith("http") or h.startswith("//"):
            hosts.append(urlparse(h if h.startswith("http") else "https:"+h).netloc.lower())
        else:
            hosts.append(h.lower())
    pg["preconnect_hosts"] = hosts

    pg["in_sitemap"] = path in sitemap_paths
    pg["click_depth"] = click_depth.get(path)
    pg["indegree"] = indegree.get(path, 0)

    raw = pg["raw"].lower()
    pg["has_breadcrumb_html"] = ("aria-label=\"breadcrumb\"" in raw or "aria-label='breadcrumb'" in raw or "class=\"breadcrumb" in raw or " class='breadcrumb" in raw)
    pg["has_cta_class"] = bool(re.search(r"class=\"[^\"]*cta[^\"]*\"|class='[^']*cta[^']*'", raw))
    cta_anchors = 0
    for lk in pg["links"]:
        txt = (lk.get("text","") or "").lower()
        href = (lk.get("href","") or "").lower()
        if any(k in txt for k in cta_keywords) and any(m in href for m in app_link_markers + ["correrjuntos"]):
            cta_anchors += 1
    pg["cta_anchor_count"] = cta_anchors

n = len(pages)
articles = [p for p in pages if p["has_blogposting"]]
es_articles = [p for p in articles if not p["path"].startswith("/blog/en/")]
en_articles = [p for p in articles if p["path"].startswith("/blog/en/")]

by_title = defaultdict(list)
by_meta = defaultdict(list)
for p in pages:
    if p["title"].strip(): by_title[p["title"].strip().lower()].append(p["path"])
    if p["meta_desc"].strip(): by_meta[p["meta_desc"].strip().lower()].append(p["path"])
dup_titles = {k:v for k,v in by_title.items() if len(v)>1}
dup_meta = {k:v for k,v in by_meta.items() if len(v)>1}

stop = set("de del la el los las para por en con y o vs que como guia mejores mejor 2026 correr running app apps grupo grupos".split())
slug_tokens = {}
for p in es_articles:
    slug = p["path"].split("/blog/")[-1].strip("/")
    toks = [x for x in re.split(r"[-_/]+", slug) if x and x not in stop]
    slug_tokens[p["path"]] = set(toks)

canni = []
paths = list(slug_tokens)
for i in range(len(paths)):
    for j in range(i+1, len(paths)):
        a,b = paths[i], paths[j]
        ta,tb = slug_tokens[a], slug_tokens[b]
        inter = ta & tb
        if len(inter) < 2: continue
        jac = len(inter) / max(1, len(ta|tb))
        if jac >= 0.38:
            canni.append((jac,a,b,sorted(inter)))
canni.sort(reverse=True, key=lambda x:x[0])

weak_es = sorted(es_articles, key=lambda p: (p["indegree"], p["blog_out_links"], -p["word_count"]))
strong_es = sorted(es_articles, key=lambda p: (-p["indegree"], -p["blog_out_links"]))

summary = {
    "total_pages": n,
    "total_articles": len(articles),
    "es_articles": len(es_articles),
    "en_articles": len(en_articles),
    "with_title": sum(1 for p in pages if p["has_title"]),
    "with_meta_desc": sum(1 for p in pages if p["has_meta_desc"]),
    "with_canonical": sum(1 for p in pages if p["canonical"]),
    "canonical_ok": sum(1 for p in pages if p["canonical_ok"]),
    "canonical_abs": sum(1 for p in pages if p["canonical_abs"]),
    "with_og_image": sum(1 for p in pages if p["has_og_image"]),
    "og_image_abs": sum(1 for p in pages if p["og_image_abs"]),
    "h1_exactly_1": sum(1 for p in pages if p["h1_count"] == 1),
    "h1_missing": sum(1 for p in pages if p["h1_count"] == 0),
    "h1_multiple": sum(1 for p in pages if p["h1_count"] > 1),
    "noindex_pages": sum(1 for p in pages if p["is_noindex"]),
    "with_schema": sum(1 for p in pages if p["has_schema"]),
    "with_blogposting": sum(1 for p in pages if p["has_blogposting"]),
    "with_breadcrumb_schema": sum(1 for p in pages if p["has_breadcrumb_schema"]),
    "with_preconnect": sum(1 for p in pages if len(p["preconnect"])>0),
    "pages_with_broken_blog_links": sum(1 for p in pages if len(p["broken_blog_links"])>0),
    "total_broken_blog_links": sum(len(p["broken_blog_links"]) for p in pages),
    "total_images": sum(p["img_count"] for p in pages),
    "images_missing_wh": sum(p["img_missing_wh"] for p in pages),
    "images_missing_alt": sum(p["img_missing_alt"] for p in pages),
    "amazon_images": sum(p["amazon_img_count"] for p in pages),
    "amazon_missing_wh": sum(p["amazon_missing_wh"] for p in pages),
    "lazy_images": sum(p["img_lazy"] for p in pages),
    "non_lazy_images": sum(p["img_non_lazy"] for p in pages),
    "thin_articles_lt800": sum(1 for p in articles if p["word_count"] < 800),
    "thin_articles_lt1200": sum(1 for p in articles if p["word_count"] < 1200),
    "articles_no_cta_anchor": sum(1 for p in articles if p["cta_anchor_count"] == 0),
    "articles_with_app_links": sum(1 for p in articles if p["app_links"] > 0),
    "orphan_articles_in_blog_graph": sum(1 for p in articles if p["indegree"] == 0),
    "deep_articles_depth_ge3": sum(1 for p in articles if (p["click_depth"] is not None and p["click_depth"] >= 3)),
    "unreachable_articles_from_blog_index": sum(1 for p in articles if p["click_depth"] is None),
    "not_in_sitemap": sum(1 for p in pages if not p["in_sitemap"]),
    "dup_title_groups": len(dup_titles),
    "dup_meta_groups": len(dup_meta),
    "robots_txt_excerpt": robots_txt[:1200],
}

metrics_path = os.path.join(OUT_DIR, "blog_post_audit_metrics.json")
with open(metrics_path, "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

csv_path = os.path.join(OUT_DIR, "blog_post_audit_pages.csv")
fields = [
    "path","title_len","meta_len","h1_count","h2_count","h3_count","word_count","canonical","canonical_ok","canonical_abs",
    "robots","is_noindex","has_og_image","og_image_abs","img_count","img_missing_wh","img_missing_alt","amazon_img_count","amazon_missing_wh",
    "img_lazy","img_non_lazy","blog_out_links","app_links","external_links","indegree","click_depth","in_sitemap","broken_blog_links",
    "weak_anchor_count","anchor_count","cta_anchor_count","has_blogposting","has_breadcrumb_schema","has_preconnect"
]
with open(csv_path, "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for p in pages:
        w.writerow({
            "path": p["path"],
            "title_len": p["title_len"],
            "meta_len": p["meta_len"],
            "h1_count": p["h1_count"],
            "h2_count": p["h2_count"],
            "h3_count": p["h3_count"],
            "word_count": p["word_count"],
            "canonical": p["canonical"],
            "canonical_ok": int(p["canonical_ok"]),
            "canonical_abs": int(p["canonical_abs"]),
            "robots": p["robots"],
            "is_noindex": int(p["is_noindex"]),
            "has_og_image": int(p["has_og_image"]),
            "og_image_abs": int(p["og_image_abs"]),
            "img_count": p["img_count"],
            "img_missing_wh": p["img_missing_wh"],
            "img_missing_alt": p["img_missing_alt"],
            "amazon_img_count": p["amazon_img_count"],
            "amazon_missing_wh": p["amazon_missing_wh"],
            "img_lazy": p["img_lazy"],
            "img_non_lazy": p["img_non_lazy"],
            "blog_out_links": p["blog_out_links"],
            "app_links": p["app_links"],
            "external_links": p["external_links"],
            "indegree": p["indegree"],
            "click_depth": "" if p["click_depth"] is None else p["click_depth"],
            "in_sitemap": int(p["in_sitemap"]),
            "broken_blog_links": " | ".join(sorted(set(p["broken_blog_links"]))[:15]),
            "weak_anchor_count": p["weak_anchor_count"],
            "anchor_count": p["anchor_count"],
            "cta_anchor_count": p["cta_anchor_count"],
            "has_blogposting": int(p["has_blogposting"]),
            "has_breadcrumb_schema": int(p["has_breadcrumb_schema"]),
            "has_preconnect": int(len(p["preconnect"])>0),
        })

report = {
    "top_broken_link_pages": [
        {"path": p["path"], "broken_count": len(p["broken_blog_links"]), "examples": sorted(set(p["broken_blog_links"]))[:5]}
        for p in sorted(pages, key=lambda x: len(x["broken_blog_links"]), reverse=True) if p["broken_blog_links"]
    ][:25],
    "orphan_articles": [p["path"] for p in sorted(articles, key=lambda x: x["path"]) if p["indegree"]==0][:200],
    "weakest_linked_es_articles": [
        {"path": p["path"], "indegree": p["indegree"], "out": p["blog_out_links"], "words": p["word_count"], "cta": p["cta_anchor_count"]}
        for p in weak_es[:80]
    ],
    "most_linked_es_articles": [
        {"path": p["path"], "indegree": p["indegree"], "out": p["blog_out_links"], "words": p["word_count"]}
        for p in strong_es[:60]
    ],
    "duplicate_titles": [{"title":k, "paths":v[:12], "count":len(v)} for k,v in sorted(dup_titles.items(), key=lambda kv: len(kv[1]), reverse=True)[:30]],
    "duplicate_meta_descriptions": [{"meta":k, "paths":v[:12], "count":len(v)} for k,v in sorted(dup_meta.items(), key=lambda kv: len(kv[1]), reverse=True)[:30]],
    "potential_cannibalization": [{"a":a,"b":b,"score":round(s,3),"shared_tokens":toks} for s,a,b,toks in canni[:100]],
    "deep_articles": [{"path": p["path"], "depth": p["click_depth"], "indegree": p["indegree"]} for p in sorted(articles, key=lambda x:(999 if x["click_depth"] is None else -x["click_depth"], x["indegree"])) if p["click_depth"] is None or p["click_depth"]>=3][:160],
    "pages_missing_preconnect": [p["path"] for p in pages if len(p["preconnect"])==0][:200],
    "pages_canonical_issue": [{"path":p["path"],"canonical":p["canonical"],"ok":p["canonical_ok"],"abs":p["canonical_abs"]} for p in pages if not p["canonical_ok"]][:160],
    "pages_h1_issue": [{"path":p["path"],"h1_count":p["h1_count"],"h1":p["h1_text"][:140]} for p in pages if p["h1_count"]!=1][:160],
    "articles_without_app_links": [p["path"] for p in articles if p["app_links"]==0][:200],
    "articles_without_cta_anchor": [p["path"] for p in articles if p["cta_anchor_count"]==0][:200],
    "pages_with_weak_anchor_ratio_high": [
        {"path":p["path"],"weak":p["weak_anchor_count"],"all":p["anchor_count"],"ratio": round((p["weak_anchor_count"]/p["anchor_count"]) if p["anchor_count"] else 0,3)}
        for p in sorted(pages, key=lambda x: ((x["weak_anchor_count"]/x["anchor_count"]) if x["anchor_count"] else 0), reverse=True)
        if p["anchor_count"]>=10 and p["weak_anchor_count"]>=3
    ][:120],
    "schema_type_counts": dict(Counter(t for p in pages for t in p["schema_types"])),
    "preconnect_host_counts": dict(Counter(h for p in pages for h in p["preconnect_hosts"])),
}
report_path = os.path.join(OUT_DIR, "blog_post_audit_report.json")
with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("WROTE", metrics_path)
print("WROTE", csv_path)
print("WROTE", report_path)
print("PAGES", n, "ARTICLES", len(articles), "ES", len(es_articles), "EN", len(en_articles))

