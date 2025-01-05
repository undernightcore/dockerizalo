import { number, object } from "zod";

export const createPortValidator = object({
  internal: number({ required_error: "An internal port is required" })
    .min(1, "A valid port cannot be less than 1")
    .max(65535, "A valid port cannot be more than 65535"),
  external: number({ required_error: "An external port is required" })
    .min(1, "A valid port cannot be less than 1")
    .max(65535, "A valid port cannot be more than 65535"),
});
