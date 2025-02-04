import { Router } from "express";
import {
  createNetwork,
  deleteNetwork,
  listNetworks,
  updateAllNetworks,
  updateNetwork,
} from "../controllers/networks";

const router = Router({ mergeParams: true });

router.get("/", listNetworks);
router.post("/", createNetwork);
router.delete("/:networkId", deleteNetwork);
router.put("/:networkId", updateNetwork);
router.patch("/", updateAllNetworks);

export const networksRouter = router;
