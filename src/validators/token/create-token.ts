import { object, string } from "zod";

export const createTokenValidator = object({
  name: string({ required_error: "A token name is required" }),
  username: string({ required_error: "A token username is required" }),
  password: string({ required_error: "A token password is required" }),
});
