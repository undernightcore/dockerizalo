import { EnvironmentVariable } from "@prisma/client";
import { downAll, ps, upAll } from "docker-compose";
import Dockerode from "dockerode";
import { readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

export async function buildImage(
  tag: string,
  path: string,
  variables: EnvironmentVariable[],
  progress: (status: any) => void,
  abort: AbortSignal
) {
  const stream = await docker.buildImage(
    {
      context: path,
      src: await readdir(path, { recursive: true }),
    },
    {
      t: tag,
      abortSignal: abort,
      buildargs: variables.reduce(
        (acc, variable) => ({
          ...acc,
          [variable.key]: variable.value,
        }),
        {}
      ),
    }
  );

  return new Promise((resolve, reject) => {
    docker.modem.followProgress(
      stream,
      (err, res) => (err ? reject(err) : resolve(res)),
      progress
    );
  });
}

export async function startComposeStack(path: string) {
  return upAll({ cwd: path });
}

export async function stopComposeStack(path: string) {
  return stat(path)
    .then(() => downAll({ cwd: path }))
    .catch(() => undefined);
}

export async function getComposeStatus(path: string) {
  const folder = await readdir(path).catch(() => undefined);
  if (!folder) return "Down";

  const compose = await ps({ cwd: path });
  return compose.data.services.at(0)?.state ?? "Down";
}

export async function getContainerStatus(name: string) {
  const container = await docker
    .getContainer(name)
    .inspect()
    .catch(() => undefined);

  if (!container) return "exited";
  return container.State.Status;
}

export async function getContainerLogs(
  name: string,
  progress: (status: any) => void,
  abort: AbortSignal
) {
  const stream = await docker
    .getContainer(name)
    .logs({ follow: true, abortSignal: abort });

  return new Promise((resolve, reject) => {
    docker.modem.followProgress(
      stream,
      (err, res) => (err ? reject(err) : resolve(res)),
      progress
    );
  });
}

export async function saveComposeConfiguration(config: string, path: string) {
  return writeFile(join(path, "docker-compose.yml"), config);
}
