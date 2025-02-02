import { object, string } from "zod";

export const createTokenValidator = object({
  name: string({ required_error: "A token name is required" }),
  value: string({ required_error: "A token value is required" }),
});
