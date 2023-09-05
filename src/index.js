const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const downloader = require('./downloader');
const path = require('path');

async function run() {
  const token = core.getInput('token');
  const tag = core.getInput('tag');
  const cache = core.getBooleanInput('cache');

  const octokit = github.getOctokit(token);

  const enginePath = await downloader.download(octokit, token, tag, cache);

  core.exportVariable('UE_ROOT', enginePath);

  await exec.exec('reg', ['save', 'HKCU\\Software\\Epic Games\\Unreal Engine\\Builds', path.join(process.env.RUNNER_TEMP, 'UEBuilds.hiv')]);
  await exec.exec(path.join(enginePath, 'SetupScripts', 'Register.bat'));
}

run();
