import { nullable, object, optional, string } from "zod";

export const createAppValidator = object({
  name: string({ required_error: "A name is required for your app" }).min(
    1,
    "A name is required for your app"
  ),
  description: optional(string()).or(nullable(string())),
  repository: string({
    required_error: "A repository is required for your app",
  }).url("This repository is not a valid URL"),
  branch: string({
    required_error: "A branch is required for your app",
  }),
  tokenId: nullable(string()),
});
