"""Prepare reproducible demo heights from local observations, never measurements.

Only uses the standard library. Camera rotation follows OpenSfM's world-to-camera
axis-angle convention. No map coordinates or assumed-tree-height distances enter
the calculation. Run this file to refresh heights in an existing prepared census.
"""

import argparse
from collections import Counter
import json
import math
from pathlib import Path
from statistics import median


VERSION = "demo-height-v1"
APP = Path(__file__).resolve().parents[1]
CAMERA_HEIGHT_M = 1.7
FALLBACK_HEIGHT_M = 8.0
MIN_HEIGHT_M, MAX_HEIGHT_M = 1.5, 25.0


def world_ray(u, v, width, height, camera):
    if camera["camera_type"] != "perspective" or camera.get("exif_orientation", 1) != 1:
        raise ValueError("Unsupported camera")
    if abs((width / height) / (camera["width"] / camera["height"]) - 1) > .01:
        raise ValueError("Unrecorded crop")
    focal, k1, k2 = camera["camera_parameters"][:3]
    if not all(math.isfinite(n) for n in (focal, k1, k2)) or focal <= 0:
        raise ValueError("Invalid calibration")
    xd = (u - (width - 1) / 2) / (focal * max(width, height))
    yd = (v - (height - 1) / 2) / (focal * max(width, height))
    x, y = xd, yd
    for _ in range(30):
        factor = 1 + k1 * (x*x + y*y) + k2 * (x*x + y*y)**2
        if not math.isfinite(factor) or factor <= .01:
            raise ValueError("Invalid distortion")
        nx, ny = xd / factor, yd / factor
        if abs(nx - x) + abs(ny - y) < 1e-12:
            x, y = nx, ny
            break
        x, y = nx, ny
    factor = 1 + k1 * (x*x + y*y) + k2 * (x*x + y*y)**2
    if math.hypot(x * factor - xd, y * factor - yd) > 1e-7:
        raise ValueError("Distortion did not converge")
    # Transposing Rodrigues' rotation is equivalent to negating its vector.
    rotation = [-n for n in camera["computed_rotation"]]
    angle = math.sqrt(sum(n*n for n in rotation))
    ray = (x, y, 1.)
    if angle < 1e-12:
        return ray
    a, b, c = (n / angle for n in rotation)
    dot = a*x + b*y + c
    cross = (b - c*y, c*x - a, a*y - b*x)
    co, si = math.cos(angle), math.sin(angle)
    return tuple(ray[i]*co + cross[i]*si + axis*dot*(1-co)
                 for i, axis in enumerate((a, b, c)))


def geometry_height(observation, camera):
    """Return a candidate height, assuming box endpoints are base and crown.

    An inset of 1% also rejects nearly clipped boxes. Pixel/pose sensitivity
    catches unstable geometry; it does not detect occlusion or validate a box.
    """
    width, height = observation["width"], observation["height"]
    x1, y1, x2, y2 = observation["bbox"]
    if (x1 < width*.01 or x2 > width*.99 or y1 < height*.01
            or y2 > height*.99 or y2-y1 < height*.08):
        return None
    u = (x1+x2)/2

    def calculate(top, bottom, tilt=0.):
        rays = [world_ray(u, y, width, height, camera) for y in (top, bottom)]
        angles = [math.atan2(r[2], math.hypot(r[0], r[1])) + tilt for r in rays]
        if angles[1] > -math.radians(3):
            return None
        distance = -CAMERA_HEIGHT_M / math.tan(angles[1])
        value = distance * (math.tan(angles[0]) - math.tan(angles[1]))
        return value if 2 <= distance <= 60 and MIN_HEIGHT_M <= value <= MAX_HEIGHT_M else None

    try:
        value = calculate(y1, y2)
        if value is None:
            return None
        delta = max(2, height*.005)
        variations = [calculate(y1+delta, y2-delta), calculate(y1-delta, y2+delta),
                      calculate(y1, y2, math.radians(.5)),
                      calculate(y1, y2, -math.radians(.5))]
        if any(v is None or abs(v-value) > value*.25 for v in variations):
            return None
        return value
    except (KeyError, ValueError, TypeError, ZeroDivisionError, OverflowError):
        return None


def prepare_heights(trees, cameras, reviews=None):
    cameras = {str(c["id"]): c for c in cameras}
    reviews = reviews or {}
    for tree in trees:
        review = reviews.get(tree["id"])
        linked = {o["id"] for o in tree["observations"]}
        estimate = {"valueM": FALLBACK_HEIGHT_M, "method": "fallback",
                    "isSimulated": True, "observationIds": [], "version": VERSION}
        if review:
            if not set(review["observationIds"]).issubset(linked):
                raise ValueError(f"Unlinked height evidence for {tree['id']}")
            estimate.update(valueM=review["valueM"], method="visual",
                            observationIds=review["observationIds"])
        else:
            candidates = [(o["id"], geometry_height(o, cameras.get(o["cameraId"], {})))
                          for o in tree["observations"]]
            candidates = [(oid, h) for oid, h in candidates if h is not None]
            if candidates:
                value = median(h for _, h in candidates)
                # Disagreement means the endpoints/identity need review; don't
                # cherry-pick a conveniently sized tree or clamp extreme values.
                if all(abs(h-value) <= max(1., value*.3) for _, h in candidates):
                    estimate.update(valueM=round(value*2)/2, method="geometry",
                                    observationIds=[oid for oid, _ in candidates],
                                    cameraHeightM=CAMERA_HEIGHT_M)
        if not math.isfinite(estimate["valueM"]) or not MIN_HEIGHT_M <= estimate["valueM"] <= MAX_HEIGHT_M:
            raise ValueError(f"Invalid simulated height for {tree['id']}")
        tree["heightEstimate"] = estimate
    return trees


def load_reviews():
    return json.loads((APP / "scripts/height-reviews.json").read_text())["trees"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify prepared heights without writing files")
    args = parser.parse_args()
    path = APP / "src/data/generated/tandil-trees.json"
    original = json.loads(path.read_text())
    trees = prepare_heights(json.loads(path.read_text()),
                            json.loads((APP / "src/data/streetRoute.json").read_text()), load_reviews())
    if args.check:
        if original != trees:
            raise SystemExit("Prepared heights are missing or out of date")
    else:
        path.write_text(json.dumps(trees, ensure_ascii=False, indent=2) + "\n")
    print(f"{len(trees)}/{len(trees)} heights: {dict(Counter(t['heightEstimate']['method'] for t in trees))}")
