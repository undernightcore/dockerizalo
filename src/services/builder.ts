import { Build, EnvironmentVariable, Token } from "@prisma/client";
import {
  createTemporalDirectory,
  deleteTemporalDirectory,
} from "../services/fs";
import { changeBranch, cloneRepo } from "../services/git";
import { prisma } from "../services/prisma";
import { buildImage } from "../services/docker";
import { join } from "node:path";
import z from "zod";
import { createRepositoryAppValidator } from "../validators/app/create-repository-app";
import { sendBuildEvent } from "./realtime/build";
import { sendAppBuildsEvent } from "./realtime/app-builds";

type BuildId = string;
const runningBuilds = new Map<BuildId, AbortController>();

export const initBuild = async (
  app: z.infer<typeof createRepositoryAppValidator>,
  build: Build,
  variables: EnvironmentVariable[],
  token?: Token
) => {
  const currentLog = { value: "" };

  const abort = new AbortController();
  runningBuilds.set(build.id, abort);

  let directory: string | undefined = undefined;

  try {
    await appendLogToBuild(currentLog, "Cloning repository!\n\n", build);

    directory = await createTemporalDirectory();
    await cloneRepo(app.repository, directory, abort.signal, token);
    await changeBranch(build.branch, directory);

    await appendLogToBuild(
      currentLog,
      "Building from Dockerfile...\n----------------------------\n\n",
      build
    );

    await buildImage(
      `dockerizalo-${build.id}`,
      join(directory, app.contextPath),
      join(directory, app.filePath),
      variables,
      (progress) => appendLogToBuild(currentLog, progress, build),
      abort.signal
    );

    await deleteTemporalDirectory(directory);

    runningBuilds.delete(build.id);
    await finishBuild(currentLog, true, build);
  } catch (e) {
    if (directory) await deleteTemporalDirectory(directory);
    if (e.message) appendLogToBuild(currentLog, e.message, build);

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
  log.value += message;

  const updatedBuild = await prisma.build.update({
    where: { id: build.id },
    data: { log: log.value },
  });

  sendBuildEvent(build.id);

  return updatedBuild.log;
};

const finishBuild = async (
  log: { value: string },
  success: boolean,
  build: Build
) => {
  await appendLogToBuild(
    log,
    success
      ? "\n\nBuild finished successfully!\n----------------------------\n"
      : "\n\nBuild has failed...\n--------------------\n",
    build
  );

  const updatedBuild = await prisma.build.update({
    where: { id: build.id },
    data: { finishedAt: new Date(), status: success ? "SUCCESS" : "FAILED" },
  });

  sendBuildEvent(build.id);
  sendAppBuildsEvent(build.appId);

  return updatedBuild;
};
