import { Request } from "express";
import { AppRole, UserRole } from "../../prisma/generated/client";
import { AppInclude } from "../../prisma/generated/models/App";
import { validateToken } from "../helpers/jwt";
import { AccessError, AuthError } from "../types/auth-error";
import { prisma } from "./prisma";

export async function authenticateUser(request: Request) {
  const token = request.headers.authorization?.split(" ")[1];
  if (!token) throw new AuthError();

  let userId: number;
  try {
    userId = validateToken(token).userId;
  } catch {
    throw new AuthError();
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AuthError();

  return user;
}

export const authenticateAdmin = async (request: Request) => {
  const user = await authenticateUser(request);
  if (user.role !== UserRole.ADMIN)
    throw new AccessError("Only administrators can do that");

  return user;
};

export const authenticateMember = async (
  request: Request,
  include?: Omit<AppInclude, "members">,
) => {
  const user = await authenticateUser(request);

  const app = await prisma.app.findUnique({
    where: {
      id: request.params.appId,
      members:
        user.role !== UserRole.ADMIN ? { some: { userId: user.id } } : undefined,
    },
    include: { members: { where: { userId: user.id } }, ...include },
  });

  if (!app) return { app: null, role: null, user };

  const role =
    user.role === UserRole.ADMIN ? AppRole.EDITOR : app.members[0].role;

  const { members, ...withoutMembers } = app;

  return { app: withoutMembers, role, user };
};
