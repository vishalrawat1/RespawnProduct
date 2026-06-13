import { Router } from "express";
import { UserController } from "../controller/UserController";

const router = Router();

// Registration route
router.post("/register", UserController.register);

// Login route (checks plain passwords)
router.post("/login", UserController.login);

// Fetch detailed user profile (sizing & electronics history)
router.get("/details/:userId", UserController.getDetails);

export default router;
