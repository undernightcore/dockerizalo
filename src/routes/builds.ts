import { Router } from "express";
import { cancelBuild, createBuild, listenBuild } from "../controllers/builds";

const router = Router({ mergeParams: true });

router.post("/", createBuild);
router.get("/:buildId/realtime", listenBuild);
router.post("/:buildId/cancel", cancelBuild);

export const buildsRouter = router;
