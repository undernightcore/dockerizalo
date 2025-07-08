import cors from "cors";
import { configDotenv } from "dotenv";
import express, { json } from "express";
import { authErrorHandler } from "./handlers/auth";
import { defaultErrorHandler } from "./handlers/default";
import { notFoundErrorHandler } from "./handlers/route";
import { zodErrorHandler } from "./handlers/zod";
import { appsRouter } from "./routes/apps";
import { authRouter } from "./routes/auth";
import { buildsRouter } from "./routes/builds";
import { labelsRouter } from "./routes/labels";
import { mountsRouter } from "./routes/mounts";
import { networksRouter } from "./routes/networks";
import { portsRouter } from "./routes/ports";
import { settingsRouter } from "./routes/settings";
import { templatesRouter } from "./routes/templates";
import { tokensRouter } from "./routes/tokens";
import { triggersRouter } from "./routes/triggers";
import { variablesRouter } from "./routes/variables";

configDotenv();

const app = express();
app.use(json());
app.use(cors());

app.use("/apps/:appId/ports", portsRouter);
app.use("/apps/:appId/mounts", mountsRouter);
app.use("/apps/:appId/variables", variablesRouter);
app.use("/apps/:appId/builds", buildsRouter);
app.use("/apps/:appId/networks", networksRouter);
app.use("/apps/:appId/labels", labelsRouter);
app.use("/apps/:appId/triggers", triggersRouter);
app.use("/tokens", tokensRouter);
app.use("/settings", settingsRouter);
app.use("/apps", appsRouter);
app.use("/templates", templatesRouter);
app.use("/auth", authRouter);

app.use(notFoundErrorHandler);
app.use(zodErrorHandler);
app.use(authErrorHandler);
app.use(defaultErrorHandler);

app.listen(8080, () => console.info("Dockerizalo has started!"));
