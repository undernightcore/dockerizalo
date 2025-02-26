import { Build } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../prisma";
import { Response } from "express";

type SessionId = string;
type BuildId = string;

const buildSubscribers = new Map<BuildId, Map<SessionId, Response>>();

export function addBuildSubscriber(subscriber: Response, build: Build) {
  const buildMap =
    buildSubscribers.get(build.id) ??
    buildSubscribers.set(build.id, new Map()).get(build.id);

  const id = randomUUID();

  buildMap?.set(id, subscriber);

  return id;
}

export function removeBuildSubscriber(id: string, build: Build) {
  buildSubscribers.get(build.id)?.delete(id);
}

export async function sendBuildEvent(buildId: string) {
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) return;

  const subscribers = [...(buildSubscribers.get(build.id)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(build)}\n\n`);
  }
}
