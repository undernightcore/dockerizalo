import { RequestHandler } from "express";

export const notFoundErrorHandler: RequestHandler = (_, res) => {
  res.status(404).json({ message: "Route not found" });
};
