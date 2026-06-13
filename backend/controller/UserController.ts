import { Request, Response } from "express";
import { connectToDatabase } from "../src/db";
import { User, UserDetails } from "../model/User";

// In-memory mock database fallback if MongoDB is not running
const MOCK_USERS: User[] = [];
const MOCK_USER_DETAILS: Record<string, UserDetails> = {
  "acc-1": {
    userId: "acc-1",
    username: "Vishal Rawat",
    purchaseCount: 12,
    clothingSizeHistory: [
      { productId: "shoe-1", productName: "Nike Pegasus Running Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-01-10"), status: "Delivered" },
      { productId: "shoe-2", productName: "Adidas Ultraboost Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-02-15"), status: "Delivered" },
      { productId: "shoe-3", productName: "Puma Classic Sneakers", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-03-20"), status: "Delivered" },
      { productId: "shirt-1", productName: "Polo Premium Cotton Shirt", category: "clothing/apparel", orderedSize: "M", purchaseDate: new Date("2026-04-05"), status: "Delivered" },
      { productId: "shirt-2", productName: "Levis Denim Shirt", category: "clothing/apparel", orderedSize: "M", purchaseDate: new Date("2026-04-18"), status: "Delivered" }
    ],
    electronicsHistory: [
      { productId: "charger-1", productName: "Anker 65W GaN Fast Charger", category: "electronics/accessories", brand: "Anker", specs: { voltage: "220V", powerRating: "65W" }, purchaseDate: new Date("2026-01-05"), status: "Delivered" },
      { productId: "cable-1", productName: "USB-C to USB-C 100W Cable", category: "electronics/accessories", brand: "Belkin", specs: { powerRating: "100W" }, purchaseDate: new Date("2026-02-10"), status: "Delivered" }
    ],
    createdAt: new Date("2026-01-01")
  },
  "acc-2": {
    userId: "acc-2",
    username: "Anjali Panwar",
    purchaseCount: 8,
    clothingSizeHistory: [
      { productId: "shoe-1", productName: "Nike Pegasus Running Shoes", category: "clothing/shoes", orderedSize: "8", purchaseDate: new Date("2026-02-05"), status: "Delivered" },
      { productId: "sandal-1", productName: "Flat Casual Sandals", category: "clothing/shoes", orderedSize: "8", purchaseDate: new Date("2026-03-12"), status: "Delivered" }
    ],
    electronicsHistory: [],
    createdAt: new Date("2026-02-01")
  }
};

