import { RequestHandler } from "express";
import { createAppValidator } from "../validators/create-app";
import { prisma } from "../services/prisma";
import {
  getAllContainersStatus,
  getComposeConfiguration,
  getComposeImage,
  getContainerLogs,
  getContainerStatus,
  isImageAvailable,
  startComposeStack,
  stopComposeStack,
} from "../services/docker";
import {
  addAppSubscriber,
  removeAppSubscriber,
  sendAppEvent,
} from "../services/realtime";
import { getAppDirectory, getOrCreateAppDirectory } from "../services/fs";
import { createBuild } from "./builds";
import { authenticateUser } from "../services/auth";

export const listApps: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const apps = await prisma.app.findMany();
  const containers = await getAllContainersStatus();

  const status = apps.map((app) => ({
    ...app,
    status: containers.get(`/dockerizalo-${app.id}`)?.status ?? "exited",
  }));

  res.status(200).json(status);
};

export const listenApp: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });

  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const id = addAppSubscriber(res, app);
  res.on("close", () => {
    removeAppSubscriber(id, app);
  });

  res.write(
    `data: ${JSON.stringify({
      ...app,
      status: await getContainerStatus(`dockerizalo-${app.id}`),
    })}\n\n`
  );
};

export const createApp: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createAppValidator.parse(req.body);

  const exists = await prisma.app.findUnique({ where: { name: data.name } });
  if (exists) {
    res.status(400).json({ message: "An app with that name already exists" });
    return;
  }

  const app = await prisma.app.create({ data });
  res.status(201).json(app);
};

export const updateApp: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createAppValidator.parse(req.body);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });
  if (!app) {
    res.status(404).json({ message: "An app with that id does not exist" });
    return;
  }

  const conflicting = await prisma.app.findUnique({
    where: { name: data.name, NOT: { id: app.id } },
  });
  if (conflicting) {
    res.status(400).json({ message: "An app with that name already exists" });
    return;
  }

  const updated = await prisma.app.update({
    data,
    where: { id: app.id },
  });
  res.status(200).json(updated);
};

export const startApp: RequestHandler = async (req, res, next) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });

  if (!app) {
    res.status(404).json({ message: "An app with that id does not exist" });
    return;
  }

  const status = await getContainerStatus(`dockerizalo-${req.params.appId}`);
  if (status === "running") {
    res.status(400).json({ message: "The app is already running" });
    return;
  }

  const directory = await getAppDirectory(app);
  if (!directory) {
    await createBuild(req, res, next);
    return;
  }

  const compose = await getComposeConfiguration(directory);
  if (!compose) {
    await createBuild(req, res, next);
    return;
  }

  const image = getComposeImage(compose);
  if (!image) {
    await createBuild(req, res, next);
    return;
  }

  const available = await isImageAvailable(image);
  if (!available) {
    await createBuild(req, res, next);
    return;
  }

  await startComposeStack(directory);

  const updatedApp = await prisma.app.findUniqueOrThrow({
    where: { id: req.params.appId },
  });

  sendAppEvent({
    ...updatedApp,
    status: await getContainerStatus(`dockerizalo-${req.params.appId}`),
  });

  res.status(200).json({ message: "App is now running" });
};

export const stopApp: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });

  if (!app) {
    res.status(404).json({ message: "An app with that id does not exist" });
    return;
  }

  const status = await getContainerStatus(`dockerizalo-${req.params.appId}`);
  if (status !== "running") {
    res.status(400).json({ message: "The app is not running" });
    return;
  }

  const directory = await getOrCreateAppDirectory(app);
  await stopComposeStack(directory);

  const updatedApp = await prisma.app.findUniqueOrThrow({
    where: { id: req.params.appId },
  });

  sendAppEvent({
    ...updatedApp,
    status: await getContainerStatus(`dockerizalo-${req.params.appId}`),
  });

  res.status(200).json({ message: "App has stopped" });
};

export const listenAppLogs: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });

  if (!app) {
    res.status(404).json({ message: "An app with that id does not exist" });
    return;
  }

  const status = await getContainerStatus(`dockerizalo-${req.params.appId}`);
  if (status !== "running") {
    res.status(400).json({ message: "The app is not running" });
    return;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const abort = new AbortController();
  res.on("close", () => {
    abort.abort();
  });

  getContainerLogs(
    `dockerizalo-${req.params.appId}`,
    (progress) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    },
    abort.signal
  );
};
