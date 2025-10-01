import LeaveTransactions from "../controllers/LeaveTransactions.js";
import express from "express";

const router = express.Router();

router.get("/", LeaveTransactions.fetchAllLeaveTransaction);
router.get("/leave_record/:id", LeaveTransactions.fetchLeaveRecordById);

export default router;