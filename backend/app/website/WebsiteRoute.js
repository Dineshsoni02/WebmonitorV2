import express from "express";
const router = express.Router();

import { authenticateUserMiddleware } from "../User/UserMiddleware.js";
import { createWebsite } from "./WebsiteServices.js";

router.post("/website", authenticateUserMiddleware, createWebsite);

export default router;
