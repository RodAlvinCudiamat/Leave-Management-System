import EmployeeLeaveBalances from "../controllers/EmployeeLeaveBalances.js";
import express from "express";

const router = express.Router();

router.get("/balance/me", EmployeeLeaveBalances.fetchMyLeaveBalance);
router.get("/balance/ungranted/:employee_id/:year", EmployeeLeaveBalances.fetchUngrantedLeaveTypes);;
router.get("/balance/:employee_id", EmployeeLeaveBalances.fetchEmployeeLeaveBalance);

export default router;