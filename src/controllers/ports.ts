import { RequestHandler } from "express";
import { prisma } from "../services/prisma";
import { createPortValidator } from "../validators/create-port";
import { updateAllPortsValidator } from "../validators/update-all.ports";
import { authenticateUser } from "../services/auth";

export const listPorts: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const ports = await prisma.portMapping.findMany({ where: { appId: app.id } });

  res.status(200).json(ports);
};

export const createPort: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createPortValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const existing = await prisma.portMapping.findFirst({
    where: { external: data.external, appId: app.id },
  });
  if (existing) {
    res
      .status(400)
      .json({ message: "You cannot set the same external port twice" });
    return;
  }

  const port = await prisma.portMapping.create({
    data: { ...data, appId: app.id },
  });

  res.status(201).json(port);
};

export const updatePort: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createPortValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const port = await prisma.portMapping.findUnique({
    where: { id: req.params.portId },
  });
  if (!port) {
    res.status(404).json({ message: "There is no port with that id" });
    return;
  }

  const existing = await prisma.portMapping.findFirst({
    where: {
      external: data.external,
      appId: app.id,
      NOT: { id: req.params.portId },
    },
  });
  if (existing) {
    res
      .status(400)
      .json({ message: "You cannot set the same external port twice" });
    return;
  }

  const updated = await prisma.portMapping.update({
    where: { id: port.id },
    data,
  });

  res.status(200).json(updated);
};

export const deletePort: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const port = await prisma.portMapping.findUnique({
    where: { id: req.params.portId },
  });
  if (!port) {
    res.status(404).json({ message: "There is no port with that id" });
    return;
  }

  await prisma.portMapping.delete({ where: { id: port.id } });

  res.status(200).json({ message: "The port has been deleted" });
};

export const updateAllPorts: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = updateAllPortsValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  await prisma.$transaction([
    prisma.portMapping.deleteMany({ where: { appId: app.id } }),
    prisma.portMapping.createMany({
      data: data.map((port) => ({ ...port, appId: app.id })),
    }),
  ]);

  res.status(200).json({ message: "All ports have been updated!" });
};
