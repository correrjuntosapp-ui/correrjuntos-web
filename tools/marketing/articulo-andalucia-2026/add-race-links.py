# -*- coding: utf-8 -*-
"""
Añade enlaces a cada carrera del artículo Andalucía 2026.
- En tablas: envuelve el <td>NOMBRE</td> en <a> a búsqueda Google
- En listas <ul>: envuelve el <strong>NOMBRE</strong> en <a> a búsqueda Google
- En H3 de top 7: añade enlace a web oficial conocida o búsqueda Google
"""
import re
import urllib.parse
from pathlib import Path

ARTICLE = Path(r"C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\blog\mejores-carreras-running-andalucia-2026.html")

# Carreras del calendario (extraídas del JSON, en formato HTML como aparecen)
RACES_TABLE = [
    "XIII Media Marat&oacute;n V&eacute;lez-M&aacute;laga",
    "Desaf&iacute;o Sierra de C&aacute;diz",
    "IX Sherry Marat&oacute;n",
    "X Desaf&iacute;o Playa de los Muertos",
    "XXVI 101 Km La Legi&oacute;n",
    "Carrera Parque Mar&iacute;a Luisa",
    "Sierra de Segura Infinita Trails",
    "XIX Media Marat&oacute;n Ciudad de las Hortalizas",
    "Carrera de la Mujer Onupolis",
    "XIV Media Marat&oacute;n Cartaya",
    "Tio Pepe Running",
    "Media Marat&oacute;n El Puerto",
    "Ultra Trail Bosques del Sur",
    "III CxM Trail Puntademo",
    "XXIV Cross del Agua",
    "10K Huelva Puerta del Descubrimiento",
    "Media Marat&oacute;n Bosques del Sur",
    "XXIX Triatl&oacute;n de Sevilla",
    "Carrera Nocturna del Alamillo",
    "Reto 4.1 Mazag&oacute;n",
    "Nocturna Onupolis",
    "X Carrera de la Cereza",
    "II Carrera Lago Victoria Almerimar",
    "VII Carrera Nocturna Beg&iacute;jar",
    "Golf Runner Onupolis",
    "X Carrera Nocturna contra el C&aacute;ncer",
    "Rompiendo Barreras 10K",
    "VIII Marat&oacute;n en Pista Ciudad de Ja&eacute;n",
    "La Nocturna CxM Benamaurel",
    "XIII Carrera Nocturna Ciudad de Balerma",
    "IV Trail Nocturno Castil de Campos",
    "Summer Night Aljaraque",
    "Huelva Verde Onupolis",
    "XV CxM Valle de los Gu&aacute;jares",
    "Cross de Montalb&aacute;n",
    "CxM Macael M&aacute;rmol",
    "VII Carrera Popular Villa de Escacena",
    "Vuelta a Huelva Onupolis",
    "Cross de Santaella",
    "21K Ciudad de Huelva",
    "Cross de La Victoria",
    "Cross de Puente Genil",
    "San Silvestre Onupolis",
]

