import { Octokit } from "@octokit/rest";

let octokit: Octokit | null = null;

export function getOctokit(): Octokit {
  if (!octokit) {
    octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }
  return octokit;
}
