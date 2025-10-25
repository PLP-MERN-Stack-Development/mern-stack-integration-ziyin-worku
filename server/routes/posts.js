import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getUserPosts,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
import { validatePost } from "../middleware/validation.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/user/:userId", getUserPosts);

// Protected routes
router.post(
  "/",
  protect,
  upload.single("featuredImage"),
  validatePost,
  createPost
);
router.put(
  "/:id",
  protect,
  upload.single("featuredImage"),
  validatePost,
  updatePost
);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);

export default router;
