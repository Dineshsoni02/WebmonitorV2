import express from "express";
const router = express.Router();

import {
  createVisitorToken,
  validateVisitorToken,
  getVisitorTokenStats,
} from "./VisitorTokenServices.js";

// Create a new visitor token
router.post("/visitor/token", createVisitorToken);

// Validate a visitor token
router.get("/visitor/token/:token", validateVisitorToken);

// Get statistics for a visitor token
router.get("/visitor/token/:token/stats", getVisitorTokenStats);

export default router;
