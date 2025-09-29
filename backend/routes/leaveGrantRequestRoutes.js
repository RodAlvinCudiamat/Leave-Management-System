import { insertLeaveGrantRequest, fetchAllLeaveGrantRequests, updateLeaveGrantRequest } from "../controllers/leaveGrantRequestsController.js";
import express from "express";

const router = express.Router();

router.post("/create", insertLeaveGrantRequest);
router.get("/", fetchAllLeaveGrantRequests);
router.put("/update/:id", updateLeaveGrantRequest);

export default router;