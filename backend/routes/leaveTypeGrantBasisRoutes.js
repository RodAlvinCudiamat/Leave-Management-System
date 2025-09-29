import { fetchAllLeaveTypeGrantBasis } from "../controllers/leaveTypeGrantBasisController.js";
import express from "express";

const router = express.Router();
router.get("/", fetchAllLeaveTypeGrantBasis);

export default router;