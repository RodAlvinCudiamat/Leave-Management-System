import LeaveGrantRequests from "../controllers/LeaveGrantRequests.js";
import express from "express";

const router = express.Router();

router.post("/create", LeaveGrantRequests.insertLeaveGrantRequest);
router.get("/", LeaveGrantRequests.fetchAllLeaveGrantRequests);
router.put("/update/:id", LeaveGrantRequests.updateLeaveGrantRequest);

export default router;