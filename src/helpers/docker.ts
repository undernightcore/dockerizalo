import {
  BindMount,
  Build,
  EnvironmentVariable,
  PortMapping,
} from "@prisma/client";
import { dump } from "js-yaml";

export function createComposeConfiguration(
  build: Build,
  ports: PortMapping[],
  volumes: BindMount[],
  variables: EnvironmentVariable[]
) {
  const compose = {
    services: {
      app: {
        image: `dockerizalo-app-${build.appId}-build-${build.id}`,
        restart: "unless-stopped",
        ...(ports.length
          ? { ports: ports.map((port) => `${port.external}:${port.internal}`) }
          : {}),
        ...(variables.length
          ? {
              environment: variables.reduce(
                (acc, variable) => ({
                  ...acc,
                  [variable.key]: variable.value,
                }),
                {}
              ),
            }
          : {}),
        ...(volumes.length
          ? {
              volumes: volumes.map(
                (volume) => `${volume.host}:${volume.internal}`
              ),
            }
          : {}),
      },
    },
  };

  return dump(compose);
}
