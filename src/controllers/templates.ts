import { RequestHandler } from "express";
import { authenticateUser } from "../services/auth";
import { templates } from "../templates";

export const listTemplates: RequestHandler = async (req, res) => {
  await authenticateUser(req);

  res.status(200).json(
    templates.map(({ name, description, icon }) => ({
      name,
      description,
      icon,
    }))
  );
};
