import { fetchAllLeaveTypeTimeUnits } from "../controllers/leaveTypeTimeUnitsController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllLeaveTypeTimeUnits);

export default router;
