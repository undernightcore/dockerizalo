import { App } from "@prisma/client";

import { randomUUID } from "node:crypto";
import { Response } from "express";
import { getDeploymentLogs } from "../deployer";

type SessionId = string;
type AppId = string;

const deploymentSubscribers = new Map<AppId, Map<SessionId, Response>>();

export function addDeploymentSubscriber(subscriber: Response, app: App) {
  const deploymentApp =
    deploymentSubscribers.get(app.id) ??
    deploymentSubscribers.set(app.id, new Map()).get(app.id);

  const id = randomUUID();

  deploymentApp?.set(id, subscriber);

  return id;
}

export function removeDeploymentSubscriber(id: string, app: App) {
  deploymentSubscribers.get(app.id)?.delete(id);
}

export async function sendDeploymentEvent(appId: string) {
  const deployment = getDeploymentLogs(appId) ?? null;

  const subscribers = [...(deploymentSubscribers.get(appId)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(deployment)}\n\n`);
  }
}
