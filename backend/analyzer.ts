import { 
  ReturnRequest, 
  ReturnAssessment, 
  UserPurchaseHistory, 
  SizeHistoryEntry, 
  AnalysisMetrics 
} from "./models";

// Simulated customer purchase history database
export const USER_PURCHASE_HISTORIES: Record<string, UserPurchaseHistory> = {
  "acc-1": {
    userId: "acc-1",
    userName: "Vishal Rawat",
    purchaseCount: 12,
    sizeHistory: [
      { productId: "nike-revolution-6", category: "shoes", orderedSize: "9", status: "Delivered" },
      { productId: "adidas-runner", category: "shoes", orderedSize: "9", status: "Delivered" },
      { productId: "puma-sneaker", category: "shoes", orderedSize: "9", status: "Delivered" },
      { productId: "atomic-habits", category: "books", orderedSize: "Paperback", status: "Delivered" }
    ]
  },
  "acc-2": {
    userId: "acc-2",
    userName: "Anjali Panwar",
    purchaseCount: 8,
    sizeHistory: [
      { productId: "nike-revolution-6", category: "shoes", orderedSize: "8", status: "Delivered" },
      { productId: "flat-sandals", category: "shoes", orderedSize: "8", status: "Delivered" }
    ]
  },
  "acc-3": {
    userId: "acc-3",
    userName: "Guest User",
    purchaseCount: 1,
    sizeHistory: []
  }
};

// Size charts for comparison
export const PRODUCT_SIZE_CHARTS: Record<string, { standardLengthInches: number }> = {
  "nike-revolution-6": { standardLengthInches: 9.8 } // Size 9 standard length
};

