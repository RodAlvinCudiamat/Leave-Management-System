import { fetchAllLeaveTypes, fetchLeaveTypeById, updateLeaveType, deleteLeaveType } from "../controllers/leaveTypesController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllLeaveTypes);
router.get("/:id", fetchLeaveTypeById);
router.put("/update/:id", updateLeaveType);
router.delete("/delete/:id", deleteLeaveType);

export default router;