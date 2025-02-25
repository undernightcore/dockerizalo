import { object, string } from "zod";

export const createLabelValidator = object({
  key: string({ required_error: "A label key is required" }),
  value: string({ required_error: "A label value is required" }),
});
