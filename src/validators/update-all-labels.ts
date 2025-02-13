import { array } from "zod";
import { toSet } from "../utils/array";
import { createLabelValidator } from "./create-labels";

export const updateAllLabelsValidator = array(createLabelValidator).refine(
  (labels) => toSet(labels, (label) => label.key).size === labels.length,
  "All label keys must be unique!"
);
