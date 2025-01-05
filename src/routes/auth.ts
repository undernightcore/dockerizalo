import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export const authRouter = router;
