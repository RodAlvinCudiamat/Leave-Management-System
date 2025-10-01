import LeaveApplicationDays from "../controllers/LeaveApplicationDays.js";
import express from "express";

const router = express.Router(); 

router.get("/", LeaveApplicationDays.fetchLeaveApplicationDays);
router.put("/update/:application_id", LeaveApplicationDays.updateApplicationDayStatus);
router.get("/:application_id/days", LeaveApplicationDays.fetchLeaveApplicationDays); 

export default router;