import os
import cv2
import numpy as np
from PIL import Image

class BaseAnalyzer:
    def __init__(self, mismatch_threshold=15.0):
        self.mismatch_threshold = mismatch_threshold
        # Ensure diff directory exists
        os.makedirs("respawnassessment/diffs", exist_ok=True)

    def load_image(self, img_path):
        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Image not found at path: {img_path}")
        pil_img = Image.open(img_path).convert("RGB")
        if cv2 is not None:
            cv_img = cv2.imread(img_path)
            if cv_img is None:
                cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            return pil_img, cv_img
        return pil_img, None

    def save_diff_image(self, diff_img, angle_name, aspect_name):
        diff_path = f"respawnassessment/diffs/{angle_name}_{aspect_name}_diff.jpg"
        if cv2 is not None and diff_img is not None:
            cv2.imwrite(diff_path, diff_img)
        return diff_path

    def compute_color_diff(self, ref_cv, user_cv, angle_name):
        if cv2 is None or ref_cv is None or user_cv is None:
            return 0.0, None

        ref_hsv = cv2.cvtColor(ref_cv, cv2.COLOR_BGR2HSV)
        user_hsv = cv2.cvtColor(user_cv, cv2.COLOR_BGR2HSV)

        mean_hue_ref = np.mean(ref_hsv[:, :, 0])
        mean_hue_user = np.mean(user_hsv[:, :, 0])
        color_diff_score = abs(mean_hue_ref - mean_hue_user)

        if ref_hsv.shape[:2] != user_hsv.shape[:2]:
            user_hsv_resized = cv2.resize(user_hsv, (ref_hsv.shape[1], ref_hsv.shape[0]))
        else:
            user_hsv_resized = user_hsv

        diff_hsv = cv2.absdiff(ref_hsv, user_hsv_resized)
        heatmap = cv2.applyColorMap(diff_hsv[:, :, 0], cv2.COLORMAP_JET)
        diff_path = self.save_diff_image(heatmap, angle_name, "color")

        return color_diff_score, diff_path

    def compute_edge_diff(self, ref_cv, user_cv, angle_name):
        if cv2 is None or ref_cv is None or user_cv is None:
            return 0.0, None

        ref_gray = cv2.cvtColor(ref_cv, cv2.COLOR_BGR2GRAY)
        user_gray = cv2.cvtColor(user_cv, cv2.COLOR_BGR2GRAY)

        ref_edges = cv2.Canny(cv2.GaussianBlur(ref_gray, (5, 5), 0), 50, 150)
        user_edges = cv2.Canny(cv2.GaussianBlur(user_gray, (5, 5), 0), 50, 150)

        if ref_edges.shape != user_edges.shape:
            user_edges_resized = cv2.resize(user_edges, (ref_edges.shape[1], ref_edges.shape[0]))
            user_gray_resized = cv2.resize(user_gray, (ref_gray.shape[1], ref_gray.shape[0]))
        else:
            user_edges_resized = user_edges
            user_gray_resized = user_gray

        edge_diff = cv2.absdiff(user_edges_resized, ref_edges)
        edge_density_diff = np.sum(edge_diff > 0) / float(edge_diff.size)
        
        diff_vis = cv2.cvtColor(user_gray_resized, cv2.COLOR_GRAY2BGR)
        diff_vis[edge_diff > 0] = [0, 0, 255] # Red dots for extra edges
        
        diff_path = self.save_diff_image(diff_vis, angle_name, "edges")

        return edge_density_diff, diff_path

    def compute_structural_diff(self, ref_cv, user_cv, angle_name, ref_pil, user_pil):
        if cv2 is None or ref_cv is None or user_cv is None:
            return 0.0, 100.0, None

        aspect_ref = ref_pil.size[0] / float(ref_pil.size[1])
        aspect_user = user_pil.size[0] / float(user_pil.size[1])
        shape_diff = abs(aspect_ref - aspect_user)

        orb = cv2.ORB_create(500)
        kp1, des1 = orb.detectAndCompute(ref_cv, None)
        kp2, des2 = orb.detectAndCompute(user_cv, None)

        match_score = 100.0
        diff_path = None

        if des1 is not None and des2 is not None:
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            matches = sorted(matches, key=lambda x: x.distance)
            good_matches = [m for m in matches if m.distance < 50]

            match_score = (len(good_matches) / max(min(len(kp1), len(kp2)), 1)) * 100.0
            match_score = min(match_score, 100.0)

            # Draw top 20 matches
            match_img = cv2.drawMatches(ref_cv, kp1, user_cv, kp2, matches[:20], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
            diff_path = self.save_diff_image(match_img, angle_name, "structural")

        return shape_diff, match_score, diff_path

    def analyze_pair(self, ref_path, user_path, angle_name):
        raise NotImplementedError("Subclasses must implement category-specific analyze_pair logic.")
