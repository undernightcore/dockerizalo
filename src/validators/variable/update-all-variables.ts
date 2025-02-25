import { array } from "zod";
import { createVariableValidator } from "./create-variable";
import { toSet } from "../../utils/array";

export const updateAllVariablesValidator = array(
  createVariableValidator
).refine(
  (variables) =>
    toSet(variables, (variable) => variable.key).size === variables.length,
  "All variable keys must be unique!"
);
