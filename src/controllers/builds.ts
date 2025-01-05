import { RequestHandler } from "express";
import { prisma } from "../services/prisma";
import {
  addBuildSubscriber,
  removeBuildSubscriber,
  sendAppEvent,
} from "../services/realtime";
import { abortBuild, initBuild } from "../services/builder";
import { initDeploy } from "../services/deployer";
import { getContainerStatus } from "../services/docker";
import { authenticateUser } from "../services/auth";

export const createBuild: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });
  if (!app) {
    res.status(404).json({ message: "This app does not exist" });
    return;
  }

  const build = await prisma.build.create({
    data: { manual: true, branch: app.branch, log: "", appId: app.id },
  });

  const variables = await prisma.environmentVariable.findMany({
    where: { appId: app.id },
  });

  const ports = await prisma.portMapping.findMany({
    where: { appId: app.id },
  });

  const volumes = await prisma.bindMount.findMany({
    where: { appId: app.id },
  });

  res.status(201).json(build);

  await initBuild(app, build, variables);
  await initDeploy(app, build, ports, volumes, variables);

  const latestApp = await prisma.app.findUnique({ where: { id: app.id } });
  if (!latestApp) return;

  sendAppEvent({
    ...latestApp,
    status: await getContainerStatus(`dockerizalo-${app.id}`),
  });
};

export const listenBuild: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const build = await prisma.build.findUnique({
    where: { appId: req.params.appId, id: req.params.buildId },
  });

  if (!build) {
    res.status(404).json({ message: "There is no build with that id" });
    return;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const id = addBuildSubscriber(res, build);
  res.on("close", () => {
    removeBuildSubscriber(id, build);
  });

  res.write(`data: ${JSON.stringify(build)}\n\n`);
};

export const cancelBuild: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const build = await prisma.build.findUnique({
    where: { appId: req.params.appId, id: req.params.buildId },
  });

  if (!build) {
    res.status(404).json({ message: "There is no build with that id" });
    return;
  }

  if (build.status !== "BUILDING") {
    res.status(400).json({ message: "This build has already finished!" });
    return;
  }

  abortBuild(build);

  res.status(200).json({ message: "The build has been aborted..." });
};
