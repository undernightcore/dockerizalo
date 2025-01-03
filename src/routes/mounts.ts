import { Router } from "express";
import {
  createMount,
  deleteMount,
  listMounts,
  updateAllMounts,
  updateMount,
} from "../controllers/mounts";

const router = Router({ mergeParams: true });

router.get("/", listMounts);
router.post("/", createMount);
router.put("/:mountId", updateMount);
router.delete("/:mountId", deleteMount);
router.patch("/", updateAllMounts);

export const mountsRouter = router;
