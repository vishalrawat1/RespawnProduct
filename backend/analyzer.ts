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
  let status: ReturnAssessment["status"] = "Flagged (Manual Review)";

  const reason = request.returnReason;
  const comments = request.comments.toLowerCase();

  // Determine Factory Image based on ProductId
  let factoryImage = "https://rukminim2.flixcart.com/image/480/640/xif0q/shoe/p/f/k/-original-imah852np7yscyzp.jpeg?q=90"; // default Puma RS-Z
  if (request.productId === "nike-revolution-6") {
    factoryImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80";
  } else if (request.productId === "echo-dot-5") {
    factoryImage = "https://images.unsplash.com/photo-1543069027-d73630640aa3?w=500&auto=format&fit=crop&q=80";
  } else if (request.productId === "sony-wh-1000xm5") {
    factoryImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80";
  } else if (request.productId === "kindle-paperwhite") {
    factoryImage = "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80";
  }

  // 1. Dynamic Weighting & Analytical Simulation
  if (reason === "defective_damaged") {
    // ── Defective Flow: Routed directly back to manufacturer ──
    weightBreakdown = { damageDetection: 1.0 };
    finalScore = 98; // High score since it is verified defective
    metrics.damageDetected = true;
    metrics.damageDetails = comments.includes("broken") || comments.includes("crack") || comments.includes("not working")
      ? "Major structural fracture or internal component failure"
      : "Teat or physical crack detected near joints/seams";
    
    status = "Approved (Sent to Manufacturer)";
    historyInsights = `AI Diagnostic: Verified defective unit (${metrics.damageDetails}). In accordance with seller agreements, this item has been routed directly back to the manufacturer for RMA processing and replacement.`;

  } else {
    // ── Other Options: Perform pre-captured image matching & threshold check ──
    weightBreakdown = { imageMatching: 0.7, generalCondition: 0.3 };
    
    const THRESHOLD = 15; // 15% mismatch threshold
    let mismatchScore = 0;
    
    // Simulate matching score based on comment clues (scratches, scuffs, dirty, used, worn, etc. increase mismatch)
    const hasDiscrepancyClues = comments.includes("scratch") || comments.includes("scuff") || comments.includes("dirty") || comments.includes("used") || comments.includes("worn") || comments.includes("torn") || comments.includes("faded");
    
    if (hasDiscrepancyClues) {
      mismatchScore = 18 + Math.floor(Math.random() * 14); // 18% to 32% (exceeds threshold)
    } else {
      mismatchScore = 4 + Math.floor(Math.random() * 8); // 4% to 12% (within threshold)
    }

    const similarityScore = 100 - mismatchScore;
    const generalCondition = comments.includes("box damaged") ? 70 : 95;
    
    metrics.factoryImage = factoryImage;
    metrics.factoryImageMatchScore = similarityScore;
    metrics.mismatchScore = mismatchScore;
    metrics.mismatchThreshold = THRESHOLD;
    
    finalScore = (similarityScore * 0.7) + (generalCondition * 0.3);

    if (mismatchScore > THRESHOLD) {
      status = "Flagged (Manual Review)";
      historyInsights = `AI Image matching detected a ${mismatchScore}% dissimilarity against the factory pre-shipment reference image, which exceeds the threshold of ${THRESHOLD}%. A human agent check (Manual Review) is required to verify return eligibility.`;
    } else {
      status = "Approved (Auto-Refund)";
      historyInsights = `AI Image matching confirmed the product matches the factory pre-shipment reference image with a dissimilarity of ${mismatchScore}% (Threshold: ${THRESHOLD}%). Approved for Auto-Refund.`;
    }
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

  const processingTimeMs = 1200 + Math.floor(Math.random() * 450); // Simulated delay between 1.2s and 1.65s

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
