import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string; // Plaintext as requested: "dont hash passowed"
  createdAt: Date;
}

export interface SizeHistoryEntry {
  productId: string;
  productName: string;
  category: string;
  orderedSize: string; // e.g. "9", "8", "M", "L"
  purchaseDate: Date;
  status: "Delivered" | "Returned" | "Active";
}

export interface ElectronicsHistoryEntry {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  specs: {
    voltage?: string; // e.g. "220V", "110V"
    powerRating?: string; // e.g. "65W", "10W"
    batteryCapacity?: string; // e.g. "5000mAh"
  };
  purchaseDate: Date;
  status: "Delivered" | "Returned" | "Active";
}

export interface UserDetails {
  _id?: ObjectId;
  userId: string; // Matches User._id
  username: string;
  purchaseCount: number;
  clothingSizeHistory: SizeHistoryEntry[]; // Keeps track of previous 10 clothing sizes ordered
  electronicsHistory: ElectronicsHistoryEntry[]; // Keeps track of previous 10 electronics items ordered
  createdAt: Date;
}
