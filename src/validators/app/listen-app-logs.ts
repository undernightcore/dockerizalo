import { number, object, optional, preprocess } from "zod";

export const listenAppLogsValidator = object({
  tail: optional(preprocess((value) => Number(value), number().int().min(1))),
});
