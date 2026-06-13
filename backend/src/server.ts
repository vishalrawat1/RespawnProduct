import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectToDatabase } from "./db";
import userRoutes from "../routes/userRoutes";
import returnRoutes from "../routes/returnRoutes";

// Load configuration
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes API Mapping
app.use("/api/users", userRoutes);
app.use("/api/returns", returnRoutes);

// Base status route
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Boot up server
async function startServer() {
  console.log("Initializing database connection...");
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`===============================================`);
    console.log(`🚀 RESPawn AI Returns Backend running on Port ${port}`);
    console.log(`===============================================`);
  });
}

startServer().catch((error) => {
  console.error("Critical server boot error:", error);
  process.exit(1);
});
