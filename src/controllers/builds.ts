import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { abortBuild, initBuild } from "../services/builder";
import { initDeploy } from "../services/deployer";
import { removeImages } from "../services/docker";
import { prisma } from "../services/prisma";
import {
  addAppBuildsSubscriber,
  removeAppBuildsSubscriber,
  sendAppBuildsEvent,
} from "../services/realtime/app-builds";
import {
  addBuildSubscriber,
  removeBuildSubscriber,
} from "../services/realtime/build";
import { createRepositoryAppValidator } from "../validators/app/create-repository-app";

export const createBuild: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
    include: { token: true },
  });

  if (!app) {
    res.status(404).json({ message: "This app does not exist" });
    return;
  }

  const repositoryApp = createRepositoryAppValidator.parse(app);

  const build = await prisma.build.create({
    data: {
      manual: true,
      branch: repositoryApp.branch,
      log: "",
      appId: app.id,
    },
  });

  let variables = await prisma.environmentVariable.findMany({
    where: { appId: app.id },
  });

  res.status(201).json(build);

  sendAppBuildsEvent(app.id);

  try {
    await initBuild(
      repositoryApp,
      build,
      variables.filter((variable) => variable.build),
      app.token ?? undefined
    );
  } catch {
    console.error("[ERROR] Build failed asyncronously");
    return;
  }

  variables = await prisma.environmentVariable.findMany({
    where: { appId: app.id },
  });

  const [ports, volumes, networks, labels] = await prisma.$transaction([
    prisma.portMapping.findMany({
      where: { appId: app.id },
    }),
    prisma.bindMount.findMany({
      where: { appId: app.id },
    }),
    prisma.network.findMany({
      where: { appId: app.id },
    }),
    prisma.label.findMany({
      where: { appId: app.id },
    }),
  ]);

  try {
    const MAX_IMAGES = await prisma.setting.findFirstOrThrow({
      where: { name: "MAX_IMAGES" },
    });

    const builds = await prisma.build.findMany({
      where: { appId: app.id, status: "SUCCESS" },
      skip: Number(MAX_IMAGES.value),
      take: MAX_IMAGES.max ?? undefined,
      orderBy: { createdAt: "desc" },
    });

    await removeImages(builds.map(({ id }) => `dockerizalo-${id}`));
  } catch {
    console.warn("[WARN] Could not delete old images");
  }

  initDeploy(
    app,
    `dockerizalo-${build.id}`,
    ports,
    volumes,
    variables,
    networks,
    labels
  ).catch(() => console.error("[ERROR] Deployment failed asyncronously"));
};

export const listenBuilds: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });
  if (!app) {
    res.status(404).json({ message: "This app does not exist" });
    return;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const id = addAppBuildsSubscriber(app.id, res);
  res.on("close", () => {
    removeAppBuildsSubscriber(app.id, id);
  });

  const builds = await prisma.build.findMany({
    select: {
      id: true,
      branch: true,
      manual: true,
      status: true,
      createdAt: true,
      finishedAt: true,
    },
    where: { appId: app.id },
    take: 100,
    orderBy: { updatedAt: "desc" },
  });

  res.write(`data: ${JSON.stringify(builds)}\n\n`);
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
