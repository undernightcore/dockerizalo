import {
  App,
  BindMount,
  Build,
  EnvironmentVariable,
  Label,
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
  image: string,
  ports: PortMapping[],
  volumes: BindMount[],
  variables: EnvironmentVariable[],
  networks: Network[],
  labels: Label[]
) {
  const path = await getOrCreateAppDirectory(app);
  await stopComposeStack(path);

  await sendAppEvent(app.id);

  const composeFile = createComposeConfiguration(
    app,
    image,
    ports,
    volumes,
    variables,
    networks,
    labels
  );
  await saveComposeConfiguration(composeFile, path);
  await startComposeStack(path);

  await sendAppEvent(app.id);
}
