import { App, Build } from "@prisma/client";
import { createTemporalDirectory } from "../services/fs";
import { cloneRepo } from "../services/git";
import { prisma } from "../services/prisma";
import { sendBuildEvent } from "../services/realtime";

export const initBuild = async (app: App, build: Build) => {
  try {
    await appendLogToBuild("Cloning repository!", build);

    const temporal = await createTemporalDirectory();
    await cloneRepo(app.repository, temporal);

    await appendLogToBuild("Cloned succesfully!", build);

    finishBuild(true, build);
  } catch {
    finishBuild(false, build);
  }
};

export const appendLogToBuild = async (message: string, build: Build) => {
  const { log } = await prisma.build.findFirstOrThrow({
    where: { id: build.id },
  });

  const updatedBuild = await prisma.build.update({
    where: { id: build.id },
    data: { log: `${log}${message}\n` },
  });

  sendBuildEvent(updatedBuild);

  return updatedBuild;
};

export const finishBuild = async (success: boolean, build: Build) => {
  await appendLogToBuild(
    success ? "Build finished successfully!" : "Build has failed...",
    build
  );

  const updatedBuild = await prisma.build.update({
    where: { id: build.id },
    data: { finishedAt: new Date(), status: success ? "SUCCESS" : "FAILED" },
  });

  sendBuildEvent(updatedBuild);
};
