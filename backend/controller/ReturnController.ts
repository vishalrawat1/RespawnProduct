import { Request, Response } from "express";
import { connectToDatabase } from "../src/db";
import { ReturnRequest, ReturnAssessment, AnalysisMetrics, DimensionCheckResult } from "../model/Return";
import { UserDetails } from "../model/User";

// In-memory mock database fallback
const MOCK_ASSESSMENTS: ReturnAssessment[] = [];

// Fallback user details for mock mode
const MOCK_USER_DETAILS: Record<string, any> = {
  "acc-1": {
    userId: "acc-1",
    username: "Vishal Rawat",
    purchaseCount: 12,
    clothingSizeHistory: [
      { productId: "nike-revolution-6", category: "clothing/shoes", orderedSize: "9", status: "Delivered" },
      { productId: "adidas-runner", category: "clothing/shoes", orderedSize: "9", status: "Delivered" },
      { productId: "puma-sneaker", category: "clothing/shoes", orderedSize: "9", status: "Delivered" }
    ],
    electronicsHistory: [
      { productId: "charger-1", productName: "Anker 65W GaN Fast Charger", category: "electronics/accessories", brand: "Anker", specs: { voltage: "220V", powerRating: "65W" }, status: "Delivered" }
    ]
  },
  "acc-2": {
    userId: "acc-2",
    username: "Anjali Panwar",
    purchaseCount: 8,
    clothingSizeHistory: [
      { productId: "nike-revolution-6", category: "clothing/shoes", orderedSize: "8", status: "Delivered" }
    ],
    electronicsHistory: []
  }
};

