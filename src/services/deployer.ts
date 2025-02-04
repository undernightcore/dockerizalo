import {
  App,
  BindMount,
  Build,
  EnvironmentVariable,
  Network,
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
  variables: EnvironmentVariable[],
  networks: Network[]
) {
  const path = await getOrCreateAppDirectory(app);
  await stopComposeStack(path);

  await sendAppEvent(app.id);

  const composeFile = createComposeConfiguration(
    build,
    ports,
    volumes,
    variables,
    networks
  );
  await saveComposeConfiguration(composeFile, path);
  await startComposeStack(path);

  await sendAppEvent(app.id);
}
