import AttendanceLogExceptions from "../controllers/AttendanceLogExceptions.js";
import express from "express";

const router = express.Router();

router.get("/", AttendanceLogExceptions.fetchAllLogExceptions);

export default router;