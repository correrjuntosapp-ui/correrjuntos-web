#!/usr/bin/env python3
"""Update CTA boxes in Spanish blog articles to be contextual."""
import os
import re

BLOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog')

def classify(filename):
    slug = filename.lower().replace('.html', '')

    # More specific categories first
    if any(w in slug for w in ['principiante', 'empezar-a-correr', 'de-cero', 'pack-basico-running', 'ritmo-para-principiantes', 'errores-principiante']):
        return 'principiante'
    if any(w in slug for w in ['zapatilla', 'hoka', 'asics-gel', 'nike-pegasus', 'brooks-ghost', 'new-balance-1080', 'salomon-speedcross', 'on-running', 'pronador', 'supinador', 'pisada-neutra', 'placa-carbono', 'drop-zapatillas', 'cuanto-duran-zapatillas', 'diferencia-zapatillas', 'zapatillas-deka', 'zapatillas-hyrox', 'mejores-zapatillas', 'calcetines-running', 'mallas-running', 'ropa-tecnica', 'ropa-correr', 'gafas-running', 'gorras-running', 'chubasqueros', 'cinturones-running']):
        return 'zapatillas'
    if any(w in slug for w in ['trail', 'montana', 'montaña', 'bastones-trail', 'mochilas-trail', 'material-trail', 'seguridad-trail']):
        return 'trail'
    if any(w in slug for w in ['reloj', 'gps', 'garmin', 'coros', 'polar', 'apple-watch', 'smartwatch', 'auricular', 'shokz', 'jbl', 'conduccion-osea', 'lampara', 'frontal', 'strava', 'mejores-apps', 'navegacion-gps']):
        return 'tech'
    if any(w in slug for w in ['nutricion', 'comer', 'dieta', 'alimento', 'desayuno', 'receta', 'hidratacion', 'gel-energetico', 'cafeina', 'proteina', 'creatina', 'ayuno-intermitente', 'hierro', 'magnesio', 'omega', 'bcaa', 'colageno', 'multivitaminico', 'recuperador', 'suplemento', 'snack', 'caloria', 'gluten', 'vegetariana', 'antiinflamatorio', 'carga-hidrato', 'bebida', 'bidones', 'soft-flask', 'chaleco', 'mejores-bebidas']):
        return 'nutricion'
    if any(w in slug for w in ['5k', '10k', 'maraton', 'media-maraton', 'san-silvestre', 'tapering', 'dia-de-carrera', 'primera-carrera', 'cuanto-tardo']):
        return 'carrera'
    if any(w in slug for w in ['plan', 'entrenamiento', 'series', 'fartlek', 'periodizacion', 'zonas', 'vo2', 'cross-training', 'fuerza', 'core', 'gimnasio', 'yoga', 'ejercicio', 'resistencia', 'potencia', 'variabilidad', 'hyrox', 'deka', 'skierg', 'kettlebell', 'sandbag', 'wall-ball', 'banda-elastica', 'entrenamiento-cruzado', 'correr-mas-rapido', 'cuantas-veces-semana', 'calentar-antes', 'correr-en-cinta', 'zona-2', 'correr-y-gimnasio', 'calleras', 'foam-roller', 'como-aumentar-resistencia']):
        return 'entrenamiento'
    if any(w in slug for w in ['salud', 'lesion', 'dolor', 'rodilla', 'fascitis', 'tendinitis', 'periostitis', 'agujeta', 'calambr', 'flato', 'estiramiento', 'rodillo-vs-pistola', 'menopausia', 'embaraz', 'sobrepeso', 'adelgazar', 'digestiv', 'respirar', 'prevenir-lesion', 'volver-a-correr', 'puedo-correr-todos', 'correr-en-ayunas', 'despues-de-los-40', 'despues-de-los-50', 'despues-de-los-60', 'salud-mental', 'beneficios-de-correr', 'mejor-hora', 'correr-en-invierno', 'correr-en-verano', 'correr-por-la-noche', 'andar-vs-correr']):
        return 'salud'
    if any(w in slug for w in ['grupo', 'quedada', 'acompanado', 'companero', 'social', 'soledad', 'no-tengo-con-quien', 'encontrar', 'conocer-gente', 'unirse', 'seguridad-correr-con', 'correr-solo-vs', 'correrjuntos-vs', 'apps-correr-en-grupo', 'running-social', 'primera-quedada', 'como-organizar-quedada', 'correr-acompanado', 'beneficios-correr-en-grupo', 'grupos-running', 'grupos-correr', 'grupos-de-running', 'mejores-rutas', 'encontrar-runners']):
        return 'grupo'
    if any(w in slug for w in ['motivacion', 'habito', 'recuperar-ganas', 'por-que-dejan', 'verguenza', 'musica', 'ansiedad', 'psicologia', 'correr-con-perro', 'errores-comunes']):
        return 'motivacion'
    return 'default'

