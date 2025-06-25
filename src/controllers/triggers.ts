import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { initBuild } from "../services/builder";
import { initDeploy } from "../services/deployer";
import { removeImages } from "../services/docker";
import { prisma } from "../services/prisma";
import { sendAppBuildsEvent } from "../services/realtime/app-builds";
import { createRepositoryAppValidator } from "../validators/app/create-repository-app";
import { createTriggerValidator } from "../validators/trigger/create-trigger";

export const listTriggers: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (app.mode === "IMAGE") {
    res
      .status(400)
      .json({ message: "Triggers do not work when an app is in IMAGE mode" });
    return;
  }

  const triggers = await prisma.trigger.findMany({ where: { appId: app.id } });

  res.status(200).json(triggers);
};

export const createTrigger: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (app.mode === "IMAGE") {
    res
      .status(400)
      .json({ message: "Triggers do not work when an app is in IMAGE mode" });
    return;
  }

  const data = createTriggerValidator.parse(req.body);
  const existing = await prisma.trigger.findFirst({
    where: { name: data.name, appId: app.id },
  });

  if (existing) {
    res
      .status(400)
      .json({ message: "There is already a trigger with that name" });
    return;
  }

  const trigger = await prisma.trigger.create({
    data: { ...data, appId: app.id },
  });

  res.status(201).json(trigger);
};

export const editTrigger: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (app.mode === "IMAGE") {
    res
      .status(400)
      .json({ message: "Triggers do not work when an app is in IMAGE mode" });
    return;
  }

  const data = createTriggerValidator.parse(req.body);

  const trigger = await prisma.trigger.findUnique({
    where: { id: req.params.triggerId, appId: app.id },
  });
  if (!trigger) {
    res.status(404).json({ message: "A trigger with that id does not exist" });
    return;
  }

  const conflicting = await prisma.trigger.findFirst({
    where: {
      name: data.name,
      appId: app.id,
      NOT: { id: req.params.triggerId },
    },
  });

  if (conflicting) {
    res
      .status(400)
      .json({ message: "There is already a trigger with that name" });
    return;
  }

  const updated = await prisma.trigger.update({
    where: { id: req.params.triggerId, appId: req.params.appId },
    data,
  });

  res.status(200).json(updated);
};

export const deleteTrigger: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (app.mode === "IMAGE") {
    res
      .status(400)
      .json({ message: "Triggers do not work when an app is in IMAGE mode" });
    return;
  }

  const trigger = await prisma.trigger.findUnique({
    where: { id: req.params.triggerId, appId: req.params.appId },
  });
  if (!trigger) {
    res.status(404).json({ message: "A trigger with that id does not exist" });
    return;
  }

  await prisma.trigger.delete({
    where: { id: req.params.triggerId, appId: req.params.appId },
  });

  res.status(200).json({ message: "The trigger has been deleted" });
};

export const runTrigger: RequestHandler = async (req, res) => {
  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
    include: { token: true },
  });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (app.mode === "IMAGE") {
    res
      .status(400)
      .json({ message: "Triggers do not work when an app is in IMAGE mode" });
    return;
  }

  const trigger = await prisma.trigger.findUnique({
    where: { id: req.params.triggerId, appId: req.params.appId },
  });

  if (!trigger) {
    res.status(400).json({ message: "This trigger does not exist!" });
    return;
  }

  const repositoryApp = createRepositoryAppValidator.parse(app);

  const build = await prisma.build.create({
    data: {
      manual: false,
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
