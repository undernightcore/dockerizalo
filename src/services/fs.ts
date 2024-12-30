import { App } from "@prisma/client";
import { mkdtemp, readdir, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function createTemporalDirectory() {
  return mkdtemp(join(tmpdir(), "dockerizate-"));
}

export async function getOrCreateAppDirectory(app: App) {
  const dir = join(process.env.APPS_DIR ?? "/data/dockerizalo", app.id);

  await readdir(dir).catch(() => mkdir(dir, { recursive: true }));

  return dir;
}
