import { literal, nullable, object, optional, string } from "zod";

export const createRepositoryAppValidator = object({
  name: string({
    required_error: "A name is required for your app",
    invalid_type_error: "A name must be a valid string",
  }).min(1, "A name is required for your app"),
  mode: literal("REPOSITORY", {
    required_error: "A mode for your app is required",
    invalid_type_error: "The app mode must be REPOSITORY",
  }),
  description: optional(nullable(string())).default(null),
  repository: string({
    required_error: "A repository is required for your app",
    invalid_type_error: "This repository is not a valid URL",
  }).url("This repository is not a valid URL"),
  branch: string({
    required_error: "A branch is required for your app",
    invalid_type_error: "The branch must be a valid string",
  }),
  image: optional(literal(null)).default(null),
  contextPath: optional(
    string().regex(/^(?!$)(\/(?!\.{1,2}(?:\/|$))[^\s\/]+)*\/?$/)
  ).default("/"),
  filePath: optional(
    string().regex(/^(?!$)(\/(?!\.{1,2}(?:\/|$))[^\s\/]+)*\/?$/)
  ).default("/Dockerfile"),
  tokenId: optional(nullable(string())).default(null),
});
