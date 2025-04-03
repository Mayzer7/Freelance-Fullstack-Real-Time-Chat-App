import express from "express";
import { getPosts, createPost, getPostById } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", protectRoute, createPost);

export default router;