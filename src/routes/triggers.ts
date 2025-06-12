import { Router } from "express";
import {
  createTrigger,
  deleteTrigger,
  editTrigger,
  listTriggers,
  runTrigger,
} from "../controllers/triggers";

const router = Router({ mergeParams: true });

router.get("/", listTriggers);
router.post("/:triggerId", createTrigger);
router.put("/:triggerId", editTrigger);
router.delete("/:triggerId", deleteTrigger);
router.post("/:triggerId/webhook", runTrigger);

export const triggersRouter = router;
