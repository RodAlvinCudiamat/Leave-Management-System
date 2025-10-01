import LeaveTypeTimeUnits from "../controllers/LeaveTypeTimeUnits.js";
import express from "express";

const router = express.Router();

router.get("/", LeaveTypeTimeUnits.fetchAllLeaveTypeTimeUnits);

export default router;
