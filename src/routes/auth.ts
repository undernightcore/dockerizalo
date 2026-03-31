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

router.get("/me", getUser);
router.get("/users", getUsers);
router.put("/users/:userId", editUser);
router.delete("/users/:userId", removeUser);

export const authRouter = router;
