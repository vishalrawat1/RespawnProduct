# RESPawn AI Product Inspection Engine (Python)

This directory contains the Python-based AI Inspection module for the RESPawn circular commerce platform. It compares manufacturer pre-shipment reference images against user-provided return images to perform structural, color, aspect-ratio, and edge analyses.

## Features & Capabilities

1. **Defect Detection**:
   - **Scratches / Cracks / Tears**: Edge density anomalies are computed using Canny edge filters.
   - **Stains / Discoloration**: Color shifts are computed by analyzing hue histograms in HSV color space.
   - **Deformation / Dents**: Aspect ratio deviations detect warping; ORB keypoint descriptor density detects deep dents.
   - **Missing Parts**: Visual features are matched using ORB keypoint tracking, identifying if key accessories, cables, or tags are missing.
2. **Cross-Verification**:
   - Anomalies detected in one view (e.g. front view) are cross-checked across other angles (back, detail, additional user angles) to confirm defect reliability.
3. **Lighting & Angle Tolerance**:
   - Compares localized properties (e.g. aspects and relative keypoints) to account for slight camera rotation.
   - Hue threshold limits filter out minor color differences caused by warm/cool household lighting.
4. **Direct Manufacturer Bypass**:
   - For items marked as `"defective_damaged"`, it routes straight to the manufacturer's RMA queue, setting the status to `Approved (Sent to Manufacturer)`.
5. **Simulated Human Override**:
   - If the mismatch score exceeds the **15% threshold**, the request is flagged for human review (`Flagged (Manual Review)`) and a simulated backend decision confirms final verification.

---

## Installation & Setup

Ensure Python 3 is installed. To install the required packages:

```bash
pip install -r returnassessment/requirements.txt
```

---

## Running the Verification Test

We have provided a automated verification script that generates mock test images (identical matching views vs mismatched/defective color views) and runs the inspection AI.

Run the test:
```bash
python returnassessment/test_inspector.py
```

### Expected Output Summary:
```
=== MATCH TEST REPORT RESULT ===
Status: Approved (Auto-Refund)
Mismatch score: 0.0%
Human check required: False

=== MISMATCH TEST REPORT RESULT ===
Status: Flagged (Manual Review)
Mismatch score: 23.33%
Human check required: True
Simulated Human verification decision: Approved
Verification reason: Verified anomalies fall within acceptable manufacturing tolerances.
```

---

## Command Line Usage

Analyze a custom configuration file:
```bash
python returnassessment/inspector.py --config config.json --output report.json
```

### Configuration Format (`config.json`):
```json
{
  "manufacturer_reference_images": {
    "front_view": "path/to/reference_front.jpg",
    "back_view": "path/to/reference_back.jpg",
    "detail_view": "path/to/reference_detail.jpg"
  },
  "user_return_images": {
    "user_front": "path/to/buyer_front.jpg",
    "user_back": "path/to/buyer_back.jpg",
    "user_detail": "path/to/buyer_detail.jpg",
    "additional_angles": []
  },
  "product_info": {
    "category": "fashion",
    "brand_model": "Puma RS-Z Sneakers",
    "return_reason": "color_difference",
    "days_since_delivery": 4
  }
}
```
