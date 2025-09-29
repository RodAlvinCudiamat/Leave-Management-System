import { fetchLeaveApplicationDays, fetchAllLeaveApplicationsDays, updateApplicationDayStatus } from "../controllers/leaveApplicationDaysController.js";
import express from "express";

const router = express.Router(); 

router.get("/", fetchAllLeaveApplicationsDays);
router.put("/update/:application_id", updateApplicationDayStatus);
router.get("/:application_id/days", fetchLeaveApplicationDays); 

export default router;