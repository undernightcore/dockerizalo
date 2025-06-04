import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { prisma } from "../services/prisma";
import { createMountValidator } from "../validators/mount/create-mount";
import { updateAllMountsValidator } from "../validators/mount/update-all-mounts";

export const listMounts: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const mounts = await prisma.bindMount.findMany({
    where: { appId: app.id },
  });

  res.status(200).json(mounts);
};

export const createMount: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createMountValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const mount = await prisma.bindMount.create({
    data: { ...data, appId: app.id },
  });

  res.status(201).json(mount);
};

export const updateMount: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createMountValidator.parse(req.body);

  const existing = await prisma.bindMount.findUnique({
    where: { id: req.params.mountId, appId: req.params.appId },
  });
  if (!existing) {
    res.status(404).json({ message: "There is no bind mount with that id" });
    return;
  }

  const updated = await prisma.bindMount.update({
    where: { id: req.params.mountId, appId: req.params.appId },
    data,
  });

  res.status(200).json(updated);
};

export const deleteMount: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const existing = await prisma.bindMount.findUnique({
    where: { id: req.params.mountId, appId: req.params.appId },
  });
  if (!existing) {
    res.status(404).json({ message: "There is no bind mount with that id" });
    return;
  }

  await prisma.bindMount.delete({
    where: { id: req.params.mountId, appId: req.params.appId },
  });

  res.status(200).json({ message: "The mount has been deleted successfully" });
};

export const updateAllMounts: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = updateAllMountsValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  await prisma.$transaction([
    prisma.bindMount.deleteMany({ where: { appId: app.id } }),
    prisma.bindMount.createMany({
      data: data.map((mount) => ({ ...mount, appId: app.id })),
    }),
  ]);

  res.status(200).json({ message: "All mounts have been saved!" });
};
