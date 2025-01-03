import { array } from "zod";
import { createVariableValidator } from "./create-variable";

export const updateAllVariablesValidator = array(createVariableValidator);
