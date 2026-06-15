from .base_analyzer import BaseAnalyzer

class ClothingAnalyzer(BaseAnalyzer):
    def analyze_pair(self, ref_path, user_path, angle_name):
        ref_pil, ref_cv = self.load_image(ref_path)
        user_pil, user_cv = self.load_image(user_path)

        defects = []
        diff_files = {}

        # 1. Color diff (Stains / Color Fading) -> HIGH priority for clothing
        color_diff, color_diff_path = self.compute_color_diff(ref_cv, user_cv, angle_name)
        if color_diff_path: diff_files["color_diff"] = color_diff_path
        if color_diff > 15:
            defects.append({
                "aspect": "Color Condition / Stains",
                "severity": "high" if color_diff > 35 else "medium",
                "details": f"Stains or color fading detected (Delta: {color_diff:.1f})."
            })

        # 2. Edge diff (Fabric Damage / Tears)
        edge_diff, edge_diff_path = self.compute_edge_diff(ref_cv, user_cv, angle_name)
        if edge_diff_path: diff_files["edge_diff"] = edge_diff_path
        if edge_diff > 0.06:
            defects.append({
                "aspect": "Fabric Damage",
                "severity": "high",
                "details": "Fabric tears or heavy pilling detected via edge analysis."
            })

        # 3. Structural diff (Shape Deformation / Missing Accessories like buttons/tags)
        shape_diff, match_score, struct_diff_path = self.compute_structural_diff(ref_cv, user_cv, angle_name, ref_pil, user_pil)
        if struct_diff_path: diff_files["structural_diff"] = struct_diff_path
        
        # Clothing can be folded, so shape deformation threshold is higher
        if shape_diff > 0.30:
            defects.append({
                "aspect": "Shape Deformation",
                "severity": "medium",
                "details": f"Significant shape deformation (Aspect diff: {shape_diff:.2f}). May be stretched or improperly folded."
            })

        if match_score < 40:
            defects.append({
                "aspect": "Missing Accessories",
                "severity": "low",
                "details": f"Low feature match ({match_score:.1f}%). Possible missing tags, buttons, or heavily wrinkled."
            })

        # Calculate mismatch score with high weight on color/stains for clothing
        base_mismatch = (100 - match_score) * 0.2 + (color_diff / 180.0) * 60.0 + (edge_diff * 100) * 1.5
        mismatch_score = min(max(base_mismatch, 0.0), 100.0)

        return {
            "angle": angle_name,
            "mismatch_score": round(mismatch_score, 2),
            "defects_detected": defects,
            "diff_files": diff_files
        }