# Carreras adicionales que aparecen en listas <ul> de provincia
RACES_LIST = [
    # Huelva otras
    "10K Huelva Puerta del Descubrimiento",
    "21K Ciudad de Huelva",
    "XIV Media Marat&oacute;n Ruta de los Hoteles de Cartaya",
    "III CxM Trail Puntademo",
    "XXIV Cross del Agua de Galaroza",
    "Reto 4.1 Mazag&oacute;n",
    "Summer Night Aljaraque",
    "VII Carrera Popular Villa de Escacena",
    # Sevilla
    "Carrera Parque de Mar&iacute;a Luisa - Powerade",
    "XIII Half Triatl&oacute;n de Sevilla",
    "XXIX Triatl&oacute;n de Sevilla",
    "Carrera Nocturna del Alamillo",
    "V Carrera Carolina Robles - Salud Mental",
    "XXXVII Carrera Popular de Marchena",
    "XXVI Carrera Popular del Deporte y la Amistad",
    "XII Carrera Nocturna Parae&ntilde;a",
    "II Carrera Nocturna TBF Jorge Bonsor",
    "V Carrera Nocturna Ciudad Monumental de Osuna",
    "Carrera de las Capacidades",
    "XXI Carrera Nocturna la Mistela",
    "XX Carrera Nocturna Ribera del Genil",
    "XI Carrera Nocturna Villa de Pilas",
    # Málaga
    "XIII Media Marat&oacute;n V&eacute;lez-M&aacute;laga",
    "XVI Carrera Multicultural Cruz del Humilladero",
    "XIII Carrera Urbana de Estepona",
    "43&ordm; Trofeo San Isidro de Nerja",
    "Carrera de las Capacidades M&aacute;laga",
    "V Carrera 5K Donaci&oacute;n Trasplante Vida",
    "XXVI 101 Km &ndash; 24 horas La Legi&oacute;n",
    "V CxM Trabuco Trail",
    "CxM Alpandeire",
    "X Carrera Popular Villa de Gauc&iacute;n",
    "I Carrera Internacional Nocturna La Cala del Moral",
    "X Carrera Monumental Nocturna Ciudad de Antequera",
    # Cádiz
    "IX Sherry Marat&oacute;n",
    "Tio Pepe Running",
    "Media Marat&oacute;n El Puerto",
    "Desaf&iacute;o Sierra de C&aacute;diz",
    "II CxM Algeciras Capit&aacute;n Trail",
    "Carrera de Colores Conil",
    "VII Running Garbanzos de Naveros",
    "IX Carrera Popular Puente Mayorga",
    "IV Triatl&oacute;n Trimanzanilla",
    "V Trail Villa de Trebujena",
    "III Tagarnina Trail",
    "XI Trail Nocturno Virgen de las Piedras",
    "XV Carrera Popular Corpus-Tesorillo",
    "IV CxM Cerro Verdugo",
    "X Fan-Pin Miguel de Cervantes",
    # Granada
    "XII Carrera Popular del Hornazo",
    "XVI Gran Premio de Fondo Villa de Salobre&ntilde;a",
    "III CxM Molv&iacute;zar",
    "XI Carrera Vertical Sierra de D&uacute;rcal",
    "XXXVIII Prueba de Fondo Ciudad de &Oacute;rgiva",
    "VII Carrera Polic&iacute;a Nacional Ruta 091 Granada",
    "III Trail Villa de P&oacute;rtugos",
    "IV Memorial Jose Miguel Meg&iacute;as Leyva",
    "XXI Vuelta al Mencal",
    "XI Lanjar&oacute;n Ca&ntilde;&oacute;n Trail",
    "Dual Run Moraleda de Zafayona",
    "III Trail El Bastit&aacute;n",
    "X CxM 51x13 Villa de la Peza",
    "La Nocturna CxM Benamaurel",
    "XV CxM Valle de los Gu&aacute;jares",
    # Córdoba
    "44&ordf; Carrera Popular Mar&iacute;a Auxiliadora Memorial Kiko Pastor",
    "II Trail Castillo de Maim&oacute;n",
    "IV Trail Nocturno Castil de Campos",
    "Cross de Montalb&aacute;n",
    "Cross de Santaella",
    "Cross de La Victoria",
    "Cross de Puente Genil",
    # Jaén
    "Ultra Trail Bosques del Sur",
    "Media Marat&oacute;n Bosques del Sur",
    "Sierra de Segura Infinita Trails",
    "V CxM Rompealbarcas",
    "XXIV Carrera Urbana Villa de Ibros",
    "III Carrera la Pava Running",
    "XV Carrera Urbana Ciudad de La Carolina",
    "XXVII Carrera Popular San Isidro",
    "Dual Run Frailes",
    "42 Carrera Popular El Viejo",
    "20&ordf; Carrera Popular de la Luna Llena",
    "X Carrera de la Cereza",
    "Rompiendo Barreras 10K",
    "VIII Marat&oacute;n en Pista Ciudad de Ja&eacute;n",
    # Almería
    "XIII Carrera Popular Francisco Montoya",
    "X Desaf&iacute;o Playa de los Muertos - Faro Mesa Rold&aacute;n",
    "X CxM Sierro",
    "II CxM Villa de Laroya",
    "XIX Media Marat&oacute;n Ciudad de las Hortalizas",
    "XX Carrera de Monta&ntilde;a Valle del Almanzora",
    "Carrera Solidaria Ruta 091 de Almer&iacute;a",
    "Maim&oacute;n Trail",
    "V Road Running V&iacute;car",
    "II Carrera Lago Victoria Almerimar",
    "X Carrera Nocturna Contra el C&aacute;ncer Ciudad de Almer&iacute;a",
    "XIII Carrera Nocturna Ciudad de Balerma",
    "CxM Macael M&aacute;rmol",
]


def html_to_plain(s):
    """Convierte HTML entities a texto plano para la query Google."""
    return (s
        .replace("&aacute;", "á").replace("&eacute;", "é").replace("&iacute;", "í")
        .replace("&oacute;", "ó").replace("&uacute;", "ú").replace("&ntilde;", "ñ")
        .replace("&Aacute;", "Á").replace("&Eacute;", "É").replace("&Iacute;", "Í")
        .replace("&Oacute;", "Ó").replace("&Uacute;", "Ú").replace("&Ntilde;", "Ñ")
        .replace("&ordm;", "º").replace("&ordf;", "ª")
        .replace("&ndash;", "–").replace("&mdash;", "—")
        .replace("&middot;", "·")
    )


def make_link(name_html, query_suffix=""):
    """Genera un <a> tag a búsqueda Google del nombre de la carrera."""
    plain = html_to_plain(name_html)
    q = urllib.parse.quote(f"{plain} {query_suffix}".strip())
    return f'<a href="https://www.google.com/search?q={q}" target="_blank" rel="noopener nofollow" style="color:#f97316;text-decoration:none">{name_html}</a>'


