import { App } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../prisma";
import { getContainerStatus } from "../docker";
import { Response } from "express";

type SessionId = string;
type AppId = string;

const appSubscribers = new Map<AppId, Map<SessionId, Response>>();

export function addAppSubscriber(subscriber: Response, app: App) {
  const appMap =
    appSubscribers.get(app.id) ??
    appSubscribers.set(app.id, new Map()).get(app.id);

  const id = randomUUID();

  appMap?.set(id, subscriber);

  return id;
}

export function removeAppSubscriber(id: string, app: App) {
  appSubscribers.get(app.id)?.delete(id);
}

export async function sendAppEvent(appId: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return;

  const appWithStatus = {
    ...app,
    status: await getContainerStatus(`dockerizalo-${app.id}`),
  };

  const subscribers = [...(appSubscribers.get(app.id)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(appWithStatus)}\n\n`);
  }
}
