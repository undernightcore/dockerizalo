import { RequestHandler, request } from "express";
import { registerUserValidator } from "../validators/register-user";
import { prisma } from "../services/prisma";
import { authenticateUser } from "../services/auth";
import { hashPassword, isValidPassword } from "../helpers/bcrypt";
import { createToken } from "../helpers/jwt";
import { loginUserValidator } from "../validators/login-user";

export const registerUser: RequestHandler = async (req, res) => {
  const data = registerUserValidator.parse(req.body);

  const user = await authenticateUser(request).catch(() => undefined);
  const users = await prisma.user.count();

  if (!user && users) {
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
    data: { ...data, password: await hashPassword(data.password) },
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
