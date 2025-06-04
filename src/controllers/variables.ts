import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { prisma } from "../services/prisma";
import { createVariableValidator } from "../validators/variable/create-variable";
import { updateAllVariablesValidator } from "../validators/variable/update-all-variables";

export const listVariables: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  const variables = await prisma.environmentVariable.findMany({
    where: { appId: app.id },
  });

  res.status(200).json(variables);
};

export const createVariable: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createVariableValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  const existing = await prisma.environmentVariable.findFirst({
    where: { appId: req.params.appId, key: data.key },
  });
  if (existing) {
    res
      .status(400)
      .json({ message: "A variable with that key already exists" });
    return;
  }

  const saved = await prisma.environmentVariable.create({
    data: { ...data, appId: req.params.appId },
  });
  res.status(201).json(saved);
};

export const updateVariable: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createVariableValidator.parse(req.body);

  const conflicting = await prisma.environmentVariable.findFirst({
    where: {
      key: data.key,
      appId: req.params.appId,
      NOT: { id: req.params.variableId },
    },
  });
  if (conflicting) {
    res
      .status(400)
      .json({ message: "There is already a variable with that key" });
    return;
  }

  const existing = await prisma.environmentVariable.findUnique({
    where: { appId: req.params.appId, id: req.params.variableId },
  });
  if (!existing) {
    res.status(400).json({
      message: "The variable you are trying to modify does not exist",
    });
    return;
  }

  const updated = await prisma.environmentVariable.update({
    where: { id: req.params.variableId, appId: req.params.appId },
    data,
  });

  res.status(200).json(updated);
};

export const deleteVariable: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const existing = await prisma.environmentVariable.findUnique({
    where: { appId: req.params.appId, id: req.params.variableId },
  });
  if (!existing) {
    res.status(400).json({
      message: "The variable you are trying to delete does not exist",
    });
    return;
  }

  await prisma.environmentVariable.delete({
    where: { id: req.params.variableId, appId: req.params.appId },
  });

  res.status(200).json({ message: "The variable has been deleted" });
};

export const updateAllVariables: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = updateAllVariablesValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  await prisma.$transaction([
    prisma.environmentVariable.deleteMany({ where: { appId: app.id } }),
    prisma.environmentVariable.createMany({
      data: data.map((variable) => ({ ...variable, appId: app.id })),
    }),
  ]);

  res.status(200).json({ message: "All variables have been updated!" });
};
