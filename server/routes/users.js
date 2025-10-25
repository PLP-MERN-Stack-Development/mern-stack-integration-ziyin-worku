import express from "express";
import { getUsers, getUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getUsers);
router.get("/:id", getUser);

export default router;
