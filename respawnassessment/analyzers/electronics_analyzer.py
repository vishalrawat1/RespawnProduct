from .base_analyzer import BaseAnalyzer

class ElectronicsAnalyzer(BaseAnalyzer):
    def analyze_pair(self, ref_path, user_path, angle_name):
        ref_pil, ref_cv = self.load_image(ref_path)
        user_pil, user_cv = self.load_image(user_path)

        defects = []
        diff_files = {}

        # 1. Color diff (Check for burn-in, deep scratches that change color, surface discoloration)
        color_diff, color_diff_path = self.compute_color_diff(ref_cv, user_cv, angle_name)
        if color_diff_path: diff_files["color_diff"] = color_diff_path
        if color_diff > 20:
            defects.append({
                "aspect": "Color Condition",
                "severity": "high" if color_diff > 40 else "medium",
                "details": f"Color shift detected (Delta: {color_diff:.1f}). Possible screen burn-in or surface discoloration."
            })

        # 2. Edge diff (Physical Damage / Scratches on glass or casing)
        edge_diff, edge_diff_path = self.compute_edge_diff(ref_cv, user_cv, angle_name)
        if edge_diff_path: diff_files["edge_diff"] = edge_diff_path
        if edge_diff > 0.03:
            defects.append({
                "aspect": "Physical Damage",
                "severity": "high" if edge_diff > 0.08 else "medium",
                "details": "Anomalous edges detected. Possible scratches, cracks, or surface wear."
            })

        # 3. Structural diff (Structural Integrity / Dents)
        shape_diff, match_score, struct_diff_path = self.compute_structural_diff(ref_cv, user_cv, angle_name, ref_pil, user_pil)
        if struct_diff_path: diff_files["structural_diff"] = struct_diff_path
        
        if shape_diff > 0.05:
            defects.append({
                "aspect": "Structural Integrity",
                "severity": "high",
                "details": f"Device shape deformation detected (Aspect diff: {shape_diff:.2f}). Possible severe bending/warping."
            })

        if match_score < 70:
            defects.append({
                "aspect": "Surface Wear / Display Condition",
                "severity": "medium" if match_score > 50 else "high",
                "details": f"Low structural match ({match_score:.1f}%). Missing buttons, severe dents, or unrecognizable display condition."
            })

        # Calculate localized mismatch score with high weight on edges/structure for electronics
        base_mismatch = (100 - match_score) * 0.5 + (color_diff / 180.0) * 30.0 + (edge_diff * 100) * 2.5
        mismatch_score = min(max(base_mismatch, 0.0), 100.0)

        return {
            "angle": angle_name,
            "mismatch_score": round(mismatch_score, 2),
            "defects_detected": defects,
            "diff_files": diff_files
        }
