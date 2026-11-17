import { RequestHandler } from "express";
import { UserRole } from "../../prisma/generated/client";
import { hashPassword, isValidPassword } from "../helpers/bcrypt";
import { createToken } from "../helpers/jwt";
import { authenticateAdmin, authenticateUser } from "../services/auth";
import { prisma } from "../services/prisma";
import { editUserValidator } from "../validators/user/edit-user";
import { loginUserValidator } from "../validators/user/login-user";
import { registerUserValidator } from "../validators/user/register-user";

export const registerUser: RequestHandler = async (req, res) => {
  const data = registerUserValidator.parse(req.body);

  const current = await authenticateUser(req).catch(() => undefined);
  const users = await prisma.user.count();

  if (users && current?.role !== UserRole.ADMIN) {
    res.status(400).json({
      message:
        "Registering is disabled, please ask an administrator to create an account",
    });
    return;
  }

  const conflicting = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (conflicting) {
    res
      .status(400)
      .json({ message: "There is already an user with that email" });
    return;
  }

  const createdUser = await prisma.user.create({
    data: {
      ...data,
      role: users ? UserRole.USER : UserRole.ADMIN,
      password: await hashPassword(data.password),
    },
  });

  res.status(201).json({ token: createToken(createdUser.id) });
};

export const loginUser: RequestHandler = async (req, res) => {
  const { email, password } = loginUserValidator.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isPasswordCorrent = await isValidPassword(password, user.password);
  if (!isPasswordCorrent) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  res.json({ token: createToken(user.id) });
};

export const getUsers: RequestHandler = async (req, res) => {
  await authenticateAdmin(req);

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });

  res.status(200).json(users);
};

export const editUser: RequestHandler = async (req, res) => {
  const admin = await authenticateAdmin(req);
  const data = editUserValidator.parse(req.body);

  const current = await prisma.user.findUnique({
    where: { id: Number(req.params.userId) },
  });
  if (!current) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (current.id === admin.id && data.role === UserRole.USER) {
    res.status(400).json({ message: "You cannot remove your own admin role" });
    return;
  }

  const conflicting = data.email
    ? await prisma.user.findUnique({
        where: { email: data.email, NOT: { id: current.id } },
      })
    : undefined;
  if (conflicting) {
    res.status(400).json({ message: "A user with that email already exists" });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: current.id },
    data: {
      ...data,
      password: data.password ? await hashPassword(data.password) : undefined,
    },
    select: { id: true, email: true, name: true, role: true },
  });
  res.status(200).json(updated);
};

export const removeUser: RequestHandler = async (req, res) => {
  const admin = await authenticateAdmin(req);

  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.userId) },
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.id === admin.id) {
    res.status(400).json({ message: "You cannot delete your own account" });
    return;
  }

  await prisma.user.delete({ where: { id: user.id } });

  res.status(200).json({ message: "Deleted successfully!" });
};

export const getUser: RequestHandler = async (req, res) => {
  const { email, name, id, role } = await authenticateUser(req);
  res.status(200).json({ email, name, id, role });
};
