import {
  BindMount,
  Build,
  EnvironmentVariable,
  Network,
  PortMapping,
} from "@prisma/client";
import { dump, load } from "js-yaml";

export function createComposeConfiguration(
  build: Build,
  ports: PortMapping[],
  volumes: BindMount[],
  variables: EnvironmentVariable[],
  networks: Network[]
) {
  const compose = {
    services: {
      app: {
        image: `dockerizalo-${build.id}`,
        container_name: `dockerizalo-${build.appId}`,
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
        ...(networks.length
          ? { networks: networks.map((network) => network.name) }
          : {}),
      },
    },
    ...(networks.length
      ? {
          networks: Object.fromEntries(
            networks.map((network) => [
              network.name,
              { name: network.name, external: network.external },
            ])
          ),
        }
      : {}),
  };

  return dump(compose);
}
