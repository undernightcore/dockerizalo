import { RequestHandler } from "express";
import { authenticateAdmin, authenticateMember } from "../services/auth";
import { prisma } from "../services/prisma";
import { createMemberValidator } from "../validators/member/create-member";
import { updateMemberValidator } from "../validators/member/update-member";

export const listMembers: RequestHandler = async (req, res) => {
  const { app } = await authenticateMember(req);
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const members = await prisma.appMember.findMany({
    where: { appId: app.id },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json(members);
};

export const createMember: RequestHandler = async (req, res) => {
  await authenticateAdmin(req);

  const data = createMemberValidator.parse(req.body);

  const app = await prisma.app.findUnique({ where: { id: req.params.appId } });
  if (!app) {
    res.status(404).json({ message: "There is no app with that id" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    res.status(404).json({ message: "There is no user with that id" });
    return;
  }

  const conflicting = await prisma.appMember.findUnique({
    where: { appId_userId: { appId: app.id, userId: user.id } },
  });
  if (conflicting) {
    res
      .status(400)
      .json({ message: "That user already has access to this app" });
    return;
  }

  const member = await prisma.appMember.create({
    data: { appId: app.id, userId: user.id, role: data.role },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  res.status(201).json(member);
};

export const updateMember: RequestHandler = async (req, res) => {
  await authenticateAdmin(req);

  const data = updateMemberValidator.parse(req.body);

  const member = await prisma.appMember.findFirst({
    where: {
      id: Number(req.params.memberId),
      appId: req.params.appId,
    },
  });
  if (!member) {
    res.status(404).json({ message: "There is no member with that id" });
    return;
  }

  const updated = await prisma.appMember.update({
    where: { id: member.id },
    data,
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  res.status(200).json(updated);
};

export const deleteMember: RequestHandler = async (req, res) => {
  await authenticateAdmin(req);

  const member = await prisma.appMember.findFirst({
    where: {
      id: Number(req.params.memberId),
      appId: req.params.appId,
    },
  });
  if (!member) {
    res.status(404).json({ message: "There is no member with that id" });
    return;
  }

  await prisma.appMember.delete({ where: { id: member.id } });

  res.status(200).json({ message: "The member has been removed" });
};
