import express from "express";
const router = express.Router();

import { authenticateUserMiddleware } from "../User/UserMiddleware.js";
import { createWebsite, deleteWebsite } from "./WebsiteServices.js";

router.post("/website", authenticateUserMiddleware, createWebsite);
router.delete("/website/:id", authenticateUserMiddleware, deleteWebsite);

export default router;
