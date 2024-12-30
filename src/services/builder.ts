import { App, Build, EnvironmentVariable } from "@prisma/client";
import { createTemporalDirectory } from "../services/fs";
import { changeBranch, cloneRepo } from "../services/git";
import { prisma } from "../services/prisma";
import { sendBuildEvent } from "../services/realtime";
import { buildImage } from "../services/docker";

type BuildId = string;
const runningBuilds = new Map<BuildId, AbortController>();

export const initBuild = async (
  app: App,
  build: Build,
  variables: EnvironmentVariable[]
) => {
  const currentLog = { value: "" };

  const abort = new AbortController();
  runningBuilds.set(build.id, abort);

  try {
    await appendLogToBuild(currentLog, "Cloning repository!", build);

    const directory = await createTemporalDirectory();
    await cloneRepo(app.repository, directory, abort.signal);
    await changeBranch(build.branch, directory);

    await appendLogToBuild(currentLog, "Building from Dockerfile...", build);

    await buildImage(
      `dockerizalo-${build.id}`,
      directory,
      variables,
      (progress) => {
        if (progress?.stream) {
          appendLogToBuild(currentLog, progress.stream, build);
        }
      },
      abort.signal
    );

    runningBuilds.delete(build.id);
    return await finishBuild(currentLog, true, build);
  } catch (e) {
    runningBuilds.delete(build.id);
    await finishBuild(currentLog, false, build);
    throw e;
  }
};

export const abortBuild = (build: Build) => {
  runningBuilds.get(build.id)?.abort();
};

const appendLogToBuild = async (
  log: { value: string },
  message: string,
  build: Build
) => {
  log.value += `${message}\n`;

  const updatedBuild = await prisma.build.update({
    where: { id: build.id },
    data: { log: log.value },
  });

  sendBuildEvent(updatedBuild);

  return updatedBuild.log;
};

const finishBuild = async (
  log: { value: string },
  success: boolean,
  build: Build
) => {
  await appendLogToBuild(
    log,
    success ? "Build finished successfully!" : "Build has failed...",
    build
  );

  const updatedBuild = await prisma.build.update({
    where: { id: build.id },
    data: { finishedAt: new Date(), status: success ? "SUCCESS" : "FAILED" },
  });

  sendBuildEvent(updatedBuild);

  return updatedBuild;
};
