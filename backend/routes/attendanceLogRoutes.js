import { handleTimeIn, handleTimeOut, fetchAttendanceByMonth, fetchTodayAttendanceStatus} from "../controllers/attendanceLogsController.js";
import express from "express";

const router = express.Router();

router.post("/time-in", handleTimeIn);
router.post("/time-out", handleTimeOut);
router.get("/attendance/status/me", fetchTodayAttendanceStatus);
router.get("/:year/:month", fetchAttendanceByMonth);

export default router;