CTA_H2 = {
    'zapatillas': '&iquest;Buscas las zapatillas perfectas para ti?',
    'entrenamiento': '&iquest;Listo para empezar tu plan?',
    'carrera': '&iquest;Preparando tu pr&oacute;xima carrera?',
    'nutricion': '&iquest;Quieres optimizar tu alimentaci&oacute;n runner?',
    'salud': 'Cuida tu cuerpo mientras corres',
    'grupo': '&iquest;Buscas compa&ntilde;eros de running?',
    'trail': 'Lleva tu trail al siguiente nivel',
    'tech': 'Registra cada kil&oacute;metro',
    'principiante': 'Tu primer paso empieza aqu&iacute;',
    'motivacion': 'No corras solo',
    'default': '&Uacute;nete a miles de runners'
}

CTA_P = {
    'zapatillas': '&iquest;Ya sabes cu&aacute;les elegir? Registra tus km con CorrerJuntos y compara el rendimiento de tus zapatillas.',
    'entrenamiento': 'Descarga CorrerJuntos y activa tu plan de entrenamiento personalizado &mdash; es gratis.',
    'carrera': '&iquest;Preparando tu carrera? Descarga CorrerJuntos y sigue tu plan semana a semana.',
    'nutricion': 'Registra tus entrenamientos y ajusta tu nutrici&oacute;n con CorrerJuntos &mdash; gratis en iOS y Android.',
    'salud': 'Cuida tu cuerpo y registra tu progreso con CorrerJuntos &mdash; la app gratuita de running.',
    'grupo': 'Encuentra compa&ntilde;eros de running cerca de ti con CorrerJuntos &mdash; crea quedadas y sal a correr acompa&ntilde;ado.',
    'trail': '&iquest;Listo para el trail? Descarga CorrerJuntos y registra tus rutas con GPS y desnivel.',
    'tech': 'Registra tus m&eacute;tricas de running con CorrerJuntos &mdash; compatible con tu reloj GPS.',
    'principiante': '&iquest;Empezando a correr? Descarga CorrerJuntos gratis &mdash; incluye plan de 0 a 5K.',
    'motivacion': 'Correr acompa&ntilde;ado es m&aacute;s f&aacute;cil. &Uacute;nete a CorrerJuntos y encuentra tu grupo de running.',
    'default': '&Uacute;nete a miles de runners en CorrerJuntos &mdash; quedadas, GPS y planes de entrenamiento gratis.'
}

def main():
    files = sorted([f for f in os.listdir(BLOG_DIR)
                    if f.endswith('.html') and f != 'index.html'
                    and os.path.isfile(os.path.join(BLOG_DIR, f))])

    # Pattern to match the first CTA box with h2 and p
    # Handles various whitespace patterns
    pattern = re.compile(
        r'(<div\s+class="cta-box">\s*)\n(\s*)<h2>[^<]*</h2>\s*\n\s*<p>[^<]*</p>',
        re.DOTALL
    )

    updated = 0
    skipped = 0
    categories = {}

    for f in files:
        filepath = os.path.join(BLOG_DIR, f)
        with open(filepath, 'r', encoding='utf-8') as fh:
            content = fh.read()

        match = pattern.search(content)
        if not match:
            skipped += 1
            continue

        cat = classify(f)
        categories[cat] = categories.get(cat, 0) + 1

        indent = match.group(2)  # preserve indentation
        new_h2 = CTA_H2[cat]
        new_p = CTA_P[cat]

        # Replace only the first occurrence
        new_content = pattern.sub(
            lambda m: f'{m.group(1)}\n{indent}<h2>{new_h2}</h2>\n{indent}<p>{new_p}</p>',
            content,
            count=1
        )

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as fh:
                fh.write(new_content)
            updated += 1

    print(f"Updated: {updated}")
    print(f"Skipped (no matching CTA box): {skipped}")
    print(f"\nCategories breakdown:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

if __name__ == '__main__':
    main()
