import { fetchAllDepartments } from "../controllers/departmentsController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllDepartments);

export default router;