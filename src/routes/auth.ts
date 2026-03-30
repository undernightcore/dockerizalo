import { Router } from "express";
import {
  editUser,
  getUser,
  getUsers,
  loginUser,
  registerUser,
  removeUser,
} from "../controllers/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/user", getUser);
router.get("/users", getUsers);
router.put("/user/:userId", editUser);
router.delete("/user/:userId", removeUser);

export const authRouter = router;
