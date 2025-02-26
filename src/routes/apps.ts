import { Router } from "express";
import {
  createApp,
  deleteApp,
  listApps,
  listenApp,
  listenAppDeploymentLogs,
  listenAppLogs,
  startApp,
  stopApp,
  updateApp,
} from "../controllers/apps";

const router = Router();

router.get("/", listApps);
router.get("/:appId/realtime", listenApp);
router.get("/:appId/logs/realtime", listenAppLogs);
router.get("/:appId/deployment/logs/realtime", listenAppDeploymentLogs);
router.post("/", createApp);
router.put("/:appId", updateApp);
router.delete("/:appId", deleteApp);
router.post("/:appId/start", startApp);
router.post("/:appId/stop", stopApp);

export const appsRouter = router;
