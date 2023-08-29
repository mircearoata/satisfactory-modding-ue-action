const core = require('@actions/core');
const github = require('@actions/github');
const downloader = require('./downloader');

async function run() {
  const token = core.getInput('token');
  const tag = core.getInput('tag');
  const cache = core.getBooleanInput('cache');

  const octokit = github.getOctokit(token);

  const enginePath = await downloader.download(octokit, token, tag, cache);

  core.exportVariable('UE_ROOT', enginePath);
}

run();
