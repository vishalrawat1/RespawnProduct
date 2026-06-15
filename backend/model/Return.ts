import { ObjectId } from "mongodb";

export interface ReturnRequest {
  _id?: ObjectId;
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
  createdAt: Date;
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
  factoryImage?: string; // Pre-captured factory image URL
  factoryImageMatchScore?: number; // 0 to 100 (similarity score)
  mismatchScore?: number; // 0 to 100 (dissimilarity/deviation score)
  mismatchThreshold?: number; // threshold (e.g. 15%)
}

export interface ReturnAssessment {
  _id?: ObjectId;
  id: string; // Friendly unique identifier (e.g. RET-XXXXXX)
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
  createdAt: Date;
}
