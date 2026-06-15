export interface SizeHistoryEntry {
  productId: string;
  category: string;
  orderedSize: string;
  status: "Delivered" | "Returned" | "Active";
}

export interface UserPurchaseHistory {
  userId: string;
  userName: string;
  purchaseCount: number;
  sizeHistory: SizeHistoryEntry[];
}

export interface ReturnRequest {
  orderId: string;
  productId: string;
  userId: string;
  returnReason: 
    | "color_difference" 
    | "size_issue" 
    | "defective_damaged" 
    | "changed_mind" 
    | "mistake_cheaper_late";
  comments: string;
  uploadedImages: string[];
  isRespawn?: boolean;
  productbuyid?: string;
}

export interface DimensionCheckResult {
  orderedSize: string;
  measuredSize: string;
  mismatchPercent: number;
  isManufacturerDefect: boolean;
}

export interface AnalysisMetrics {
  colorAccuracy?: number; // 0 to 100
  damageDetected?: boolean;
  damageDetails?: string;
  crossVerifiedDefects?: any[];
  tagIntact?: boolean;
  dimensionCheck?: DimensionCheckResult;
  factoryImage?: string; // Pre-captured factory image URL
  factoryImageMatchScore?: number; // 0 to 100 (similarity score)
  mismatchScore?: number; // 0 to 100 (dissimilarity/deviation score)
  mismatchThreshold?: number; // threshold (e.g. 15%)
}

export interface ReturnAssessment {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  returnReason: string;
  comments: string;
  uploadedImages: string[];
  assignedGrade: "A+" | "A" | "B+" | "B" | "C" | "D" | "F";
  confidenceScore: number;
  processingTimeMs: number;
  weightBreakdown: {
    colorAccuracy?: number;
    generalCondition?: number;
    historyCheck?: number;
    dimensionCheck?: number;
    damageDetection?: number;
    tagCheck?: number;
    imageMatching?: number;
  };
  analysisMetrics: AnalysisMetrics;
  historyInsights: string;
  status: "Approved (Auto-Refund)" | "Flagged (Manual Review)" | "Rejected" | "Approved (Sent to Manufacturer)";
  createdAt: string;
  productbuyid?: string;
}

export interface HealthCardReturnEntry {
  id: number;
  reason: string;
  count?: number;
  info?: string;
}

export interface HealthCardData {
  id: string;
  grade: string;
  confidence: number;
  returns: HealthCardReturnEntry[];
  routed: string;
  manufacturerNote: string;
  sustainability: string;
  generatedDate: string;
  blockchainHash?: string;
  images?: string[];
  mismatchScore?: number;
  productbuyid?: string;
  respawnOption?: string;
}

export interface RespawnData {
  isRespawned: boolean;
  healthCardId?: string;
  grade?: string;
  currentStage?: number;
  status?: string;
  productbuyid?: string;
}

export interface RespawnedItem {
  id: string; // Internal ID
  productId: string; // The original product ID
  productbuyid: string; // The unique buy ID
  name: string;
  image: string;
  price: number;
  type: string; // e.g. "p2p", "refurb", etc.
  currentStage: number;
  status: string;
  healthCardId?: string;
  healthCardData?: any; // To hold the embedded HealthCard
  createdAt: string;
}
