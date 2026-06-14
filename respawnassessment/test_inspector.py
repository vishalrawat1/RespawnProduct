import os
import json
import subprocess
from PIL import Image

def generate_test_images():
    os.makedirs("returnassessment/temp_test_images", exist_ok=True)
    
    # Create solid color images to simulate perfect match and defect/mismatch
    # M1, M2, M3: Reference (Blue)
    ref_color = (0, 102, 204)
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/m1.jpg")
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/m2.jpg")
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/m3.jpg")

    # Case 1: Perfect match (All blue)
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/u1_match.jpg")
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/u2_match.jpg")
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/u3_match.jpg")

    # Case 2: Mismatched/Defective (Red/discolored)
    Image.new("RGB", (200, 200), (255, 51, 51)).save("returnassessment/temp_test_images/u1_mismatch.jpg")
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/u2_mismatch.jpg")
    Image.new("RGB", (200, 200), ref_color).save("returnassessment/temp_test_images/u3_mismatch.jpg")

def run_test():
    generate_test_images()

    print("Generating config files...")
    
    # 1. Config for Perfect Match
    config_match = {
        "manufacturer_reference_images": {
            "front_view": "returnassessment/temp_test_images/m1.jpg",
            "back_view": "returnassessment/temp_test_images/m2.jpg",
            "detail_view": "returnassessment/temp_test_images/m3.jpg"
        },
        "user_return_images": {
            "user_front": "returnassessment/temp_test_images/u1_match.jpg",
            "user_back": "returnassessment/temp_test_images/u2_match.jpg",
            "user_detail": "returnassessment/temp_test_images/u3_match.jpg"
        },
        "product_info": {
            "category": "fashion",
            "brand_model": "Puma RS-Z Sneakers",
            "return_reason": "size_issue",
            "days_since_delivery": 3
        }
    }
    with open("returnassessment/config_match.json", "w") as f:
        json.dump(config_match, f, indent=2)

    # 2. Config for Mismatch (triggers human verification)
    config_mismatch = {
        "manufacturer_reference_images": {
            "front_view": "returnassessment/temp_test_images/m1.jpg",
            "back_view": "returnassessment/temp_test_images/m2.jpg",
            "detail_view": "returnassessment/temp_test_images/m3.jpg"
        },
        "user_return_images": {
            "user_front": "returnassessment/temp_test_images/u1_mismatch.jpg",
            "user_back": "returnassessment/temp_test_images/u2_mismatch.jpg",
            "user_detail": "returnassessment/temp_test_images/u3_mismatch.jpg"
        },
        "product_info": {
            "category": "fashion",
            "brand_model": "Puma RS-Z Sneakers",
            "return_reason": "color_difference",
            "days_since_delivery": 4
        }
    }
    with open("returnassessment/config_mismatch.json", "w") as f:
        json.dump(config_mismatch, f, indent=2)

    print("\nRunning inspection on matching product...")
    subprocess.run([
        "python", "returnassessment/inspector.py",
        "--config", "returnassessment/config_match.json",
        "--output", "returnassessment/report_match.json"
    ])

    print("\nRunning inspection on mismatched product...")
    subprocess.run([
        "python", "returnassessment/inspector.py",
        "--config", "returnassessment/config_mismatch.json",
        "--output", "returnassessment/report_mismatch.json"
    ])

    # Print results
    print("\n=== MATCH TEST REPORT RESULT ===")
    with open("returnassessment/report_match.json", "r") as f:
        report = json.load(f)
        print(f"Status: {report['status']}")
        print(f"Mismatch score: {report['overall_mismatch_score']}%")
        print(f"Human check required: {report['human_check_required']}")

    print("\n=== MISMATCH TEST REPORT RESULT ===")
    with open("returnassessment/report_mismatch.json", "r") as f:
        report = json.load(f)
        print(f"Status: {report['status']}")
        print(f"Mismatch score: {report['overall_mismatch_score']}%")
        print(f"Human check required: {report['human_check_required']}")
        if report['simulated_human_verification']:
            print(f"Simulated Human verification decision: {report['simulated_human_verification']['decision']}")
            print(f"Verification reason: {report['simulated_human_verification']['reason']}")

if __name__ == "__main__":
    run_test()
