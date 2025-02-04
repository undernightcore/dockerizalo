import { boolean, object, string } from "zod";

export const createNetworkValidator = object({
  name: string({ required_error: "A name is required" }),
  external: boolean({
    required_error:
      "You have to indicate if the variable should also be used when building",
  }),
});