export class UserController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ status: "error", message: "Missing required fields" });
      return;
    }

    try {
      const { db, isMock } = await connectToDatabase();

      if (isMock) {
        // Mock logic
        const exists = MOCK_USERS.some(u => u.email === email || u.username === username);
        if (exists) {
          res.status(400).json({ status: "error", message: "User already exists" });
          return;
        }

        const newUser: User = {
          username,
          email,
          password, // Plain text password saved as requested
          createdAt: new Date()
        };
        MOCK_USERS.push(newUser);

        // Prepopulate previous 10 clothing sizes ordered and electronics history
        const mockUserId = `mock-user-${Date.now()}`;
        const newDetails: UserDetails = {
          userId: mockUserId,
          username,
          purchaseCount: 10,
          clothingSizeHistory: [
            { productId: "nike-revolution-6", productName: "Nike Revolution 6 Running Shoe", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-01"), status: "Delivered" },
            { productId: "adidas-racer", productName: "Adidas Racer Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-10"), status: "Delivered" },
            { productId: "puma-runner", productName: "Puma Runner Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-15"), status: "Delivered" },
            { productId: "formal-shoes", productName: "Bata Formal Leather Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-22"), status: "Delivered" }
          ],
          electronicsHistory: [
            { productId: "boat-headphone", productName: "boAt Rockerz Bluetooth Headphones", category: "electronics/audio", brand: "boAt", specs: { batteryCapacity: "400mAh", powerRating: "5W" }, purchaseDate: new Date("2026-05-05"), status: "Delivered" },
            { productId: "charger-2", productName: "Apple 20W USB-C Power Adapter", category: "electronics/accessories", brand: "Apple", specs: { voltage: "110V-220V", powerRating: "20W" }, purchaseDate: new Date("2026-05-12"), status: "Delivered" }
          ],
          createdAt: new Date()
        };
        MOCK_USER_DETAILS[mockUserId] = newDetails;

        res.status(201).json({ status: "success", user: { username, email, userId: mockUserId } });
        return;
      }

      // MongoDB logic
      const usersCol = db!.collection("users");
      const existingUser = await usersCol.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        res.status(400).json({ status: "error", message: "User already exists" });
        return;
      }

      const userDoc: User = {
        username,
        email,
        password, // Stored as plain text per user request
        createdAt: new Date()
      };
      const insertResult = await usersCol.insertOne(userDoc);
      const userId = insertResult.insertedId.toString();

      // Pre-populate user details schema with history
      const detailsCol = db!.collection("user_details");
      const detailsDoc: UserDetails = {
        userId,
        username,
        purchaseCount: 10,
        clothingSizeHistory: [
          { productId: "nike-revolution-6", productName: "Nike Revolution 6 Running Shoe", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-01"), status: "Delivered" },
          { productId: "adidas-racer", productName: "Adidas Racer Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-10"), status: "Delivered" },
          { productId: "puma-runner", productName: "Puma Runner Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-15"), status: "Delivered" },
          { productId: "formal-shoes", productName: "Bata Formal Leather Shoes", category: "clothing/shoes", orderedSize: "9", purchaseDate: new Date("2026-05-22"), status: "Delivered" }
        ],
        electronicsHistory: [
          { productId: "boat-headphone", productName: "boAt Rockerz Bluetooth Headphones", category: "electronics/audio", brand: "boAt", specs: { batteryCapacity: "400mAh", powerRating: "5W" }, purchaseDate: new Date("2026-05-05"), status: "Delivered" },
          { productId: "charger-2", productName: "Apple 20W USB-C Power Adapter", category: "electronics/accessories", brand: "Apple", specs: { voltage: "110V-220V", powerRating: "20W" }, purchaseDate: new Date("2026-05-12"), status: "Delivered" }
        ],
        createdAt: new Date()
      };
      await detailsCol.insertOne(detailsDoc);

      res.status(201).json({ status: "success", user: { username, email, userId } });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  /**
   * Login user (checking plain text password)
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { loginKey, password } = req.body; // loginKey can be email or username

    if (!loginKey || !password) {
      res.status(400).json({ status: "error", message: "Missing credentials" });
      return;
    }

    try {
      const { db, isMock } = await connectToDatabase();

      if (isMock) {
        // Try matching in-memory mock users first
        let foundUser = MOCK_USERS.find(u => (u.email === loginKey || u.username === loginKey) && u.password === password);
        
        // Fallback checks for preset accounts
        if (!foundUser && loginKey === "Vishal Rawat" && password === "password123") {
          foundUser = { username: "Vishal Rawat", email: "rawatvishal666@gmail.com", password: "password123", createdAt: new Date() };
          res.json({ status: "success", user: { username: foundUser.username, email: foundUser.email, userId: "acc-1" } });
          return;
        }

        if (foundUser) {
          res.json({ status: "success", user: { username: foundUser.username, email: foundUser.email, userId: "acc-1" } });
        } else {
          res.status(401).json({ status: "error", message: "Invalid username/email or password" });
        }
        return;
      }

      // MongoDB login logic
      const usersCol = db!.collection("users");
      const userDoc = await usersCol.findOne({
        $or: [{ email: loginKey }, { username: loginKey }]
      });

      if (userDoc && userDoc.password === password) {
        res.json({
          status: "success",
          user: {
            username: userDoc.username,
            email: userDoc.email,
            userId: userDoc._id.toString()
          }
        });
      } else {
        res.status(401).json({ status: "error", message: "Invalid username/email or password" });
      }
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  /**
   * Fetch User Details (buying history, clothing sizes, electronics specs)
   */
  static async getDetails(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ status: "error", message: "Missing userId parameter" });
      return;
    }

    try {
      const { db, isMock } = await connectToDatabase();

      if (isMock) {
        const userIdStr = String(userId);
        const details = MOCK_USER_DETAILS[userIdStr] || MOCK_USER_DETAILS["acc-1"]; // Fallback to acc-1
        res.json({ status: "success", details });
        return;
      }

      const detailsCol = db!.collection("user_details");
      const detailsDoc = await detailsCol.findOne({ userId });

      if (detailsDoc) {
        res.json({ status: "success", details: detailsDoc });
      } else {
        // If not found, return empty template
        res.json({
          status: "success",
          details: {
            userId,
            username: "User",
            purchaseCount: 0,
            clothingSizeHistory: [],
            electronicsHistory: [],
            createdAt: new Date()
          }
        });
      }
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
}
