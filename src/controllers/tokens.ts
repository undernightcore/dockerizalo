import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { prisma } from "../services/prisma";
import { createTokenValidator } from "../validators/create-token";

export const listTokens: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const tokens = await prisma.token.findMany();

  res.status(200).json(tokens);
};

export const createToken: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createTokenValidator.parse(req.body);

  const conflicting = await prisma.token.findUnique({
    where: { name: data.name },
  });
  if (conflicting) {
    res.status(400).json({ message: "A token with that name already exists" });
    return;
  }

  const token = await prisma.token.create({ data });

  res.status(201).json(token);
};

export const deleteToken: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const token = await prisma.token.findUnique({
    where: { id: req.params.tokenId },
  });
  if (!token) {
    res.status(400).json({ message: "A token with that id does not exist" });
    return;
  }

  await prisma.token.delete({ where: { id: token.id } });

  res.status(200).json({ message: "Token delete successfully!" });
};

export const updateToken: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  const data = createTokenValidator.parse(req.body);

  const token = await prisma.token.findUnique({
    where: { id: req.params.tokenId },
  });
  if (!token) {
    res.status(400).json({ message: "A token with that id does not exist" });
    return;
  }

  const conflicting = await prisma.token.findUnique({
    where: { name: data.name, NOT: { id: token.id } },
  });
  if (conflicting) {
    res.status(400).json({ message: "A token with that name already exists" });
    return;
  }

  const updated = await prisma.token.update({ where: { id: token.id }, data });

  res.status(200).json(updated);
};
