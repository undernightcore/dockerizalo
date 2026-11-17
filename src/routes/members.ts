import { Router } from "express";
import {
  createMember,
  deleteMember,
  listMembers,
  updateMember,
} from "../controllers/members";

const router = Router({ mergeParams: true });

router.get("/", listMembers);
router.post("/", createMember);
router.put("/:memberId", updateMember);
router.delete("/:memberId", deleteMember);

export const membersRouter = router;
