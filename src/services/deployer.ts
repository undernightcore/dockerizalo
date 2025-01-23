import {
  App,
  BindMount,
  Build,
  EnvironmentVariable,
  PortMapping,
} from "@prisma/client";
import { createComposeConfiguration } from "../helpers/docker";
import { getOrCreateAppDirectory } from "./fs";
import {
  saveComposeConfiguration,
  startComposeStack,
  stopComposeStack,
} from "./docker";
import { sendAppEvent } from "./realtime";

export async function initDeploy(
  app: App,
  build: Build,
  ports: PortMapping[],
  volumes: BindMount[],
  variables: EnvironmentVariable[]
) {
  const path = await getOrCreateAppDirectory(app);
  await stopComposeStack(path);

  await sendAppEvent(app.id);

  const composeFile = createComposeConfiguration(
    build,
    ports,
    volumes,
    variables
  );
  await saveComposeConfiguration(composeFile, path);
  await startComposeStack(path);

  await sendAppEvent(app.id);
}
