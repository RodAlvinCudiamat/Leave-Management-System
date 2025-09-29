import { fetchAllLeaveRecords, fetchLeaveRecordById } from "../controllers/leaveTransactionsController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllLeaveRecords);
router.get("/leave_record/:id", fetchLeaveRecordById);

export default router;