import { fetchAllPositions } from "../controllers/positionsController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllPositions);

export default router;