import os
import json
import subprocess
from PIL import Image

def setup_test_images():
    os.makedirs("respawnassessment/temp_test_images", exist_ok=True)
    
    # 1. Electronics (Blue rectangle -> Red rectangle to simulate screen burn / discolor)
    Image.new("RGB", (200, 400), (0, 0, 255)).save("respawnassessment/temp_test_images/elec_ref.jpg")
    Image.new("RGB", (200, 400), (200, 0, 50)).save("respawnassessment/temp_test_images/elec_usr.jpg")

    # 2. Clothing (Green square -> Green square but slightly deformed/smaller)
    Image.new("RGB", (300, 300), (0, 255, 0)).save("respawnassessment/temp_test_images/cloth_ref.jpg")
    Image.new("RGB", (250, 300), (0, 255, 0)).save("respawnassessment/temp_test_images/cloth_usr.jpg")

    # 3. Accessories (White square -> White square with black lines/edges to simulate scratches)
    acc_ref = Image.new("RGB", (200, 200), (255, 255, 255))
    acc_ref.save("respawnassessment/temp_test_images/acc_ref.jpg")
    
    acc_usr = Image.new("RGB", (200, 200), (255, 255, 255))
    # Draw some "scratches" (edges)
    from PIL import ImageDraw
    d = ImageDraw.Draw(acc_usr)
    d.line([(50,50), (150,150)], fill=(0,0,0), width=5)
    d.line([(50,150), (150,50)], fill=(0,0,0), width=5)
    acc_usr.save("respawnassessment/temp_test_images/acc_usr.jpg")

def run_tests():
    setup_test_images()

    configs = [
        {
            "name": "Electronics Test",
            "file": "respawnassessment/config_elec.json",
            "out": "respawnassessment/report_elec.json",
            "data": {
                "manufacturer_reference_images": {"front_view": "respawnassessment/temp_test_images/elec_ref.jpg"},
                "user_return_images": {"user_front": "respawnassessment/temp_test_images/elec_usr.jpg"},
                "product_info": {"category": "electronics", "brand_model": "Test Phone"}
            }
        },
        {
            "name": "Clothing Test",
            "file": "respawnassessment/config_cloth.json",
            "out": "respawnassessment/report_cloth.json",
            "data": {
                "manufacturer_reference_images": {"front_view": "respawnassessment/temp_test_images/cloth_ref.jpg"},
                "user_return_images": {"user_front": "respawnassessment/temp_test_images/cloth_usr.jpg"},
                "product_info": {"category": "clothing", "brand_model": "Test Shirt"}
            }
        },
        {
            "name": "Accessories Test",
            "file": "respawnassessment/config_acc.json",
            "out": "respawnassessment/report_acc.json",
            "data": {
                "manufacturer_reference_images": {"front_view": "respawnassessment/temp_test_images/acc_ref.jpg"},
                "user_return_images": {"user_front": "respawnassessment/temp_test_images/acc_usr.jpg"},
                "product_info": {"category": "accessories", "brand_model": "Test Bag"}
            }
        }
    ]

    for cfg in configs:
        with open(cfg["file"], "w") as f:
            json.dump(cfg["data"], f)
        
        print(f"\nRunning {cfg['name']}...")
        subprocess.run([
            "python", "respawnassessment/inspector.py",
            "--config", cfg["file"],
            "--output", cfg["out"]
        ])

if __name__ == "__main__":
    run_tests()
