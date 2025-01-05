import { object, string } from "zod";

export const registerUserValidator = object({
  name: string({ required_error: "A name is required" }),
  email: string({ required_error: "An email is required " }).email(
    "It has to be a valid email"
  ),
  password: string({ required_error: "A password is required" }),
});