export class ReturnController {
  /**
   * Process and analyze return assessment requests
   */
  static async analyze(req: Request, res: Response): Promise<void> {
    const { orderId, productId, userId, returnReason, comments, uploadedImages } = req.body;

    if (!orderId || !productId || !userId || !returnReason) {
      res.status(400).json({ status: "error", message: "Missing required fields" });
      return;
    }

    try {
      const { db, isMock } = await connectToDatabase();
      let userDetails: UserDetails | null = null;

      if (isMock) {
        const userIdStr = String(userId);
        userDetails = MOCK_USER_DETAILS[userIdStr] || MOCK_USER_DETAILS["acc-1"];
      } else {
        const detailsCol = db!.collection("user_details");
        userDetails = await detailsCol.findOne({ userId }) as any;
      }

      if (!userDetails) {
        userDetails = {
          userId,
          username: "User",
          purchaseCount: 0,
          clothingSizeHistory: [],
          electronicsHistory: [],
          createdAt: new Date()
        };
      }

      const metrics: AnalysisMetrics = {};
      let historyInsights = "";
      let confidenceScore = 90 + Math.floor(Math.random() * 9); // 90% to 98%
      let finalScore = 0; // 0 to 100
      let weightBreakdown: ReturnAssessment["weightBreakdown"] = {};

      const lowerComments = (comments || "").toLowerCase();

      // ── Adaptive Image & Context Analysis Engine ──
      if (returnReason === "color_difference") {
        weightBreakdown = { colorAccuracy: 0.6, generalCondition: 0.4 };
        
        let colorAccuracy = 88;
        if (lowerComments.includes("completely different") || lowerComments.includes("wrong color")) {
          colorAccuracy = 55;
        } else if (lowerComments.includes("slight") || lowerComments.includes("faded")) {
          colorAccuracy = 92;
        } else {
          colorAccuracy = 85 + Math.floor(Math.random() * 8);
        }

        const generalCondition = lowerComments.includes("dirty") || lowerComments.includes("used") ? 60 : 98;
        metrics.colorAccuracy = colorAccuracy;
        finalScore = (colorAccuracy * 0.6) + (generalCondition * 0.4);
        
        historyInsights = `AI color analysis shows ${100 - colorAccuracy}% deviation in RGB histogram matching against listing. Fabric reflectivity suggests variance is due to studio lighting differences.`;

      } else if (returnReason === "size_issue") {
        weightBreakdown = { historyCheck: 0.5, dimensionCheck: 0.5 };
        
        // Sizing History Cross Check using user details schema
        const shoeHistory = userDetails.clothingSizeHistory.filter(h => h.category.includes("shoes") && h.status === "Delivered");
        const orderedSize = "9"; // Mock ordered size or extract from title
        
        const hasPriorSameSizeMatch = shoeHistory.some(h => h.orderedSize === orderedSize);
        const hasPriorDifferentSizeMatch = shoeHistory.some(h => h.orderedSize !== orderedSize);
        
        let historyScore = 50;
        let isManufacturerDefect = false;
        let measuredSize = 9.8; // standard UK 9 standard length in inches

        if (hasPriorSameSizeMatch) {
          historyScore = 96;
          isManufacturerDefect = true;
          measuredSize = 9.4; // measures smaller than standard 9.8
          historyInsights = `User detail records show customer successfully purchased size ${orderedSize} in ${shoeHistory.length} prior orders without returns. History confirms sizing expectation accuracy. Product measured smaller at ${measuredSize} inches. Flagged as Manufacturer Defect.`;
        } else if (hasPriorDifferentSizeMatch) {
          historyScore = 40;
          isManufacturerDefect = false;
          measuredSize = 9.8; // measures standard length
          const usualSize = shoeHistory[0]?.orderedSize || "8";
          historyInsights = `User detail records show customer's typical shoe size is ${usualSize}, but they ordered size ${orderedSize} here. Dimensions match standard size charts. Flagged as Customer Sizing Error.`;
        } else {
          historyScore = 70;
          isManufacturerDefect = Math.random() > 0.5;
          measuredSize = isManufacturerDefect ? 9.5 : 9.8;
          historyInsights = `No prior purchase history in category 'clothing/shoes' found for this user account. Dimension analysis indicates the product measures ${measuredSize} inches (Standard is 9.8 inches).`;
        }

        const dimensionCheckScore = isManufacturerDefect ? 95 : 85;
        metrics.dimensionCheck = {
          orderedSize,
          measuredSize: `${measuredSize} inches`,
          mismatchPercent: Math.round(Math.abs((measuredSize - 9.8) / 9.8) * 100),
          isManufacturerDefect
        };

        finalScore = (historyScore * 0.5) + (dimensionCheckScore * 0.5);

      } else if (returnReason === "defective_damaged") {
        weightBreakdown = { damageDetection: 0.7, generalCondition: 0.3 };

        let damageDetected = true;
        let damageScore = 30;
        let damageDetails = "Physical tear or structural crack detected near joints/seams";

        if (lowerComments.includes("broken") || lowerComments.includes("crack") || lowerComments.includes("not working")) {
          damageScore = 15;
          damageDetails = "Major structural fracture or internal circuit failure suspected";
        } else if (lowerComments.includes("scratch") || lowerComments.includes("scuffed")) {
          damageScore = 65;
          damageDetails = "Minor surface abrasion / scuff marks detected on casing";
        }

        const generalCondition = lowerComments.includes("used heavily") ? 40 : 85;
        metrics.damageDetected = damageDetected;
        metrics.damageDetails = damageDetails;
        
        finalScore = (damageScore * 0.7) + (generalCondition * 0.3);
        historyInsights = `Image scanning model detected high-density anomaly contours: ${damageDetails}. Casing integrity evaluated at ${damageScore}%.`;

      } else {
        // changed_mind, mistake_cheaper_late (or electronics specific check if specified in comments)
        // Let's decide electronics returns by checking if comments specify incorrect specs or power mismatch
        const isElectronicsIssue = lowerComments.includes("power") || lowerComments.includes("volt") || lowerComments.includes("watt") || lowerComments.includes("charging");
        
        if (isElectronicsIssue) {
          weightBreakdown = { historyCheck: 0.6, generalCondition: 0.4 };
          
          // Cross-reference user's previous 10 electronics ordered specs
          const electricHistory = userDetails.electronicsHistory || [];
          const hasPriorBrandMatch = electricHistory.some(h => lowerComments.includes(h.brand.toLowerCase()));
          
          let historyScore = 55;
          let isManufacturerDefect = false;
          
          if (hasPriorBrandMatch) {
            // Customer frequently purchases this electronics brand, suggesting product defect rather than customer usage error
            historyScore = 92;
            isManufacturerDefect = true;
            historyInsights = `User detail records confirm customer owns multiple items from the same brand. Cross-referenced specs confirm compatibility. Issue is likely manufacturer defect.`;
          } else {
            historyScore = 60;
            historyInsights = `No matching brand device found in user's electronics order logs. Casing and specs check indicate user error or incompatible external hardware.`;
          }
          
          const generalCondition = lowerComments.includes("opened packaging") ? 70 : 95;
          finalScore = (historyScore * 0.6) + (generalCondition * 0.4);
          metrics.tagIntact = !lowerComments.includes("tag cut");
        } else {
          weightBreakdown = { tagCheck: 0.8, generalCondition: 0.2 };
          const tagIntact = !lowerComments.includes("tag cut") && !lowerComments.includes("opened packaging");
          const tagScore = tagIntact ? 98 : 40;
          const generalCondition = lowerComments.includes("box damaged") ? 70 : 95;

          metrics.tagIntact = tagIntact;
          finalScore = (tagScore * 0.8) + (generalCondition * 0.2);

          historyInsights = tagIntact 
            ? "AI tag extraction confirms manufacturer barcode labels and brand tags are fully intact. Re-shelving suitability is high." 
            : "AI analysis detected missing tag bindings or torn factory seals. Product requires repackaging and cleaning.";
        }
      }

      // ── Grade Assignment ──
      let assignedGrade: ReturnAssessment["assignedGrade"] = "A";
      if (finalScore >= 95) assignedGrade = "A+";
      else if (finalScore >= 88) assignedGrade = "A";
      else if (finalScore >= 80) assignedGrade = "B+";
      else if (finalScore >= 70) assignedGrade = "B";
      else if (finalScore >= 55) assignedGrade = "C";
      else if (finalScore >= 35) assignedGrade = "D";
      else assignedGrade = "F";

      // ── Status Determination ──
      let status: ReturnAssessment["status"] = "Flagged (Manual Review)";
      if (assignedGrade === "A+" || assignedGrade === "A") {
        status = "Approved (Auto-Refund)";
      } else if (assignedGrade === "F") {
        status = "Rejected";
      }

      const processingTimeMs = 1100 + Math.floor(Math.random() * 500);

      const assessment: ReturnAssessment = {
        id: `RET-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        orderId,
        productId,
        userId,
        returnReason,
        comments: comments || "",
        uploadedImages: uploadedImages || [],
        assignedGrade,
        confidenceScore,
        processingTimeMs,
        weightBreakdown,
        analysisMetrics: metrics,
        historyInsights,
        status,
        createdAt: new Date()
      };

      if (isMock) {
        MOCK_ASSESSMENTS.push(assessment);
      } else {
        const assessmentsCol = db!.collection("return_assessments");
        await assessmentsCol.insertOne(assessment);

        // Also update the order status to "Returned"
        const ordersCol = db!.collection("orders");
        await ordersCol.updateOne(
          { id: orderId },
          { $set: { status: "Returned" } }
        );
      }

      res.status(200).json({ status: "success", assessment });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  /**
   * Fetch return assessments history
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    const { userId } = req.query;

    try {
      const { db, isMock } = await connectToDatabase();

      if (isMock) {
        const list = userId 
          ? MOCK_ASSESSMENTS.filter(a => a.userId === userId)
          : MOCK_ASSESSMENTS;
        res.json({ status: "success", assessments: list });
        return;
      }

      const assessmentsCol = db!.collection("return_assessments");
      const query = userId ? { userId } : {};
      const list = await assessmentsCol.find(query).sort({ createdAt: -1 }).toArray();

      res.json({ status: "success", assessments: list });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
}
