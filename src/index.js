const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const downloader = require('./downloader');
const path = require('path');

async function run() {
  const token = core.getInput('token');
  let tag = core.getInput('tag');
  const version = core.getInput('version');
  const cache = core.getBooleanInput('cache');

  const octokit = github.getOctokit(token);

  if (tag && version) {
    throw new Error('You can only specify one of tag and version');
  }

  if (version) {
    // If a version is specified, we need to find the latest tag that matches it
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: 'satisfactorymodding',
      repo: 'UnrealEngine',
      per_page: 100,
    });

    const tagObj = releases.find((tagObj) => tagObj.tag_name.startsWith(version));

    if (!tagObj) {
      throw new Error(`No tag found for version ${version}`);
    }

    tag = tagObj.tag_name;
  }

  if (!tag) {
    // If we still have no tag specified, use the latest  
    const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
      owner: 'satisfactorymodding',
      repo: 'UnrealEngine',
    });
    
    tag = latestRelease.tag_name;
  }

  const enginePath = await downloader.download(octokit, token, tag, cache);

  core.exportVariable('UE_ROOT', enginePath);

  await exec.exec('reg', ['save', 'HKCU\\Software\\Epic Games\\Unreal Engine\\Builds', path.join(process.env.RUNNER_TEMP, 'UEBuilds.hiv')]);
  await exec.exec(path.join(enginePath, 'SetupScripts', 'Register.bat'));
}

run();
