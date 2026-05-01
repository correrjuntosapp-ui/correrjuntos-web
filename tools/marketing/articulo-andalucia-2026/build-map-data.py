# -*- coding: utf-8 -*-
"""Genera el objeto JS con localidades de Andalucia para el mapa Leaflet."""
import json
from pathlib import Path
from collections import defaultdict

JSON_PATH = Path(r"C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\tools\marketing\articulo-andalucia-2026\carreras-andalucia-2026.json")
OUT = Path(r"C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\tools\marketing\articulo-andalucia-2026\map-data.js")

# Coords aproximadas (lat, lng) por localidad andaluza
COORDS = {
    "Huelva": (37.2614, -6.9447),
    "Huelva (Parque Zafra)": (37.2614, -6.9447),
    "Huelva (La Placeta)": (37.2614, -6.9447),
    "Huelva (Parque Moret)": (37.2700, -6.9560),
    "Huelva (Andrés Estrada)": (37.2614, -6.9447),
    "Huelva (Plaza El Punto)": (37.2614, -6.9447),
    "Cartaya": (37.2829, -7.1502),
    "Punta Umbría": (37.1808, -6.9670),
    "Galaroza": (37.9263, -6.7083),
    "Palos de la Frontera": (37.2275, -6.8930),
    "Aljaraque (Club Bellavista)": (37.2719, -7.0258),
    "Aljaraque": (37.2719, -7.0258),
    "Escacena del Campo": (37.4525, -6.4544),
    "Sevilla": (37.3886, -5.9823),
    "Marchena": (37.3328, -5.4178),
    "Pedrera": (37.0500, -4.8833),
    "Arahal": (37.2606, -5.5453),
    "Paradas": (37.2912, -5.4942),
    "Dos Hermanas": (37.2839, -5.9234),
    "Mairena del Alcor": (37.3719, -5.7414),
    "Osuna": (37.2381, -5.1058),
    "Tomares": (37.3719, -6.0444),
    "Los Palacios y Villafranca": (37.1597, -5.9242),
    "Écija": (37.5419, -5.0789),
    "Pilas": (37.2989, -6.3033),
    "Vélez-Málaga": (36.7831, -4.0972),
    "Villanueva del Trabuco": (37.0497, -4.3358),
    "Málaga": (36.7213, -4.4214),
    "Estepona": (36.4259, -5.1453),
    "La Cala del Moral": (36.7233, -4.3217),
    "Ronda": (36.7421, -5.1659),
    "Algarrobo": (36.7833, -4.0500),
    "Nerja": (36.7475, -3.8742),
    "Alfarnate": (36.9914, -4.2614),
    "Alpandeire": (36.6364, -5.2003),
    "Gaucín": (36.5181, -5.3147),
    "Antequera": (37.0192, -4.5594),
    "Algeciras": (36.1408, -5.4564),
    "Conil de la Frontera": (36.2778, -6.0892),
    "Vejer de la Frontera": (36.2497, -5.9669),
    "Arcos de la Frontera": (36.7500, -5.8067),
    "Jerez de la Frontera": (36.6864, -6.1369),
    "Puente Mayorga": (36.1828, -5.3789),
    "Sanlúcar de Barrameda": (36.7783, -6.3531),
    "Trebujena": (36.8667, -6.1833),
    "Paterna de Rivera": (36.5111, -5.8753),
    "El Puerto de Santa María": (36.5947, -6.2333),
    "Villaluenga del Rosario": (36.6919, -5.3819),
    "San Martín del Tesorillo": (36.3500, -5.2667),
    "Prado del Rey": (36.7867, -5.5503),
    "San Fernando": (36.4644, -6.1953),
    "Cádiar": (36.9281, -3.1903),
    "Salobreña": (36.7472, -3.5867),
    "Molvízar": (36.7889, -3.5994),
    "Dúrcal": (36.9928, -3.5689),
    "Órgiva": (36.9000, -3.4172),
    "Granada": (37.1773, -3.5986),
    "Pórtugos": (36.9358, -3.3019),
    "Churriana de la Vega": (37.1392, -3.6486),
    "Pedro Martínez": (37.4231, -3.1572),
    "Lanjarón": (36.9253, -3.4831),
    "Moraleda de Zafayona": (37.1769, -3.9522),
    "Baza": (37.4894, -2.7733),
    "La Peza": (37.2461, -3.2503),
    "Benamaurel": (37.6086, -2.6817),
    "Los Guájares": (36.8814, -3.6953),
    "Córdoba": (37.8882, -4.7794),
    "Castil de Campos": (37.4533, -4.2389),
    "Montalbán": (37.5836, -4.7567),
    "Santaella": (37.5447, -4.8589),
    "La Victoria": (37.6936, -4.8231),
    "Puente Genil": (37.3911, -4.7672),
    "Ibros": (38.0306, -3.5283),
    "Villanueva del Arzobispo": (38.1664, -3.0072),
    "La Carolina": (38.2722, -3.6181),
    "Jabalquinto": (38.0436, -3.7942),
    "Orcera": (38.3178, -2.6906),
    "Frailes": (37.5669, -3.7531),
    "Valdepeñas de Jaén": (37.5944, -3.8161),
    "Úbeda": (38.0136, -3.3706),
    "Cazorla": (37.9111, -3.0050),
    "Marmolejo": (38.0464, -4.1631),
    "Castillo de Locubín": (37.5269, -3.9597),
    "Begíjar": (38.0322, -3.5039),
    "Linares": (38.0936, -3.6358),
    "Jaén": (37.7796, -3.7847),
    "El Ejido (Norias de Daza)": (36.7758, -2.8147),
    "El Ejido": (36.7758, -2.8147),
    "Carboneras": (36.9961, -1.8975),
    "Sierro": (37.3147, -2.4408),
    "Laroya": (37.2989, -2.4222),
    "Armuña de Almanzora": (37.3211, -2.4747),
    "Almería": (36.8381, -2.4597),
    "Vélez-Blanco": (37.6900, -2.0950),
    "Vícar": (36.8333, -2.6500),
    "Macael": (37.4267, -2.3144),
}

