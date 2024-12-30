import { Router } from "express";
import { createApp, listApps } from "../controllers/apps";

const router = Router();

router.get("/", listApps);
router.post("/", createApp);

export const appsRouter = router;
