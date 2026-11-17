import { RequestHandler } from "express";
import { authenticateMember } from "../services/auth";
import { prisma } from "../services/prisma";
import { createNetworkValidator } from "../validators/network/create-network";
import { updateAllNetworksValidator } from "../validators/network/update-all-networks";

export const listNetworks: RequestHandler = async (req, res) => {
  const { app } = await authenticateMember(req);
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  const networks = await prisma.network.findMany({
    where: { appId: app.id },
  });

  res.status(200).json(networks);
};

export const createNetwork: RequestHandler = async (req, res) => {
  const { app, role } = await authenticateMember(req);
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (role !== "EDITOR") {
    res
      .status(403)
      .json({ message: "You do not have permission to edit this app" });
    return;
  }

  const data = createNetworkValidator.parse(req.body);

  const existing = await prisma.network.findFirst({
    where: { appId: app.id, name: data.name },
  });
  if (existing) {
    res.status(400).json({ message: "A network with that key already exists" });
    return;
  }

  const saved = await prisma.network.create({
    data: { ...data, appId: app.id },
  });
  res.status(201).json(saved);
};

export const updateNetwork: RequestHandler = async (req, res) => {
  const { app, role } = await authenticateMember(req);
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (role !== "EDITOR") {
    res
      .status(403)
      .json({ message: "You do not have permission to edit this app" });
    return;
  }

  const data = createNetworkValidator.parse(req.body);

  const conflicting = await prisma.network.findFirst({
    where: {
      name: data.name,
      appId: app.id,
      NOT: { id: req.params.networkId },
    },
  });
  if (conflicting) {
    res
      .status(400)
      .json({ message: "There is already a network with that name" });
    return;
  }

  const existing = await prisma.network.findUnique({
    where: { appId: app.id, id: req.params.networkId },
  });
  if (!existing) {
    res.status(400).json({
      message: "The network you are trying to modify does not exist",
    });
    return;
  }

  const updated = await prisma.network.update({
    where: { id: req.params.networkId, appId: app.id },
    data,
  });

  res.status(200).json(updated);
};

export const deleteNetwork: RequestHandler = async (req, res) => {
  const { app, role } = await authenticateMember(req);
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (role !== "EDITOR") {
    res
      .status(403)
      .json({ message: "You do not have permission to edit this app" });
    return;
  }

  const existing = await prisma.network.findUnique({
    where: { appId: app.id, id: req.params.networkId },
  });
  if (!existing) {
    res.status(400).json({
      message: "The network you are trying to delete does not exist",
    });
    return;
  }

  await prisma.network.delete({
    where: { id: req.params.networkId, appId: app.id },
  });

  res.status(200).json({ message: "The network has been deleted" });
};

export const updateAllNetworks: RequestHandler = async (req, res) => {
  const { app, role } = await authenticateMember(req);
  if (!app) {
    res
      .status(404)
      .json({ message: "An application with that id does not exist" });
    return;
  }

  if (role !== "EDITOR") {
    res
      .status(403)
      .json({ message: "You do not have permission to edit this app" });
    return;
  }

  const data = updateAllNetworksValidator.parse(req.body);

  await prisma.$transaction([
    prisma.network.deleteMany({ where: { appId: app.id } }),
    prisma.network.createMany({
      data: data.map((network) => ({ ...network, appId: app.id })),
    }),
  ]);

  res.status(200).json({ message: "All networks have been updated!" });
};
