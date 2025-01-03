import { object, string } from "zod";

export const createMountValidator = object({
  internal: string({
    required_error: "An internal path in the container is required",
  }),
  host: string({ required_error: "A path in the host is required" }),
});
