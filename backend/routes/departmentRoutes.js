import Departments from "../controllers/Departments.js";
import express from "express";

const router = express.Router();

router.get("/", Departments.fetchAllDepartments);

export default router;