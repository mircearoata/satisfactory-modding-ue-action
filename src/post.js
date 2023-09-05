const exec = require('@actions/exec');
const path = require('path');

async function run() {
  await exec.exec('reg', ['restore', 'HKCU\\Software\\Epic Games\\Unreal Engine\\Builds', path.join(process.env.RUNNER_TEMP, 'UEBuilds.hiv')]);
}

run();
