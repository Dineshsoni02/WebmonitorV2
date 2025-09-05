import express from "express";
const router = express.Router();

import { signupUser, loginUser } from "./UserServices.js";
import { generateNewAccessToken } from "../utils/token.js";


router.post("/user/signup", signupUser);
router.post("/user/login", loginUser);
router.post("/user/refresh-token", generateNewAccessToken);

export default router;
