import { object, string } from "zod";

export const createTriggerValidator = object({
  name: string({ required_error: "A name for the trigger is required" }),
});
