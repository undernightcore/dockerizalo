import { Response } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../prisma";

type SessionId = string;
type AppId = string;

const appBuildsSubscribers = new Map<AppId, Map<SessionId, Response>>();

export function addAppBuildsSubscriber(appId: string, subscriber: Response) {
  const buildsMap =
    appBuildsSubscribers.get(appId) ??
    appBuildsSubscribers.set(appId, new Map()).get(appId);

  const id = randomUUID();

  buildsMap?.set(id, subscriber);

  return id;
}

export function removeAppBuildsSubscriber(appId: string, id: string) {
  appBuildsSubscribers.get(appId)?.delete(id);
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
