import { discriminatedUnion } from "zod";
import { createRepositoryAppValidator } from "./create-repository-app";
import { createImageAppValidator } from "./create-image-app";

export const createAppValidator = discriminatedUnion("mode", [
  createRepositoryAppValidator,
  createImageAppValidator,
]);
