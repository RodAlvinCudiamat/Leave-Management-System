import Roles from "../controllers/Roles.js";
import express from "express";

const router = express.Router();

router.get("/", Roles.fetchAllRoles);

export default router;