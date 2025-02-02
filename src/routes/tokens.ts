import { Router } from "express";
import {
  createToken,
  deleteToken,
  listTokens,
  updateToken,
} from "../controllers/tokens";

const router = Router();

router.get("/", listTokens);
router.post("/", createToken);
router.put("/:tokenId", updateToken);
router.delete("/:tokenId", deleteToken);

export const tokensRouter = router;
