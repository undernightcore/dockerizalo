import { boolean, object, string } from "zod";

export const createVariableValidator = object({
  key: string({ required_error: "A variable key is required" }),
  value: string({ required_error: "A variable value is required" }),
  build: boolean({
    required_error:
      "You have to indicate if the variable should also be used when building",
  }),
});
