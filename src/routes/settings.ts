import { Router } from "express";
import { editSetting, getSettings } from "../controllers/settings";

const router = Router({ mergeParams: true });

router.get("/", getSettings);
router.put("/:settingId", editSetting);

export const settingsRouter = router;
