import { Token } from "@prisma/client";
import simpleGit from "simple-git";

export function cloneRepo(
  url: string,
  path: string,
  abort: AbortSignal,
  token?: Token
) {
  const repoUrl = new URL(url);

  if (token) {
    repoUrl.username = token.username;
    repoUrl.password = token.password;
  }

  const git = simpleGit({ abort });
  return git.clone(repoUrl.toString(), path);
}

export function changeBranch(branch: string, path: string) {
  const git = simpleGit({ baseDir: path });
  return git.checkout(branch);
}
