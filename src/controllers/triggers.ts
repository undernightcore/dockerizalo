import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { prisma } from "../services/prisma";
import { createTriggerValidator } from "../validators/trigger/create-trigger";
import { createBuild } from "./builds";

export const listTriggers: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
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

  const data = createTriggerValidator.parse(req.body);

  const trigger = await prisma.trigger.findUnique({
    where: { id: req.params.triggerId },
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
    where: { id: req.params.triggerId },
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

  const trigger = await prisma.trigger.findUnique({
    where: { id: req.params.triggerId },
  });
  if (!trigger) {
    res.status(404).json({ message: "A trigger with that id does not exist" });
    return;
  }

  await prisma.trigger.delete({ where: { id: req.params.triggerId } });

  res.status(200).json({ message: "The trigger has been deleted" });
};

export const runTrigger: RequestHandler = async (req, res, next) => {
  const trigger = await prisma.trigger.findUnique({
    where: { id: req.params.triggerId, appId: req.params.appId },
  });

  if (!trigger) {
    res.status(400).json({ message: "This trigger does not exist!" });
    return;
  }

  await createBuild(req, res, next);
};
