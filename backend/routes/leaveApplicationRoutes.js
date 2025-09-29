import { insertLeaveApplication, fetchLeaveApplicationById, fetchLeaveApplicationByEmployeeId, updateLeaveApplication, fetchAllLeaveApplications} from "../controllers/leaveApplicationsController.js";
import express from "express";

const router = express.Router();

router.get("/applications", fetchAllLeaveApplications);
router.put("/application/update/:id", updateLeaveApplication);
router.get("/application/:id", fetchLeaveApplicationById);
router.get("/application/employee/:employee_id", fetchLeaveApplicationByEmployeeId);
router.post("/application/create", insertLeaveApplication);

export default router;