const github = require('@actions/github');
const core = require('@actions/core');
const io = require('@actions/io');
const toolCache = require('@actions/tool-cache');
const fs = require('fs');
const path = require('path');

const ASSET_NAME_REGEX = /^UnrealEngine-CSS-Editor-Win64\.7z.*$/;

/**
 * 
 * @param {ReturnType<typeof github.getOctokit>} octokit
 * @param {string} token
 * @param {string} tag
 * @param {boolean} cache
 */
async function download(octokit, token, tag, cache) {
  const temp = process.env['RUNNER_TEMP'];

  const isLatest = tag === '';

  if (isLatest) {
    const { data: latestRelease } = await octokit.rest.repos.getLatestRelease({
      owner: 'satisfactorymodding',
      repo: 'UnrealEngine',
    });
    tag = latestRelease.tag_name;
  }

  const engineDirectory = toolCache.find('UnrealEngine-CSS', tag);

  if (engineDirectory) {
    return engineDirectory;
  }

  const { data: release } = await octokit.rest.repos.getReleaseByTag({
    owner: 'satisfactorymodding',
    repo: 'UnrealEngine',
    tag,
  });

  const assets = release.assets.filter(asset => ASSET_NAME_REGEX.test(asset.name));  
  const parts = await Promise.all(assets.map(async asset => toolCache.downloadTool(asset.url, path.join(temp, asset.name), `token ${token}`, { accept: 'application/octet-stream' })));

  const tempEngine = path.join(temp, 'UnrealEngine-CSS');
  io.mkdirP(tempEngine);
  
  await toolCache.extract7z(path.join(temp, 'UnrealEngine-CSS-Editor-Win64.7z.001'), tempEngine, 'C:\\Program Files\\7-Zip\\7z.exe');

  if (!cache) {
    return tempEngine;
  }
  return await toolCache.cacheDir(tempEngine, 'UnrealEngine-CSS', tag);
}

module.exports = {
  download,
}
