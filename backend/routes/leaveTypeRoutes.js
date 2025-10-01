import LeaveTypes from "../controllers/LeaveTypes.js";
import express from "express";

const router = express.Router();

router.get("/", LeaveTypes.fetchAllLeaveTypes);
router.get("/:id", LeaveTypes.fetchLeaveTypeById);
router.put("/update/:id", LeaveTypes.updateLeaveType);
router.delete("/delete/:id", LeaveTypes.deleteLeaveType);

export default router;