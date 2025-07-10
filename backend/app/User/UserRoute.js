import express from "express";
const router = express.Router();

import { signupUser, loginUser } from "./UserServices.js";

router.post("/user/signup", signupUser);
router.post("/user/login", loginUser);


export default router;
