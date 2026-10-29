"""Physical fixtures and coverage checks for demo-height preparation."""
from copy import deepcopy
import json
import math
import unittest

from tree_heights import APP, geometry_height, load_reviews, prepare_heights


class HeightPreparationTests(unittest.TestCase):
    def setUp(self):
        self.camera = {"id": "camera", "camera_type": "perspective",
                       "width": 1000, "height": 800, "exif_orientation": 1,
                       "camera_parameters": [.5, 0., 0.],
                       "computed_rotation": [math.pi/2, 0., 0.]}
        # Level camera at 1.7m, tree 6m high and 10m away, focal length 500px.
        self.observation = {"id": "observation", "cameraId": "camera",
                            "width": 1000, "height": 800,
                            "bbox": [425., 184.5, 575., 484.5]}

    def tree(self, observations=None):
        return {"id": "tree", "coordinates": [0., 0.],
                "observations": observations or [deepcopy(self.observation)]}

    def test_known_projection_recovers_six_meter_tree(self):
        self.assertAlmostEqual(geometry_height(self.observation, self.camera), 6., places=6)

    def test_clipped_or_horizon_box_requires_fallback(self):
        for box in ([0., 184.5, 575., 484.5], [425., 0., 575., 484.5],
                    [425., 184.5, 575., 400.]):
            with self.subTest(box=box):
                observation = {**self.observation, "bbox": box}
                self.assertIsNone(geometry_height(observation, self.camera))

    def test_missing_camera_uses_explicit_fallback(self):
        tree = prepare_heights([self.tree()], [])[0]
        self.assertEqual(tree["heightEstimate"]["method"], "fallback")
        self.assertEqual(tree["heightEstimate"]["valueM"], 8.)
        self.assertEqual(tree["heightEstimate"]["observationIds"], [])

    def test_unrelated_map_coordinates_cannot_change_height(self):
        a, b = self.tree(), self.tree()
        b["coordinates"] = [100., 50.]
        a, b = prepare_heights([a, b], [self.camera])
        self.assertEqual(a["heightEstimate"], b["heightEstimate"])

    def test_conflicting_views_do_not_silently_average(self):
        shorter = {**self.observation, "id": "shorter", "bbox": [425., 334.5, 575., 484.5]}
        tree = prepare_heights([self.tree([self.observation, shorter])], [self.camera])[0]
        self.assertEqual(tree["heightEstimate"]["method"], "fallback")

    def test_review_must_reference_this_candidates_evidence(self):
        with self.assertRaises(ValueError):
            prepare_heights([self.tree()], [self.camera],
                            {"tree": {"valueM": 5., "observationIds": ["unrelated"]}})

    def test_all_prepared_candidates_have_reproducible_heights(self):
        path = APP / "src/data/generated/tandil-trees.json"
        original = json.loads(path.read_text())
        cameras = json.loads((APP / "src/data/streetRoute.json").read_text())
        result = prepare_heights(deepcopy(original), cameras, load_reviews())
        self.assertEqual(result, original)
        self.assertEqual(len(result), 124)
        self.assertEqual(len({t["id"] for t in result}), 124)
        for tree in result:
            estimate = tree["heightEstimate"]
            self.assertTrue(math.isfinite(estimate["valueM"]) and estimate["valueM"] > 0)
            self.assertTrue(estimate["isSimulated"])
            self.assertTrue(set(estimate["observationIds"]).issubset(
                {o["id"] for o in tree["observations"]}))
        groups = json.loads((APP / "src/data/generated/tandil-groups.json").read_text())
        self.assertTrue(all("heightEstimate" not in g for g in groups))


if __name__ == "__main__":
    unittest.main()
