import { RequestHandler } from "express";
import { createAppValidator } from "../validators/create-app.validator";
import { prisma } from "../services/prisma";

export const createApp: RequestHandler = async (req, res) => {
  const data = createAppValidator.parse(req.body);

  const exists = await prisma.app.findUnique({ where: { name: data.name } });
  if (exists) {
    res.status(400).json({ message: "An app with that name already exists" });
    return;
  }

  const app = await prisma.app.create({ data });
  res.status(201).json(app);
};
