import {
  BindMount,
  Build,
  EnvironmentVariable,
  PortMapping,
} from "@prisma/client";
import { createComposeConfiguration } from "../helpers/docker";

export async function initDeploy(
  build: Build,
  ports: PortMapping[],
  volumes: BindMount[],
  variables: EnvironmentVariable[]
) {
  const composeFile = createComposeConfiguration(
    build,
    ports,
    volumes,
    variables
  );
}
