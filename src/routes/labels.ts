import { Router } from "express";
import {
  createLabel,
  deleteLabel,
  listLabels,
  updateAllLabels,
  updateLabel,
} from "../controllers/labels";

const router = Router({ mergeParams: true });

router.get("/", listLabels);
router.post("/", createLabel);
router.put("/:labelId", updateLabel);
router.delete("/:labelId", deleteLabel);
router.patch("/", updateAllLabels);

export const labelsRouter = router;
