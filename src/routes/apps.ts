import { Router } from "express";
import {
  createApp,
  listApps,
  listenApp,
  listenAppLogs,
  startApp,
  stopApp,
} from "../controllers/apps";

const router = Router();

router.get("/", listApps);
router.get("/:appId/realtime", listenApp);
router.get("/:appId/logs/realtime", listenAppLogs);
router.post("/", createApp);
router.post("/:appId/start", startApp);
router.post("/:appId/stop", stopApp);

export const appsRouter = router;
