import { fetchEmployeeLeaveBalance, fetchMyLeaveBalance, fetchUngrantedLeaveTypes } from "../controllers/employeeLeaveBalancesController.js";
import express from "express";

const router = express.Router();

router.get("/balance/me", fetchMyLeaveBalance);
router.get("/balance/ungranted/:employee_id/:year", fetchUngrantedLeaveTypes);;
router.get("/balance/:employee_id", fetchEmployeeLeaveBalance);

export default router;