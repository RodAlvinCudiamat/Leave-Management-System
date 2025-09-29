import { fetchAllLogExceptions } from "../controllers/attendanceLogExceptionsController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllLogExceptions);

export default router;