def main():
    html = ARTICLE.read_text(encoding="utf-8")
    original = html
    replaced = 0

    # 1. Tablas: <td>NAME</td> → <td><a>NAME</a></td>
    # Solo cuando NAME es una carrera conocida y no es ya un link.
    all_races = list(set(RACES_TABLE + RACES_LIST))
    # Ordenar por longitud descendente para evitar matches parciales (ej. "10K Huelva" antes que solo "10K")
    all_races.sort(key=len, reverse=True)

    for race in all_races:
        link = make_link(race, "2026 inscripción")

        # Patrón 1: <td>NAME</td> en tablas (literal, no regex)
        pattern_td = f"<td>{race}</td>"
        replacement_td = f"<td>{link}</td>"
        count_before = html.count(pattern_td)
        if count_before > 0:
            html = html.replace(pattern_td, replacement_td)
            replaced += count_before

        # Patrón 2: <strong>NAME</strong> en listas
        pattern_strong = f"<strong>{race}</strong>"
        replacement_strong = f"<strong>{link}</strong>"
        count_strong = html.count(pattern_strong)
        if count_strong > 0:
            html = html.replace(pattern_strong, replacement_strong)
            replaced += count_strong

    # 2. H3 de top 7: añadir link al título
    top7_h3 = [
        ("<h3>1. 10K Huelva Puerta del Descubrimiento &mdash; 6 junio</h3>",
         '<h3>1. <a href="https://www.google.com/search?q=10K+Huelva+Puerta+del+Descubrimiento+2026+inscripcion" target="_blank" rel="noopener nofollow" style="color:#ea580c;text-decoration:none">10K Huelva Puerta del Descubrimiento</a> &mdash; 6 junio</h3>'),
        ("<h3>2. IX Sherry Marat&oacute;n &mdash; 3 mayo, Jerez de la Frontera</h3>",
         '<h3>2. <a href="https://www.google.com/search?q=Sherry+Marat%C3%B3n+Jerez+2026+inscripcion" target="_blank" rel="noopener nofollow" style="color:#ea580c;text-decoration:none">IX Sherry Marat&oacute;n</a> &mdash; 3 mayo, Jerez de la Frontera</h3>'),
        ("<h3>3. XIII Media Marat&oacute;n V&eacute;lez-M&aacute;laga &mdash; 1 mayo</h3>",
         '<h3>3. <a href="https://www.google.com/search?q=Media+Marat%C3%B3n+V%C3%A9lez-M%C3%A1laga+2026+inscripcion" target="_blank" rel="noopener nofollow" style="color:#ea580c;text-decoration:none">XIII Media Marat&oacute;n V&eacute;lez-M&aacute;laga</a> &mdash; 1 mayo</h3>'),
        ("<h3>4. Ultra Trail Bosques del Sur &mdash; 30 mayo, Cazorla</h3>",
         '<h3>4. <a href="https://www.google.com/search?q=Ultra+Trail+Bosques+del+Sur+Cazorla+2026+inscripcion" target="_blank" rel="noopener nofollow" style="color:#ea580c;text-decoration:none">Ultra Trail Bosques del Sur</a> &mdash; 30 mayo, Cazorla</h3>'),
        ("<h3>5. XXVI 101 Km &ndash; 24 horas La Legi&oacute;n &mdash; 9 mayo, Ronda</h3>",
         '<h3>5. <a href="https://www.google.com/search?q=101+Km+La+Legi%C3%B3n+Ronda+2026+inscripcion" target="_blank" rel="noopener nofollow" style="color:#ea580c;text-decoration:none">XXVI 101 Km &ndash; 24 horas La Legi&oacute;n</a> &mdash; 9 mayo, Ronda</h3>'),
        ("<h3>6. III CxM Trail Puntademo &mdash; 30 mayo, Punta Umbr&iacute;a</h3>",
         '<h3>6. <a href="https://www.google.com/search?q=Trail+Puntademo+Punta+Umbria+2026+inscripcion" target="_blank" rel="noopener nofollow" style="color:#ea580c;text-decoration:none">III CxM Trail Puntademo</a> &mdash; 30 mayo, Punta Umbr&iacute;a</h3>'),
        ("<h3>7. Carrera Parque de Mar&iacute;a Luisa &mdash; 10 mayo, Sevilla</h3>",
         '<h3>7. <a href="https://www.google.com/search?q=Carrera+Parque+Mar%C3%ADa+Luisa+Sevilla+2026+inscripcion" target="_blank" rel="noopener nofollow" style="color:#ea580c;text-decoration:none">Carrera Parque de Mar&iacute;a Luisa</a> &mdash; 10 mayo, Sevilla</h3>'),
    ]
    for old, new in top7_h3:
        if old in html:
            html = html.replace(old, new)
            replaced += 1

    if html == original:
        print("[!] Ningun cambio aplicado.")
        return

    ARTICLE.write_text(html, encoding="utf-8")
    print(f"[OK] {replaced} enlaces anadidos al articulo.")


if __name__ == "__main__":
    main()
