import { RequestHandler } from "express";
import { prisma } from "../services/prisma";
import {
  addBuildSubscriber,
  removeBuildSubscriber,
} from "../services/realtime";
import { abortBuild, initBuild } from "../services/builder";
import { initDeploy } from "../services/deployer";

export const createBuild: RequestHandler = async (req, res) => {
  const app = await prisma.app.findUnique({
    where: { id: req.params.id },
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

  initBuild(app, build, variables)
    .then(() => initDeploy(app, build, ports, volumes, variables))
    .catch();

  res.status(200).json(build);
};

export const listenBuild: RequestHandler = async (req, res) => {
  const build = await prisma.build.findUnique({
    where: { appId: req.params.id, id: req.params.buildId },
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
  const build = await prisma.build.findUnique({
    where: { appId: req.params.id, id: req.params.buildId },
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
