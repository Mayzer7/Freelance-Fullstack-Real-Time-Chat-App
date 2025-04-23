import express from "express";
import { checkAuth, login, logout, signup, updateProfile, getUserByUsername, getUserById } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, upload.single("profilePic"), updateProfile);

router.get("/check", protectRoute, checkAuth);
router.get("/user/:username", getUserByUsername);
router.get("/user/id/:id", getUserById);

export default router;
