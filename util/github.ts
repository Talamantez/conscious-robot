// util/github.ts
const GITHUB_API_URL = "https://api.github.com";
const REPO_OWNER = "Talamantez";
const REPO_NAME = "weak-crow-28";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

if (!GITHUB_TOKEN) {
  console.error("GitHub token not found in environment variables");
}

export async function createGitHubIssue(title: string, body: string) {
  const url = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create GitHub issue: ${response.statusText}`);
  }

  return await response.json();
}