export function analyzeReturnRequest(request: ReturnRequest): ReturnAssessment {
  const startTime = Date.now();

  const userHistory = USER_PURCHASE_HISTORIES[request.userId] || {
    userId: request.userId,
    userName: "Unknown",
    purchaseCount: 0,
    sizeHistory: []
  };

  const metrics: AnalysisMetrics = {};
  let historyInsights = "";
  let confidenceScore = 90 + Math.floor(Math.random() * 9); // 90% to 98%
  let finalScore = 0; // 0 to 100
  let weightBreakdown: ReturnAssessment["weightBreakdown"] = {};

  const reason = request.returnReason;
  const comments = request.comments.toLowerCase();

  // 1. Dynamic Weighting & Analytical Simulation
  if (reason === "color_difference") {
    weightBreakdown = { colorAccuracy: 0.6, generalCondition: 0.4 };
    
    // Simulate color histogram mismatch
    let colorAccuracy = 88; // Default mismatch
    if (comments.includes("completely different") || comments.includes("wrong color")) {
      colorAccuracy = 50; // High difference
    } else if (comments.includes("slight") || comments.includes("faded")) {
      colorAccuracy = 92; // Low difference
    } else {
      colorAccuracy = 85 + Math.floor(Math.random() * 8); // Random mismatch
    }

    const generalCondition = comments.includes("dirty") || comments.includes("used") ? 60 : 98;
    
    metrics.colorAccuracy = colorAccuracy;
    finalScore = (colorAccuracy * 0.6) + (generalCondition * 0.4);
    
    historyInsights = `AI color analysis shows ${100 - colorAccuracy}% deviation in RGB histogram matching against master listing photo. Fabric reflectivity suggests ${comments.includes("light") ? "bright studio lighting variance" : "standard manufacturing dye lot variance"}.`;

  } else if (reason === "size_issue") {
    weightBreakdown = { historyCheck: 0.5, dimensionCheck: 0.5 };
    
    // Sizing History Cross Check
    const shoeHistory = userHistory.sizeHistory.filter(h => h.category === "shoes" && h.status === "Delivered");
    const orderedSize = "9"; // Mock ordered size or extract from title
    
    // Standard size check
    const hasPriorSameSizeMatch = shoeHistory.some(h => h.orderedSize === orderedSize);
    const hasPriorDifferentSizeMatch = shoeHistory.some(h => h.orderedSize !== orderedSize);
    
    let historyScore = 50;
    let isManufacturerDefect = false;
    let measuredSize = 9.8; // standard UK 9 is 9.8 inches

    if (hasPriorSameSizeMatch) {
      // Customer has a history of ordering size 9 successfully. Defect is likely on the manufacturer side
      historyScore = 95;
      isManufacturerDefect = true;
      measuredSize = 9.4; // measures smaller than standard 9.8
      historyInsights = `Customer has purchased ${shoeHistory.length} items in size ${orderedSize} without returns. History confirms sizing expectation accuracy. Product measured at ${measuredSize} inches (Standard is ${PRODUCT_SIZE_CHARTS["nike-revolution-6"]?.standardLengthInches || 9.8} inches). Flagged as Manufacturer Defect.`;
    } else if (hasPriorDifferentSizeMatch) {
      // Customer usually orders size 8 but ordered size 9 here
      historyScore = 40;
      isManufacturerDefect = false;
      measuredSize = 9.8; // measures standard length
      const usualSize = shoeHistory[0]?.orderedSize || "8";
      historyInsights = `Customer purchase history shows usual size is ${usualSize}, but they ordered size ${orderedSize} here. Measured dimensions match standard size chart perfectly. Flagged as Customer Error.`;
    } else {
      // No history
      historyScore = 70;
      isManufacturerDefect = Math.random() > 0.5;
      measuredSize = isManufacturerDefect ? 9.5 : 9.8;
      historyInsights = `No prior purchase history in category 'shoes' found for this user account. Dimension analysis indicates the product measures ${measuredSize} inches (Standard is 9.8 inches).`;
    }

    const dimensionCheckScore = isManufacturerDefect ? 95 : 85;
    metrics.dimensionCheck = {
      orderedSize,
      measuredSize: `${measuredSize} inches`,
      mismatchPercent: Math.round(Math.abs((measuredSize - 9.8) / 9.8) * 100),
      isManufacturerDefect
    };

    finalScore = (historyScore * 0.5) + (dimensionCheckScore * 0.5);

  } else if (reason === "defective_damaged") {
    weightBreakdown = { damageDetection: 0.7, generalCondition: 0.3 };

    let damageDetected = true;
    let damageScore = 30; // low score due to damage
    let damageDetails = "Teat or physical crack detected near joints/seams";

    if (comments.includes("broken") || comments.includes("crack") || comments.includes("not working")) {
      damageScore = 15;
      damageDetails = "Major structural fracture or internal circuit failure suspected";
    } else if (comments.includes("scratch") || comments.includes("scuffed")) {
      damageScore = 60;
      damageDetails = "Minor surface abrasion / scuff marks detected on casing";
    } else {
      damageScore = 40;
    }

    const generalCondition = comments.includes("used heavily") ? 40 : 85;
    
    metrics.damageDetected = damageDetected;
    metrics.damageDetails = damageDetails;
    
    finalScore = (damageScore * 0.7) + (generalCondition * 0.3);
    historyInsights = `Image scanning model detected high-density anomaly contours: ${damageDetails}. Casing integrity evaluated at ${damageScore}%.`;

  } else {
    // changed_mind, mistake_cheaper_late
    weightBreakdown = { tagCheck: 0.8, generalCondition: 0.2 };

    const tagIntact = !comments.includes("tag cut") && !comments.includes("opened packaging") && !comments.includes("used once");
    const tagScore = tagIntact ? 98 : 40;
    const generalCondition = comments.includes("box damaged") ? 70 : 95;

    metrics.tagIntact = tagIntact;
    finalScore = (tagScore * 0.8) + (generalCondition * 0.2);

    historyInsights = tagIntact 
      ? "AI tag extraction confirms manufacturer barcode labels and brand tags are fully intact. Re-shelving suitability is high." 
      : "AI analysis detected missing tag bindings or torn factory seals. Product requires repackaging and cleaning.";
  }

  // 2. Grade Assignment based on Final Score
  let assignedGrade: ReturnAssessment["assignedGrade"] = "A";
  if (finalScore >= 95) assignedGrade = "A+";
  else if (finalScore >= 88) assignedGrade = "A";
  else if (finalScore >= 80) assignedGrade = "B+";
  else if (finalScore >= 70) assignedGrade = "B";
  else if (finalScore >= 55) assignedGrade = "C";
  else if (finalScore >= 35) assignedGrade = "D";
  else assignedGrade = "F";

  // 3. Status Determination
  let status: ReturnAssessment["status"] = "Flagged (Manual Review)";
  if (assignedGrade === "A+" || assignedGrade === "A") {
    status = "Approved (Auto-Refund)";
  } else if (assignedGrade === "F") {
    status = "Rejected";
  } else {
    status = "Flagged (Manual Review)";
  }

  const processingTimeMs = 1200 + Math.floor(Math.random() * 450); // Simulated delay between 1.2s and 1.65s (sub-2-second)

  return {
    id: `RET-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
    orderId: request.orderId,
    productId: request.productId,
    userId: request.userId,
    returnReason: request.returnReason,
    comments: request.comments,
    uploadedImages: request.uploadedImages,
    assignedGrade,
    confidenceScore,
    processingTimeMs,
    weightBreakdown,
    analysisMetrics: metrics,
    historyInsights,
    status,
    createdAt: new Date().toISOString()
  };
}
