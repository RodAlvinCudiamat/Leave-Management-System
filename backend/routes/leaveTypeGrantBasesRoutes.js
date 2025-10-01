import LeaveTypeGrantBases from "../controllers/LeaveTypeGrantBases.js";
import express from "express";

const router = express.Router();
router.get("/", LeaveTypeGrantBases.fetchAllLeaveTypeGrantBasis);

export default router;