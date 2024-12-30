import { EnvironmentVariable } from "@prisma/client";
import Dockerode from "dockerode";
import { readdir } from "node:fs/promises";

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
