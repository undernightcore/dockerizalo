import {
  App,
  BindMount,
  EnvironmentVariable,
  Label,
  Network,
  PortMapping,
} from "@prisma/client";
import { dump } from "js-yaml";

export function createComposeConfiguration(
  app: App,
  image: string,
  ports: PortMapping[],
  volumes: BindMount[],
  variables: EnvironmentVariable[],
  networks: Network[],
  labels: Label[]
) {
  const compose = {
    services: {
      app: {
        image,
        container_name: `dockerizalo-${app.id}`,
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
        ...(labels.length
          ? {
              labels: labels.reduce(
                (acc, label) => ({
                  ...acc,
                  [label.key]: label.value,
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
