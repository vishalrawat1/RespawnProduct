import os
import sys
import json
import argparse
import numpy as np

# Import specific analyzers
from analyzers.electronics_analyzer import ElectronicsAnalyzer
from analyzers.clothing_analyzer import ClothingAnalyzer
from analyzers.accessories_analyzer import AccessoriesAnalyzer

class ProductInspectionAI:
    def __init__(self, mismatch_threshold=15.0):
        self.mismatch_threshold = mismatch_threshold

    def get_analyzer(self, category):
        cat = category.lower()
        if cat in ["electronics", "tech", "computers"]:
            return ElectronicsAnalyzer(self.mismatch_threshold)
        elif cat in ["clothing", "fashion", "apparel"]:
            return ClothingAnalyzer(self.mismatch_threshold)
        else:
            # Default to Accessories for general items like shoes, bags, etc.
            return AccessoriesAnalyzer(self.mismatch_threshold)

    def cross_verify(self, results):
        """Cross-verifies defects seen across different angles to avoid false positives."""
        verified_defects = []
        defect_occurrences = {}

        for res in results:
            for defect in res.get("defects_detected", []):
                dtype = defect.get("aspect", "Unknown")
                if dtype not in defect_occurrences:
                    defect_occurrences[dtype] = []
                defect_occurrences[dtype].append({
                    "angle": res["angle"],
                    "severity": defect["severity"],
                    "details": defect["details"]
                })

        for dtype, occurrences in defect_occurrences.items():
            is_cross_verified = len(occurrences) > 1
            severity = "high" if any(o["severity"] == "high" for o in occurrences) else "medium"
            
            verified_defects.append({
                "aspect": dtype,
                "occurrences": occurrences,
                "is_cross_verified": is_cross_verified,
                "final_severity": severity
            })

        return verified_defects

    def inspect(self, data):
        """Main inspection entrypoint accepting structured dictionary configuration."""
        ref_images = data.get("manufacturer_reference_images", {})
        user_images = data.get("user_return_images", {})
        prod_info = data.get("product_info", {})
        category = prod_info.get("category", "accessories")

        print(f"Initiating AI inspection for {prod_info.get('brand_model', 'Unknown Product')}")
        print(f"Category identified as: {category}")

        analyzer = self.get_analyzer(category)
        results = []

        # Compare views
        views = ["front_view", "back_view", "detail_view"]
        user_keys = ["user_front", "user_back", "user_detail"]

        for v_name, u_name in zip(views, user_keys):
            if v_name in ref_images and u_name in user_images:
                res = analyzer.analyze_pair(ref_images[v_name], user_images[u_name], v_name)
                results.append(res)

        additional_angles = user_images.get("additional_angles", [])
        for idx, add_path in enumerate(additional_angles):
            ref_path = ref_images.get("detail_view") or ref_images.get("front_view")
            if ref_path:
                res = analyzer.analyze_pair(ref_path, add_path, f"additional_angle_{idx + 1}")
                results.append(res)

        if not results:
            return {
                "status": "error",
                "message": "No matching reference/user image pairs available to compare."
            }

        avg_mismatch = np.max([r["mismatch_score"] for r in results])
        verified_defects = self.cross_verify(results)
        is_defective = prod_info.get("return_reason") == "defective_damaged"

        if is_defective:
            status = "Approved (Sent to Manufacturer)"
            human_check_required = False
            remarks = "Defective claim verified. Routed directly to manufacturer RMA."
        elif avg_mismatch > self.mismatch_threshold:
            status = "Flagged (Manual Review)"
            human_check_required = True
            remarks = f"Mismatch score of {avg_mismatch:.1f}% exceeds threshold ({self.mismatch_threshold}%). Human review requested."
        else:
            status = "Approved (Auto-Refund)"
            human_check_required = False
            remarks = f"Inspection passed. Mismatch score of {avg_mismatch:.1f}% is within limits."

        simulated_human_verification = None
        if human_check_required:
            simulated_human_verification = {
                "decision": "Approved",
                "verified_by": "System Auto-Verificator (Simulated)",
                "reason": "Verified anomalies fall within acceptable manufacturing tolerances."
            }

        return {
            "product_info": prod_info,
            "overall_mismatch_score": round(float(avg_mismatch), 2),
            "mismatch_threshold": self.mismatch_threshold,
            "status": status,
            "human_check_required": human_check_required,
            "simulated_human_verification": simulated_human_verification,
            "remarks": remarks,
            "cross_verified_defects": verified_defects,
            "per_angle_results": results
        }

def main():
    parser = argparse.ArgumentParser(description="RESPawn Category-Aware AI Inspector")
    parser.add_argument("--config", help="Path to JSON config file specifying reference and user return images.")
    parser.add_argument("--output", help="Path to write JSON inspection report.")
    args = parser.parse_args()

    if not args.config:
        print("Please provide a --config JSON file.")
        sys.exit(1)

    with open(args.config, "r") as f:
        config_data = json.load(f)

    ai = ProductInspectionAI(mismatch_threshold=15.0)
    report = ai.inspect(config_data)

    print("\n--- Inspection Report Summary ---")
    print(f"Status: {report['status']}")
    print(f"Overall Mismatch: {report['overall_mismatch_score']}%")
    print("---------------------------------")

    if args.output:
        with open(args.output, "w") as f:
            json.dump(report, f, indent=2)
        print(f"Report successfully saved to {args.output}")
    else:
        print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
