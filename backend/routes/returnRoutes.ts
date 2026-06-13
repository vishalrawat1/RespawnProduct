import { Router } from "express";
import { ReturnController } from "../controller/ReturnController";

const router = Router();

// Analyze return request (Adaptive AI quality scan)
router.post("/analyze", ReturnController.analyze);

// Fetch return request assessments history
router.get("/history", ReturnController.getHistory);

export default router;
