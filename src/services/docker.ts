import { EnvironmentVariable } from "@prisma/client";
import { downAll, ps } from "docker-compose";
import Dockerode from "dockerode";
import { load } from "js-yaml";
import { spawn } from "node:child_process";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { toMap } from "../utils/array";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

export async function buildImage(
  tag: string,
  contextPath: string,
  filePath: string,
  variables: EnvironmentVariable[],
  progress: (status: any) => void,
  abort: AbortSignal
) {
  const build = spawn(
    "docker",
    [
      "build",
      "-t",
      tag,
      "-f",
      filePath,
      ...(variables.length
        ? variables.flatMap(({ key, value }) => [
            "--build-arg",
            `${key}=${value}`,
          ])
        : []),
      contextPath,
    ],
    { signal: abort, shell: false }
  );

  // Docker logs to stderr, surprising, I know
  build.stderr.on("data", (data) => progress(data.toString()));

  return new Promise((resolve, reject) => {
    build.on("error", () => {});
    build.on("close", (code) => (code ? reject("") : resolve("")));
  });
}

export async function startComposeStack(
  path: string,
  progress: (value: string) => void
) {
  const deploy = spawn("docker", [
    "compose",
    "-f",
    join(path, "docker-compose.yml"),
    "up",
    "-d",
  ]);

  // Docker logs to stderr, surprising, I know
  deploy.stderr.on("data", (data) => progress(data.toString()));

  return new Promise((resolve, reject) => {
    deploy.on("error", () => {});
    deploy.on("close", (code) => (code ? reject("") : resolve("")));
  });
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

export async function getAllContainers() {
  return docker.listContainers();
}

export async function getAllContainersStatus() {
  const containers = await getAllContainers();

  const containerMap = toMap(
    containers.flatMap((container) =>
      container.Names.map((name) => ({ name, status: container.State }))
    ),
    (container) => container.name
  );

  return containerMap;
}

export function getContainerLogs(
  name: string,
  progress: (status: any) => void,
  abort: AbortSignal,
  tail?: number
) {
  const logs = spawn(
    "docker",
    ["logs", name, "-f", "-n", tail ? String(tail) : "all"],
    { signal: abort }
  );

  logs.stdout.on("data", (value) => progress(value.toString()));
  logs.stderr.on("data", (value) => progress(value.toString()));

  return new Promise((resolve, reject) =>
    logs.on("error", () => (abort.aborted ? resolve("") : reject("")))
  );
}

export async function saveComposeConfiguration(config: string, path: string) {
  return writeFile(join(path, "docker-compose.yml"), config);
}

export async function getComposeConfiguration(path: string) {
  return readFile(join(path, "docker-compose.yml"))
    .then((file) => file.toString())
    .catch(() => undefined);
}

export function getComposeImage(config: string) {
  const compose = load(config) as
    | { services?: { app?: { image?: string } } }
    | undefined;

  return compose?.services?.app?.image;
}

export async function isImageAvailable(name: string) {
  try {
    await docker.getImage(name).inspect();
    return true;
  } catch {
    return false;
  }
}

export async function removeImages(images: string[]) {
  const removal = spawn("docker", ["image", "rm", ...images]);

  return new Promise((resolve) => {
    removal.on("error", () => {});
    removal.on("close", () => resolve(true));
  });
}
