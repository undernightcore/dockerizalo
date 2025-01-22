import { App, Build } from "@prisma/client";
import { Response } from "express";
import { randomUUID } from "node:crypto";

type SessionId = string;

type BuildId = string;
const buildSubscribers = new Map<BuildId, Map<SessionId, Response>>();

type AppId = string;
const appSubscribers = new Map<AppId, Map<SessionId, Response>>();

const buildsSubscribers = new Map<SessionId, Response>();

export function addBuildSubscriber(subscriber: Response, build: Build) {
  const buildMap =
    buildSubscribers.get(build.id) ??
    buildSubscribers.set(build.id, new Map()).get(build.id);

  const id = randomUUID();

  buildMap?.set(id, subscriber);

  return id;
}

export function addAppSubscriber(subscriber: Response, app: App) {
  const appMap =
    appSubscribers.get(app.id) ??
    appSubscribers.set(app.id, new Map()).get(app.id);

  const id = randomUUID();

  appMap?.set(id, subscriber);

  return id;
}

export function addBuildsSubscriber(subscriber: Response) {
  const id = randomUUID();

  buildsSubscribers?.set(id, subscriber);

  return id;
}

export function removeBuildSubscriber(id: string, build: Build) {
  buildSubscribers.get(build.id)?.delete(id);
}

export function removeAppSubscriber(id: string, app: App) {
  appSubscribers.get(app.id)?.delete(id);
}

export function removeBuildsSubscriber(id: string) {
  buildsSubscribers.delete(id);
}

export function sendBuildEvent(build: Build) {
  const subscribers = [...(buildSubscribers.get(build.id)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(build)}\n\n`);
  }
}

export function sendAppEvent(app: App & { status: string }) {
  const subscribers = [...(appSubscribers.get(app.id)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(app)}\n\n`);
  }
}

export function sendBuildsEvent(
  builds: Omit<Build, "log" | "updatedAt" | "appId">[]
) {
  const subscribers = [...(buildsSubscribers.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(builds)}\n\n`);
  }
}
