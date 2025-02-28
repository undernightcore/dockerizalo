import { Router } from "express";
import { listTemplates } from "../controllers/templates";

const router = Router();

router.get("/", listTemplates);

export const templatesRouter = router;
