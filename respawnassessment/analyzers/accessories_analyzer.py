from .base_analyzer import BaseAnalyzer

class AccessoriesAnalyzer(BaseAnalyzer):
    def analyze_pair(self, ref_path, user_path, angle_name):
        ref_pil, ref_cv = self.load_image(ref_path)
        user_pil, user_cv = self.load_image(user_path)

        defects = []
        diff_files = {}

        # 1. Color diff (Material Condition / Discoloration)
        color_diff, color_diff_path = self.compute_color_diff(ref_cv, user_cv, angle_name)
        if color_diff_path: diff_files["color_diff"] = color_diff_path
        if color_diff > 20:
            defects.append({
                "aspect": "Color Condition",
                "severity": "medium" if color_diff < 40 else "high",
                "details": f"Material discoloration detected (Delta: {color_diff:.1f})."
            })

        # 2. Edge diff (Physical Damage / Surface Wear)
        edge_diff, edge_diff_path = self.compute_edge_diff(ref_cv, user_cv, angle_name)
        if edge_diff_path: diff_files["edge_diff"] = edge_diff_path
        if edge_diff > 0.04:
            defects.append({
                "aspect": "Physical Damage / Surface Wear",
                "severity": "high",
                "details": "Surface wear or scratches detected on accessory material."
            })

        # 3. Structural diff (Missing Components / Authenticity Verification)
        shape_diff, match_score, struct_diff_path = self.compute_structural_diff(ref_cv, user_cv, angle_name, ref_pil, user_pil)
        if struct_diff_path: diff_files["structural_diff"] = struct_diff_path
        
        if shape_diff > 0.15:
            defects.append({
                "aspect": "Structural Integrity",
                "severity": "high",
                "details": f"Accessory structure deformed (Aspect diff: {shape_diff:.2f})."
            })

        if match_score < 60:
            defects.append({
                "aspect": "Missing Components / Authenticity",
                "severity": "high",
                "details": f"Low pattern/logo match ({match_score:.1f}%). Possible missing straps/components or authenticity concern."
            })

        # Balanced weight
        base_mismatch = (100 - match_score) * 0.4 + (color_diff / 180.0) * 30.0 + (edge_diff * 100) * 2.0
        mismatch_score = min(max(base_mismatch, 0.0), 100.0)

        return {
            "angle": angle_name,
            "mismatch_score": round(mismatch_score, 2),
            "defects_detected": defects,
            "diff_files": diff_files
        }
