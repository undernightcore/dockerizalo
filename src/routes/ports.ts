import { Router } from "express";
import {
  createPort,
  deletePort,
  listPorts,
  updateAllPorts,
  updatePort,
} from "../controllers/ports";

const router = Router({ mergeParams: true });

router.get("/", listPorts);
router.post("/", createPort);
router.put("/:portId", updatePort);
router.delete("/:portId", deletePort);
router.patch("/", updateAllPorts);

export const portsRouter = router;
