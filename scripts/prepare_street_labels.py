"""Prepare missing local image observations for the Street View label index.

The map census retains its identities and counts. Additional image observations
keep their own IDs; broad detections containing existing labels are omitted.
Reads the agrotech export; writes only this copy of Arbor's prepared resources.
"""
import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import json
from pathlib import Path

APP = Path(__file__).resolve().parents[1]


def area(box):
    return max(0, box[2] - box[0]) * max(0, box[3] - box[1])


def intersection(a, b):
    return max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(0, min(a[3], b[3]) - max(a[1], b[1]))


def prepare(source):
    data = APP / 'src/data'
    cameras = json.loads((data / 'streetRoute.json').read_text())
    trees = json.loads((data / 'generated/tandil-trees.json').read_text())
    inventory = json.loads((source / 'resultados/mapeo/exportaciones/manzana_tandil/inventario.json').read_text())
    roles = {(o['image_id'], tuple(o['bbox_xyxy'])): o['role'] for o in inventory['observations']}
    linked = defaultdict(list)
    for tree in trees:
        for observation in tree['observations']:
            linked[observation['cameraId']].append(observation['bbox'])
    extras, counts, serials = [], Counter(), Counter()
    # Coarse heights assigned after reviewing all missing individual crop images.
    heights = [8,5,7,4.5,4.5,5,6,7,7,6,7,7,6,7,7,7,7,5,5,5,7,7,8,7,
               7,7,7,7,8,8,8,7,8,7,8,8,8,5,8,8,8,7,8,9,5,5,5,5,4,5,
               5,7,4,7,7,7,6,6,6,9,6,5,6,5,6,6,8,8,8,8,8,8,6,8,6,8,4,8,8]
    individual_index = 0
    for camera in cameras:
        path = source / 'resultados/manzana_constitucion_rivadavia_25mayo_alberdi/detecciones' / (camera['file_name'] + '.json')
        result = json.loads(path.read_text())
        for index, detection in enumerate(result['detections']):
            counts['raw_observations'] += 1
            box = detection['bbox_xyxy']
            if any(intersection(box, existing) / max(area(box) + area(existing) - intersection(box, existing), 1e-9) > .99 for existing in linked[camera['id']]):
                counts['already_linked'] += 1
                continue
            kind = 'group' if roles.get((camera['id'], tuple(box))) == 'group' else 'tree'
            if kind == 'group' and any(area(existing) < .8 * area(box) and intersection(box, existing) / max(area(existing), 1e-9) > .9 for existing in linked[camera['id']]):
                counts['covered_group_boxes'] += 1
                continue
            year = str(datetime.fromtimestamp(camera['captured_at'] / 1000, timezone.utc).year)
            serials[(year, kind)] += 1
            height = 8
            if kind == 'tree':
                height = heights[individual_index] if individual_index < len(heights) else 8
                individual_index += 1
            extras.append({
                'id': f"street:{camera['id']}:{index + 1}",
                'label': f"OBS-{year}-{serials[(year, kind)]:03}" if kind == 'tree' else f"Arbolado {serials[(year, kind)]:03}",
                'campaign': year, 'calle': camera['block_selection']['street'],
                'kind': kind, 'heightM': height,
                'observation': {
                    'id': detection['observation_id'], 'cameraId': camera['id'],
                    'score': detection['score'], 'bbox': box,
                    'width': result['width'], 'height': result['height'],
                },
            })
            counts['additional_individuals' if kind == 'tree' else 'additional_groups'] += 1
    cameras_by_id = {c['id']: c for c in cameras}
    for index, annotation in enumerate(json.loads((APP / 'scripts/street-manual-labels.json').read_text())):
        camera = cameras_by_id[annotation['cameraId']]
        year = str(datetime.fromtimestamp(camera['captured_at'] / 1000, timezone.utc).year)
        width, height = camera['local_width'], camera['local_height']
        box = [round(value * (width if axis % 2 == 0 else height), 2)
               for axis, value in enumerate(annotation['bboxNormalized'])]
        extras.append({
            'id': f"street:manual:{camera['id']}:{index + 1}",
            'label': f"OBS-{year}-M{index + 1:02}",
            'campaign': year, 'calle': camera['block_selection']['street'],
            'kind': 'tree', 'heightM': annotation['heightM'],
            'observation': {
                'id': f"manual:{camera['id']}:{index + 1}", 'cameraId': camera['id'],
                'score': 0, 'bbox': box, 'width': width, 'height': height,
                'annotationSource': 'manual',
            },
        })
        counts['manual_individuals'] += 1
    (data / 'generated/street-extra-labels.json').write_text(json.dumps(extras, ensure_ascii=False, indent=2) + '\n')
    counts['photos_with_labels'] = len(set(linked) | {e['observation']['cameraId'] for e in extras})
    counts['total_labels'] = counts['already_linked'] + len(extras)
    print(json.dumps(dict(counts), ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('agrotech', type=Path)
    prepare(parser.parse_args().agrotech)
