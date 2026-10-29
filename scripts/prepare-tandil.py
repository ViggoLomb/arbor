"""Copy an existing agrotech export into Arbor. Never runs or changes agrotech."""
import argparse
import json
import math
import pathlib
import shutil
from PIL import Image
from tree_heights import load_reviews, prepare_heights
from prepare_street_labels import prepare as prepare_street_labels

parser = argparse.ArgumentParser()
parser.add_argument("agrotech", type=pathlib.Path)
args = parser.parse_args()
app = pathlib.Path(__file__).resolve().parents[1]
source = args.agrotech / "resultados/manzana_constitucion_rivadavia_25mayo_alberdi"
export = args.agrotech / "resultados/mapeo/exportaciones/manzana_tandil"
manifest = json.loads((source / "manifest.json").read_text())
inventory = json.loads((export / "inventario.json").read_text())
features = json.loads((export / "arboles.geojson").read_text())["features"]
observations = {o["id"]: o for o in inventory["observations"]}
captures = {c["id"]: c for c in manifest["images"]}
photos = app / "public/streetview"
crops = app / "public/trees"
photos.mkdir(parents=True, exist_ok=True)
crops.mkdir(parents=True, exist_ok=True)

route = []
for capture in sorted(captures.values(), key=lambda c: (c["sequence"], c["captured_at"], c["id"])):
    record = dict(capture)
    original = source / "imagenes" / capture["file_name"]
    shutil.copyfile(original, photos / capture["file_name"])
    with Image.open(original) as image:
        width, height = image.size
    record.update(local_image=f"streetview/{capture['file_name']}", local_width=width, local_height=height)
    route.append(record)

def distance(a, b):
    lng1, lat1, lng2, lat2 = map(math.radians, [*a, *b])
    h = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lng2-lng1)/2)**2
    return 2 * 6371008.8 * math.asin(min(1, math.sqrt(h)))

trees = []
counts = {}
for feature in sorted(features, key=lambda f: (f["properties"]["epoch"], f["id"])):
    properties = feature["properties"]
    if not properties["active"]:
        continue
    linked = [observations[id] for id in properties["observation_ids"] if observations[id]["image_id"] in captures]
    coordinates = feature["geometry"]["coordinates"]
    linked.sort(key=lambda o: (distance(coordinates, captures[o["image_id"]]["computed_geometry"]["coordinates"]), -o["score"], o["id"]))
    assert linked, f"No photograph for {feature['id']}"
    nearest = linked[0]
    capture = captures[nearest["image_id"]]
    with Image.open(source / "imagenes" / capture["file_name"]) as image:
        x1, y1, x2, y2 = nearest["bbox_xyxy"]
        margin = max(x2-x1, y2-y1) * .06
        box = (max(0, math.floor(x1-margin)), max(0, math.floor(y1-margin)),
               min(image.width, math.ceil(x2+margin)), min(image.height, math.ceil(y2+margin)))
        image.crop(box).convert("RGB").save(crops / f"{feature['id']}.jpg", quality=90)
    campaign = properties["epoch"]
    counts[campaign] = counts.get(campaign, 0) + 1
    trees.append({
        "id": feature["id"], "label": f"ARB-{campaign}-{counts[campaign]:03}",
        "campaign": campaign, "coordinates": coordinates,
        "calle": capture["block_selection"]["street"],
        "identityStatus": properties["identity_status"],
        "positionMethod": properties["map_position"]["method"],
        "primaryObservationId": nearest["id"], "photoPath": f"trees/{feature['id']}.jpg",
        "observations": [{"id": o["id"], "cameraId": o["image_id"], "score": o["score"],
                          "bbox": o["bbox_xyxy"], "width": o["width"], "height": o["height"]} for o in linked],
    })

generated = app / "src/data/generated"
generated.mkdir(parents=True, exist_ok=True)
prepare_heights(trees, route, load_reviews())
(generated / "tandil-trees.json").write_text(json.dumps(trees, ensure_ascii=False, indent=2) + "\n")
(app / "src/data/streetRoute.json").write_text(json.dumps(route, ensure_ascii=False, indent=2) + "\n")
print(f"Prepared {len(trees)} active candidates ({counts}), {len(route)} original photos and {len(trees)} individual crops.")

# Pending groups remain a separate optional overlay, never census individuals.
group_features = json.loads((export / "grupos.geojson").read_text())["features"]
groups = [{"id": f["id"], "campaign": f["properties"]["epoch"],
           "coordinates": f["geometry"]["coordinates"], "reason": f["properties"]["reason"],
           "observationIds": f["properties"]["observation_ids"]}
          for f in group_features if f["properties"].get("active", True)
          and (f.get("geometry") or {}).get("type") == "Point"]
(generated / "tandil-groups.json").write_text(json.dumps(groups, ensure_ascii=False, indent=2) + "\n")
prepare_street_labels(args.agrotech)
