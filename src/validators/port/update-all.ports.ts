import { array } from "zod";
import { createPortValidator } from "./create-port";
import { toSet } from "../../utils/array";

export const updateAllPortsValidator = array(createPortValidator).refine(
  (ports) => toSet(ports, (port) => port.external).size === ports.length,
  "All external ports must be unique within this app"
);
