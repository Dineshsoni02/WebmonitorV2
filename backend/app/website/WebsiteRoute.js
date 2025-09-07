import express from "express";
const router = express.Router();

import { authenticateUserMiddleware } from "../User/UserMiddleware.js";
import {
  createWebsite,
  deleteWebsite,
  getAllWebsite,
  guestWebsite,
  migrateGuestWebsites,
} from "./WebsiteServices.js";

router.post("/guest", guestWebsite);
router.post("/website", authenticateUserMiddleware, createWebsite);
router.get("/website", authenticateUserMiddleware, getAllWebsite);
router.delete("/website/:id", authenticateUserMiddleware, deleteWebsite);
router.post("/migrate", authenticateUserMiddleware, migrateGuestWebsites);

export default router;
