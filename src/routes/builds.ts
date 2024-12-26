import { Router } from "express";
import { createBuild, listenBuild } from "../controllers/builds";

const router = Router({ mergeParams: true });

router.post("/", createBuild);
router.get("/:buildId/realtime", listenBuild);

export const buildsRouter = router;
