import { App, Build } from "@prisma/client";
import { Response } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { getContainerStatus } from "./docker";

type SessionId = string;

type BuildId = string;
const buildSubscribers = new Map<BuildId, Map<SessionId, Response>>();

type AppId = string;
const appSubscribers = new Map<AppId, Map<SessionId, Response>>();

const appBuildsSubscribers = new Map<AppId, Map<SessionId, Response>>();

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

export function addAppBuildsSubscriber(appId: string, subscriber: Response) {
  const buildsMap =
    appBuildsSubscribers.get(appId) ??
    appBuildsSubscribers.set(appId, new Map()).get(appId);

  const id = randomUUID();

  buildsMap?.set(id, subscriber);

  return id;
}

export function removeBuildSubscriber(id: string, build: Build) {
  buildSubscribers.get(build.id)?.delete(id);
}

export function removeAppSubscriber(id: string, app: App) {
  appSubscribers.get(app.id)?.delete(id);
}

export function removeAppBuildsSubscriber(appId: string, id: string) {
  appBuildsSubscribers.get(appId)?.delete(id);
}

export async function sendBuildEvent(buildId: string) {
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) return;

  const subscribers = [...(buildSubscribers.get(build.id)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(build)}\n\n`);
  }
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

export async function sendAppBuildsEvent(appId: string) {
  const builds = await prisma.build.findMany({
    select: {
      id: true,
      branch: true,
      manual: true,
      status: true,
      createdAt: true,
      finishedAt: true,
    },
    where: { appId },
    take: 100,
    orderBy: { updatedAt: "desc" },
  });

  const subscribers = [...(appBuildsSubscribers.get(appId)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(builds)}\n\n`);
  }
}
