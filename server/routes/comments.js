import express from "express";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";
import { validateComment } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/post/:postId", getComments);

// Protected routes
router.post("/post/:postId", protect, validateComment, createComment);
router.put("/:id", protect, validateComment, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, likeComment);

export default router;
