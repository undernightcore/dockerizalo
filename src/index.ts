import express, { json } from "express";
import { appsRouter } from "./routes/apps";
import { buildsRouter } from "./routes/builds";
import { configDotenv } from "dotenv";
import { variablesRouter } from "./routes/variables";
import { mountsRouter } from "./routes/mounts";
import { portsRouter } from "./routes/ports";
import { notFoundErrorHandler } from "./handlers/route";
import { zodErrorHandler } from "./handlers/zod";
import { defaultErrorHandler } from "./handlers/default";
import { authErrorHandler } from "./handlers/auth";
import { authRouter } from "./routes/auth";
import cors from "cors";
import { tokensRouter } from "./routes/tokens";
import { networksRouter } from "./routes/networks";

configDotenv();

const app = express();
app.use(json());
app.use(cors());

app.use("/apps/:appId/ports", portsRouter);
app.use("/apps/:appId/mounts", mountsRouter);
app.use("/apps/:appId/variables", variablesRouter);
app.use("/apps/:appId/builds", buildsRouter);
app.use("/apps/:appId/networks", networksRouter);
app.use("/tokens", tokensRouter);
app.use("/apps", appsRouter);
app.use("/auth", authRouter);

app.use(notFoundErrorHandler);
app.use(zodErrorHandler);
app.use(authErrorHandler);
app.use(defaultErrorHandler);

app.listen(8080, () => console.info("Dockerizalo has started!"));
