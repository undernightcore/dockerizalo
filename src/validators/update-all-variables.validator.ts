import { array } from "zod";
import { createVariableValidator } from "./create-variable.validator";

export const updateAllVariablesValidator = array(createVariableValidator);
