import express, { json } from "express";
import { appsRouter } from "./routes/apps";
import { buildsRouter } from "./routes/builds";
import { configDotenv } from "dotenv";
import { variablesRouter } from "./routes/variables";

configDotenv();

const app = express();
app.use(json());

app.use("/apps/:appId/variables", variablesRouter);
app.use("/apps/:appId/builds", buildsRouter);
app.use("/apps", appsRouter);

app.listen(8080, () => console.info("Dockerizalo has started!"));
