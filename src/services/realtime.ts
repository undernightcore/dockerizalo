import { Build } from "@prisma/client";
import { Response } from "express";
import { randomUUID } from "node:crypto";

export type BuildId = number;
export type SessionId = string;

const buildSubscribers = new Map<BuildId, Map<SessionId, Response>>();

export function addSubscriber(subscriber: Response, build: Build) {
  const buildMap =
    buildSubscribers.get(build.id) ??
    buildSubscribers.set(build.id, new Map()).get(build.id);

  const id = randomUUID();

  buildMap?.set(id, subscriber);

  return id;
}

export function removeSubscriber(id: string, build: Build) {
  buildSubscribers.get(build.id)?.delete(id);
}

export function sendBuildEvent(build: Build) {
  const subscribers = [...(buildSubscribers.get(build.id)?.values() ?? [])];

  for (const subscriber of subscribers) {
    subscriber.write(`data: ${JSON.stringify(build)}\n\n`);
  }
}
