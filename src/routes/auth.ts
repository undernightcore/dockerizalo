import { Router } from "express";
import { getUser, loginUser, registerUser } from "../controllers/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", getUser);

export const authRouter = router;
