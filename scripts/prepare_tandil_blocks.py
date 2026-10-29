"""Prepare a local block catalog from Tandil's public urban parcel WFS.

Groups parcels by their complete cadastral block key. The outline is the convex
envelope of parcel vertices, not a legal boundary survey. Free polygon drawing
remains available for irregular areas. Does not modify the tree inventory.
"""
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

APP = Path(__file__).resolve().parents[1]
SERVICE = 'https://mapa.tandil.gov.ar/geoserver/ows'
LAYER = 'ws_10_catastro:parcelario_urbano'
FIELDS = ['circuns', 'seccion', 'chacra', 'chacra_let', 'quinta', 'quinta_let', 'frac', 'manz_nro', 'manz_let']


def hull(points):
    points = sorted(set(points))
    def cross(a, b, c):
        return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])
    lower, upper = [], []
    for group, ordered in [(lower, points), (upper, reversed(points))]:
        for point in ordered:
            while len(group) >= 2 and cross(group[-2], group[-1], point) <= 0:
                group.pop()
            group.append(point)
    ring = lower[:-1] + upper[:-1]
    return ring + [ring[0]] if len(ring) >= 3 else []


def prepare():
    grouped, start, total = {}, 0, None
    while total is None or start < total:
        params = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
                  'typeNames': LAYER, 'outputFormat': 'application/json',
                  'srsName': 'EPSG:4326', 'count': 5000, 'startIndex': start, 'sortBy': 'cup'}
        with urlopen(SERVICE + '?' + urlencode(params), timeout=50) as response:
            data = json.load(response)
        features = data['features']
        matched = data.get('totalFeatures', data.get('numberMatched'))
        if str(matched).isdigit():
            total = int(matched)
        for feature in features:
            properties, geometry = feature['properties'], feature.get('geometry')
            if not geometry or not properties.get('manz_nro') or str(properties['manz_nro']).strip('0') == '':
                continue
            key = '-'.join(str(properties.get(field) or '') for field in FIELDS)
            points = grouped.setdefault(key, {'properties': properties, 'points': []})['points']
            polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
            for polygon in polygons:
                points.extend((float(p[0]), float(p[1])) for p in polygon[0]
                              if len(p) >= 2 and all(math.isfinite(n) for n in p[:2]))
        start += len(features)
        print(f'Parcels: {start}/{total or "?"}; block groups: {len(grouped)}', flush=True)
        if not features or (total is None and len(features) < 5000):
            break
    blocks = []
    for key, item in sorted(grouped.items()):
        ring = hull(item['points'])
        if not ring:
            continue
        p = item['properties']
        name = f"Manzana {str(p['manz_nro']).lstrip('0') or '0'}{str(p.get('manz_let') or '').strip('0')} · Sección {p['seccion']}"
        blocks.append({'type': 'Feature', 'id': key,
                       'properties': {'id': key, 'name': name, 'code': key},
                       'geometry': {'type': 'Polygon', 'coordinates': [ring]}})
    if not blocks or (total is not None and start < total):
        raise ValueError('Incomplete municipal parcel download; existing catalog not replaced')
    result = {'type': 'FeatureCollection', 'features': blocks,
              'metadata': {'source': 'IDE Tandil · Parcelario urbano', 'url': SERVICE,
                           'layer': LAYER, 'preparedAt': datetime.now(timezone.utc).isoformat(),
                           'method': 'convex_envelope_by_cadastral_block', 'parcelCount': start,
                           'attribution': 'Cartografía: IDE Tandil · Municipalidad de Tandil'}}
    target = APP / 'public/data/tandil-blocks.geojson'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'Prepared {len(blocks)} blocks in {target}', flush=True)


if __name__ == '__main__':
    prepare()
