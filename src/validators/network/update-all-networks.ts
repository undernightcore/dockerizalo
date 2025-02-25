import { array } from "zod";
import { toSet } from "../../utils/array";
import { createNetworkValidator } from "./create-network";

export const updateAllNetworksValidator = array(createNetworkValidator).refine(
  (networks) =>
    toSet(networks, (network) => network.name).size === networks.length,
  "All network names must be unique!"
);
