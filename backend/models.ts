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
  tagIntact?: boolean;
  dimensionCheck?: DimensionCheckResult;
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
  };
  analysisMetrics: AnalysisMetrics;
  historyInsights: string;
  status: "Approved (Auto-Refund)" | "Flagged (Manual Review)" | "Rejected";
  createdAt: string;
}
