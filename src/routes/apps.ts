import { Router } from "express";
import { createApp } from "../controllers/apps";

const router = Router();

router.post("/", createApp);

export const appsRouter = router;
