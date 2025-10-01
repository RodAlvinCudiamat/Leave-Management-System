import LeaveApplications from "../controllers/LeaveApplications.js";
import express from "express";

const router = express.Router();

router.get("/applications/employees", LeaveApplications.fetchAllLeaveApplications);
router.get("/applications/employee/:employee_id", LeaveApplications.fetchAllLeaveApplications);
router.put("/application/update/:id", LeaveApplications.updateLeaveApplication);
router.get("/application/:id", LeaveApplications.fetchLeaveApplicationById);
router.post("/application/create", LeaveApplications.insertLeaveApplication);

export default router;