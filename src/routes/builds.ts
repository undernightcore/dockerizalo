import { Router } from "express";
import {
  cancelBuild,
  createBuild,
  listenBuild,
  listenBuilds,
} from "../controllers/builds";

const router = Router({ mergeParams: true });

router.get("/realtime", listenBuilds);
router.post("/", createBuild);
router.get("/:buildId/realtime", listenBuild);
router.post("/:buildId/cancel", cancelBuild);

export const buildsRouter = router;
