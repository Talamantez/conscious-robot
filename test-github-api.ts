// test-github-api.ts
import { createGitHubIssue } from "./util/github.ts";

async function testGitHubApi() {
  try {
    const issue = await createGitHubIssue("Test Issue", "This is a test issue body");
    console.log("Test issue created successfully:", issue);
  } catch (error) {
    console.error("Error creating test issue:", error);
  }
}

testGitHubApi();