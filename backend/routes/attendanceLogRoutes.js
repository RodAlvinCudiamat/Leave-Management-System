import AttendanceLogs from "../controllers/AttendanceLogs.js";
import express from "express";

const router = express.Router();

router.post("/time-in", AttendanceLogs.handleTimeIn);
router.post("/time-out", AttendanceLogs.handleTimeOut);
router.get("/attendance/status/me", AttendanceLogs.fetchTodayAttendanceStatus);
router.get("/:year/:month", AttendanceLogs.fetchAttendanceByMonth);

export default router;