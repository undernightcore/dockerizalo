import { RequestHandler } from "express";
import { prisma } from "../services/prisma";
import { initBuild } from "../helpers/builds";
import { addSubscriber, removeSubscriber } from "../services/realtime";

export const createBuild: RequestHandler = async (req, res) => {
  const app = await prisma.app.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!app) {
    res.status(404).json({ message: "This app does not exist" });
    return;
  }

  const build = await prisma.build.create({
    data: { manual: true, branch: app.branch, log: "", appId: app.id },
  });

  initBuild(app, build);

  res.status(200).json(build);
};

export const listenBuild: RequestHandler = async (req, res) => {
  const build = await prisma.build.findUnique({
    where: { appId: Number(req.params.id), id: Number(req.params.buildId) },
  });

  if (!build) {
    res.status(404).json({ message: "There is no build with that id" });
    return;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const id = addSubscriber(res, build);
  res.on("close", () => {
    removeSubscriber(id, build);
  });

  res.write(`data: ${JSON.stringify(build)}\n\n`);
};
