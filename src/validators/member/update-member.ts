import { z } from "zod";
import { AppRole } from "../../../prisma/generated/client";

export const updateMemberValidator = z.object({
  role: z.enum([AppRole.VIEWER, AppRole.EDITOR], {
    required_error: "A role is required",
  }),
});
