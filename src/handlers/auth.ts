import { ErrorRequestHandler } from "express";
import { AuthError } from "../types/auth-error";

export const authErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next
) => {
  if (error instanceof AuthError) {
    res.status(401).json({ message: error.message });
  } else {
    next(error);
  }
};
