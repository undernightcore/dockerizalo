import { array } from "zod";
import { createMountValidator } from "./create-mount";

export const updateAllMountsValidator = array(createMountValidator);
