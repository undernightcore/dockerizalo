import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const zodErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next
) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: error.issues[0].message });
  } else {
    next(error);
  }
};
