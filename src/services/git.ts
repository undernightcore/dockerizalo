import simpleGit from "simple-git";

export function cloneRepo(url: string, path: string, abort: AbortSignal) {
  const git = simpleGit({ abort });
  return git.clone(url, path);
}

export function changeBranch(branch: string, path: string) {
  const git = simpleGit({ baseDir: path });
  return git.checkout(branch);
}
