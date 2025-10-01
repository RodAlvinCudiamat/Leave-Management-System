import Employees from "../controllers/Employees.js";
import express from "express";

const router = express.Router();

router.get("/", Employees.fetchAllEmployees);
router.post("/login", Employees.handleLogin);
router.get("/me", Employees.fetchCurrentEmployee);
router.post("/create", Employees.insertEmployee);
router.get("/:id", Employees.fetchEmployeeById);
router.put("/update/:id", Employees.updateEmployee);
router.delete("/delete/:id", Employees.softDeleteEmployees);
router.post("/logout", Employees.logOut);

export default router;
