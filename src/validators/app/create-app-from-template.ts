import { nullable, object, optional, string } from "zod";

export const createAppFromTemplateValidator = object({
  name: string({
    required_error: "A name is required for your app",
    invalid_type_error: "A name must be a valid string",
  }).min(1, "A name is required for your app"),
  description: optional(nullable(string())).default(null),
  template: string({ required_error: "A template is required for your app" }),
});
