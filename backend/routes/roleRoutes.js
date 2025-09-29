import { fetchAllRoles } from "../controllers/rolesController.js";
import express from "express";

const router = express.Router();

router.get("/", fetchAllRoles);

export default router;