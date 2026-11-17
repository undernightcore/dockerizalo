import { object, string, z } from "zod";
import { UserRole } from "../../../prisma/generated/client";

export const editUserValidator = object({
  name: string({ required_error: "A valid name is required" }).optional(),
  email: string({ required_error: "An email is required " })
    .email("It has to be a valid email")
    .optional(),
  password: string({ required_error: "A password is required" }).optional(),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).optional(),
});
