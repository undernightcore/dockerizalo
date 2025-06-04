import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { prisma } from "../services/prisma";
import { createLabelValidator } from "../validators/label/create-labels";
import { updateAllLabelsValidator } from "../validators/label/update-all-labels";

export const listLabels: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  const labels = await prisma.label.findMany({
    where: { appId: app.id },
  });

  res.status(200).json(labels);
};

export const createLabel: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createLabelValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  const existing = await prisma.label.findFirst({
    where: { appId: req.params.appId, key: data.key },
  });
  if (existing) {
    res.status(400).json({ message: "A label with that key already exists" });
    return;
  }

  const saved = await prisma.label.create({
    data: { ...data, appId: req.params.appId },
  });
  res.status(201).json(saved);
};

export const updateLabel: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createLabelValidator.parse(req.body);

  const conflicting = await prisma.label.findFirst({
    where: {
      key: data.key,
      appId: req.params.appId,
      NOT: { id: req.params.labelId },
    },
  });
  if (conflicting) {
    res.status(400).json({ message: "There is already a label with that key" });
    return;
  }

  const existing = await prisma.label.findUnique({
    where: { appId: req.params.appId, id: req.params.labelId },
  });
  if (!existing) {
    res.status(400).json({
      message: "The label you are trying to modify does not exist",
    });
    return;
  }

  const updated = await prisma.label.update({
    where: { id: req.params.labelId, appId: req.params.appId },
    data,
  });

  res.status(200).json(updated);
};

export const deleteLabel: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const existing = await prisma.label.findUnique({
    where: { appId: req.params.appId, id: req.params.labelId },
  });
  if (!existing) {
    res.status(400).json({
      message: "The label you are trying to delete does not exist",
    });
    return;
  }

  await prisma.label.delete({
    where: { id: req.params.labelId, appId: req.params.appId },
  });

  res.status(200).json({ message: "The label has been deleted" });
};

export const updateAllLabels: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = updateAllLabelsValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  await prisma.$transaction([
    prisma.label.deleteMany({ where: { appId: app.id } }),
    prisma.label.createMany({
      data: data.map((label) => ({ ...label, appId: app.id })),
    }),
  ]);

  res.status(200).json({ message: "All labels have been updated!" });
};
