import { sign, verify } from "jsonwebtoken";

export function createToken(userId: number) {
  if (!process.env.APP_SECRET) {
    throw new Error("There is no APP_SECRET environment variable present");
  }

  return sign({ userId }, process.env.APP_SECRET);
}

export function validateToken(token: string) {
  if (!process.env.APP_SECRET) {
    throw new Error("There is no APP_SECRET environment variable present");
  }

  return verify(token, process.env.APP_SECRET) as { userId: number };
}
