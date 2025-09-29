import { fetchAllEmployees, handleLogin, insertEmployee, softDeleteEmployees, updateEmployee, logOut, fetchEmployeeById, fetchCurrentEmployee } from "../controllers/employeesController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllEmployees);
router.post("/login", handleLogin);
router.get("/me", fetchCurrentEmployee);
router.post("/create", insertEmployee);
router.get("/:id", fetchEmployeeById);
router.put("/update/:id", updateEmployee);
router.delete("/delete/:id", softDeleteEmployees);
router.post("/logout", logOut);

export default router;
