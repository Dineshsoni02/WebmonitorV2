import express from "express";
const router = express.Router();

import { authenticateUserMiddleware } from "../User/UserMiddleware.js";
import { optionalVisitorTokenMiddleware } from "../VisitorToken/VisitorTokenMiddleware.js";
import {
  createWebsite,
  deleteWebsite,
  getAllWebsite,
  guestWebsite,
  migrateGuestWebsites,
  getGuestWebsites,
  deleteGuestWebsite,
  recheckWebsite,
} from "./WebsiteServices.js";

// Guest routes (no auth required, but need visitor token)
router.post("/guest", guestWebsite);
router.get("/guest/websites", getGuestWebsites);
router.delete("/guest/website/:id", deleteGuestWebsite);

// Authenticated user routes
router.post("/website", authenticateUserMiddleware, createWebsite);
router.get("/website", authenticateUserMiddleware, getAllWebsite);
router.delete("/website/:id", authenticateUserMiddleware, deleteWebsite);
router.post("/migrate", authenticateUserMiddleware, migrateGuestWebsites);

// Recheck route - works for both guests and authenticated users
router.post("/website/:id/recheck", optionalVisitorTokenMiddleware, recheckWebsite);

export default router;

