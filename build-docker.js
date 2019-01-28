const shell = require('shelljs');

const requiredVariables = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_IMAGE_BUCKET',
  'S3_FUNCTION_BUCKET',
];
const optionalVariables = [
  'CDN_ALIASES',
  'CDN_CERTIFICATE_ARN',
  'S3_IMAGE_KEY_PATTERN',
  'STACK_NAME',
];

requiredVariables.forEach(variable => {
  if (!process.env[variable]) {
    console.error(`Please set up environment variable ${variable}.`);
    process.exit(1);
  }
});

const buildArgs = [];

[...requiredVariables, ...optionalVariables].forEach(variable => {
  const val = process.env[variable];

  if (val) {
    buildArgs.push(`--build-arg ${variable}=${val}`);
  }
});

shell.exec(`docker build . ${buildArgs.join(' ')}`);