PROVINCE_NAMES = {
    "huelva": "Huelva",
    "sevilla": "Sevilla",
    "malaga": "Málaga",
    "cadiz": "Cádiz",
    "granada": "Granada",
    "almeria": "Almería",
    "cordoba": "Córdoba",
    "jaen": "Jaén",
}

def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    # Agrupar por localidad
    by_locality = defaultdict(list)
    by_province = data.get("carreras_por_provincia", {})

    missing = set()

    for prov_key, prov_data in by_province.items():
        prov_name = PROVINCE_NAMES.get(prov_key, prov_key)
        for r in prov_data.get("carreras", []):
            loc = r.get("localidad", "").strip()
            if loc not in COORDS:
                missing.add(loc)
                continue
            by_locality[loc].append({
                "nombre": r.get("nombre", ""),
                "fecha": r.get("fecha", ""),
                "tipo": r.get("tipo", ""),
                "provincia": prov_name,
            })

    # Construir array de marcadores
    markers = []
    for loc, races in sorted(by_locality.items()):
        lat, lng = COORDS[loc]
        markers.append({
            "lat": lat,
            "lng": lng,
            "loc": loc,
            "count": len(races),
            "races": races,
        })

    # Estadísticas
    total_races = sum(m["count"] for m in markers)
    print(f"[OK] Localidades: {len(markers)}")
    print(f"[OK] Carreras geocoded: {total_races}")
    if missing:
        print(f"[WARN] Localidades sin coords ({len(missing)}):")
        for m in sorted(missing):
            print(f"   - {m}")

    # Salida JS
    js = "window.ANDALUCIA_RACES = " + json.dumps(markers, ensure_ascii=False, indent=0).replace("\n", "") + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"[OK] Escrito {OUT}")

if __name__ == "__main__":
    main()
