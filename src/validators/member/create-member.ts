import { number, z } from "zod";
import { AppRole } from "../../../prisma/generated/client";

export const createMemberValidator = z.object({
  userId: number({ required_error: "A valid user id is required" }).int(
    "A valid user id is required",
  ),
  role: z.enum([AppRole.VIEWER, AppRole.EDITOR], {
    required_error: "A role is required",
  }),
});
