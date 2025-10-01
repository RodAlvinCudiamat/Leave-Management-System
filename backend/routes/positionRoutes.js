import Positions from "../controllers/Positions.js";
import express from "express";

const router = express.Router();

router.get("/", Positions.fetchAllPositions);

export default router;