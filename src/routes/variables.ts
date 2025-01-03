import { Router } from "express";
import {
  createVariable,
  deleteVariable,
  listVariables,
  updateAllVariables,
  updateVariable,
} from "../controllers/variables";

const router = Router({ mergeParams: true });

router.get("/", listVariables);
router.post("/", createVariable);
router.put("/:variableId", updateVariable);
router.delete("/:variableId", deleteVariable);
router.patch("/", updateAllVariables);

export const variablesRouter = router;
