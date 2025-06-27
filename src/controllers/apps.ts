import { RequestHandler } from "express";
import promiseRetry from "promise-retry";
import { authenticateUser } from "../services/auth";
import {
  getDeploymentLogs,
  initDeploy,
  isDeploying,
} from "../services/deployer";
import {
  getAllContainersStatus,
  getComposeConfiguration,
  getComposeImage,
  getContainerLogs,
  getContainerStatus,
  isImageAvailable,
  stopComposeStack,
} from "../services/docker";
import {
  deleteAppDirectory,
  getAppDirectory,
  getOrCreateAppDirectory,
} from "../services/fs";
import { prisma } from "../services/prisma";
import {
  addAppSubscriber,
  removeAppSubscriber,
  sendAppEvent,
} from "../services/realtime/app";
import {
  addDeploymentSubscriber,
  removeDeploymentSubscriber,
} from "../services/realtime/deploy";
import { templates } from "../templates";
import { createAppValidator } from "../validators/app/create-app";
import { createAppFromTemplateValidator } from "../validators/app/create-app-from-template";
import { listenAppLogsValidator } from "../validators/app/listen-app-logs";
import { createBuild } from "./builds";

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

export const createAppFromTemplate: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createAppFromTemplateValidator.parse(req.body);

  const exists = await prisma.app.findUnique({ where: { name: data.name } });
  if (exists) {
    res.status(400).json({ message: "An app with that name already exists" });
    return;
  }

  const template = templates.find(
    (template) => template.name === data.template
  );
  if (!template) {
    res.status(400).json({ message: `No template with name ${data.template}` });
    return;
  }

  const app = await prisma.$transaction(async (trx) => {
    const createdApp = await trx.app.create({
      data: {
        name: data.name,
        description: data.description,
        image: template.image,
        mode: "IMAGE",
        branch: null,
        contextPath: null,
        filePath: null,
        tokenId: null,
        repository: null,
      },
    });

    await trx.portMapping.createMany({
      data: await template.ports(createdApp),
    });

    await trx.environmentVariable.createMany({
      data: await template.variables(createdApp),
    });

    await trx.network.createMany({
      data: await template.networks(createdApp),
    });

    await trx.bindMount.createMany({
      data: await template.volumes(createdApp),
    });

    return createdApp;
  });

  res.status(200).json(app);
};

export const deleteApp: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });
  if (!app) {
    res.status(404).json({ message: "An app with that id does not exist" });
    return;
  }

  const force = req.query.force === "true";

  if (force) {
    const directory = await getOrCreateAppDirectory(app);
    await stopComposeStack(directory);
    await deleteAppDirectory(app);
  }

  await prisma.app.delete({ where: { id: app.id } });

  res.status(200).json({ message: "The app has been deleted..." });
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

  sendAppEvent(app.id);

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

  if (isDeploying(app.id)) {
    res
      .status(400)
      .json({ message: "The app is currently deploying. Please wait." });
    return;
  }

  const [ports, volumes, variables, networks, labels] =
    await prisma.$transaction([
      prisma.portMapping.findMany({
        where: { appId: app.id },
      }),
      prisma.bindMount.findMany({
        where: { appId: app.id },
      }),
      prisma.environmentVariable.findMany({
        where: { appId: app.id },
      }),
      prisma.network.findMany({
        where: { appId: app.id },
      }),
      prisma.label.findMany({
        where: { appId: app.id },
      }),
    ]);

  // If the app comes with a prebuilt image there is no need to build
  if (app.image) {
    initDeploy(
      app,
      app.image,
      ports,
      volumes,
      variables,
      networks,
      labels
    ).catch(() => console.error("[ERROR] Deployment failed asyncronously"));
    res.status(200).json({ message: "App is now starting..." });
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

  const buildId = image.replace("dockerizalo-", "");
  if (!buildId) {
    await createBuild(req, res, next);
    return;
  }

  const build = await prisma.build.findUnique({
    where: { id: buildId },
  });
  if (!build) {
    await createBuild(req, res, next);
    return;
  }

  const available = await isImageAvailable(image);
  if (!available) {
    await createBuild(req, res, next);
    return;
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
  res.status(200).json({ message: "App is now starting..." });
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
  if (status !== "running" && status !== "restarting") {
    res.status(400).json({ message: "The app is not running" });
    return;
  }

  if (isDeploying(app.id)) {
    res
      .status(400)
      .json({ message: "The app is currently deploying. Please wait." });
    return;
  }

  const directory = await getOrCreateAppDirectory(app);
  await stopComposeStack(directory);

  sendAppEvent(app.id);

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

  const { tail } = listenAppLogsValidator.parse(req.query);

  const status = await getContainerStatus(`dockerizalo-${req.params.appId}`);
  if (status !== "running" && status !== "restarting") {
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

  promiseRetry(
    (retry) =>
      getContainerLogs(
        `dockerizalo-${req.params.appId}`,
        (progress) => {
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        },
        abort.signal,
        tail
      ).catch((error) => (!abort.signal.aborted ? retry(error) : undefined)),
    { forever: true, maxTimeout: 1000 }
  );
};

export const listenAppDeploymentLogs: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({
    where: { id: req.params.appId },
  });

  if (!app) {
    res.status(404).json({ message: "An app with that id does not exist" });
    return;
  }

  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const id = addDeploymentSubscriber(res, app);
  res.on("close", () => {
    removeDeploymentSubscriber(id, app);
  });

  res.write(`data: ${JSON.stringify(getDeploymentLogs(app.id) ?? null)}\n\n`);
};
