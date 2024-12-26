import simpleGit from "simple-git";

export function cloneRepo(url: string, path: string) {
  const git = simpleGit();
  return git.clone(url, path);
}
