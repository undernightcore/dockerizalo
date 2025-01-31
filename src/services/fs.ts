import { App } from "@prisma/client";
import { mkdtemp, readdir, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function createTemporalDirectory() {
  return mkdtemp(join(tmpdir(), "dockerizate-"));
}

export async function getAppDirectory(app: App) {
  const dir = join(process.env.APPS_DIR ?? "/data/dockerizalo", app.id);

  return readdir(dir)
    .then(() => dir)
    .catch(() => undefined);
}

export async function getOrCreateAppDirectory(app: App) {
  const dir = join(process.env.APPS_DIR ?? "/data/dockerizalo", app.id);

  await readdir(dir).catch(() => mkdir(dir, { recursive: true }));

  return dir;
}

export async function deleteAppDirectory(app: App) {
  const dir = join(process.env.APPS_DIR ?? "/data/dockerizalo", app.id);

  await readdir(dir)
    .then(() => rm(dir, { recursive: true, force: true }))
    .catch();
}
