import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function createTemporalDirectory() {
  return mkdtemp(join(tmpdir(), "dockerizate-"));
}
