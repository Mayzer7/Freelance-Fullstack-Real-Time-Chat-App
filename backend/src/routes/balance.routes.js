import express from "express";
import { getBalance, updateBalance } from "../controllers/balance.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getBalance);
router.post("/update", protectRoute, updateBalance);

export default router; 