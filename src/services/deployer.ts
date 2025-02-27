import {
  App,
  BindMount,
  EnvironmentVariable,
  Label,
  Network,
  PortMapping,
} from "@prisma/client";
import { createComposeConfiguration } from "../helpers/docker";
import {
  saveComposeConfiguration,
  startComposeStack,
  stopComposeStack,
} from "./docker";
import { getOrCreateAppDirectory } from "./fs";
import { sendAppEvent } from "./realtime/app";
import { sendDeploymentEvent } from "./realtime/deploy";

type AppId = string;
type Logs = string;
const currentDeployments: Map<AppId, Logs> = new Map();

export async function initDeploy(
  app: App,
  image: string,
  ports: PortMapping[],
  volumes: BindMount[],
  variables: EnvironmentVariable[],
  networks: Network[],
  labels: Label[]
) {
  try {
    addLogsToDeployment(app.id, "[INFO] Deployment has started!\n");

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

    addLogsToDeployment(app.id, "[INFO] Starting compose stack...\n\n");

    await startComposeStack(path, (log) => {
      addLogsToDeployment(app.id, log);
    });
  } finally {
    clearDeploymentLogs(app.id);
    await sendAppEvent(app.id);
  }
}

export function getDeploymentLogs(appId: string) {
  return currentDeployments.get(appId);
}

export function isDeploying(appId: string) {
  return currentDeployments.has(appId);
}

function addLogsToDeployment(appId: string, log: string) {
  currentDeployments.set(appId, (currentDeployments.get(appId) ?? "") + log);
  sendDeploymentEvent(appId);
}

function clearDeploymentLogs(appId: string) {
  currentDeployments.delete(appId);
  sendDeploymentEvent(appId);
}
