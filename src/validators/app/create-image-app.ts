import { literal, nullable, object, optional, string } from "zod";

export const createImageAppValidator = object({
  name: string({
    required_error: "A name is required for your app",
    invalid_type_error: "A name must be a valid string",
  }).min(1, "A name is required for your app"),
  mode: literal("IMAGE", {
    required_error: "A mode for your app is required",
    invalid_type_error: "The mode must be REPOSITORY or IMAGE",
  }),
  description: optional(nullable(string())).default(null),
  repository: optional(literal(null)).default(null),
  branch: optional(literal(null)).default(null),
  image: string({ required_error: "An image is required for your app" }),
  contextPath: optional(literal(null)).default(null),
  filePath: optional(literal(null)).default(null),
  tokenId: nullable(string()),
});
