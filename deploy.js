const shell = require('shelljs');

const stackName = process.env.STACK_NAME || 'imaginarium';
const s3FunctionBucket = process.env.S3_FUNCTION_BUCKET;
const s3ImageBucket = process.env.S3_IMAGE_BUCKET;
const region = process.env.AWS_REGION;

if (!stackName) {
  console.error('Please provide STACK_NAME environment variable');
  process.exit(1);
}

if (!s3FunctionBucket) {
  console.error('Please provide S3_FUNCTION_BUCKET environment variable');
  process.exit(1);
}

if (!s3ImageBucket) {
  console.error('Please provide S3_IMAGE_BUCKET environment variable');
  process.exit(1);
}

if (!region) {
  console.error('Please provide AWS_REGION environment variable');
  console.error('So we know where to deploy this stack');
  process.exit(1);
}

shell.exec('yarn install --force');

// now build
shell.exec('node build.js');

// now package lambda
shell.exec(
  `aws cloudformation package --template-file cloudformation.yaml --s3-bucket ${s3FunctionBucket} --output-template-file dist/template.yml`,
);

const parameterOverrides = [
  `S3FunctionBucket=${s3FunctionBucket}`,
  `S3ImageBucket=${s3ImageBucket}`,
];

if (process.env.CDN_CERTIFICATE_ARN) {
  parameterOverrides.push(
    `CDNCertificateArn=${process.env.CDN_CERTIFICATE_ARN}`,
  );
}

if (process.env.CDN_ALIASES) {
  parameterOverrides.push(`CDNAliases=${process.env.CDN_ALIASES}`);
}

if (process.env.S3_IMAGE_KEY_PATTERN) {
  parameterOverrides.push(
    `S3ImageKeyPattern=${process.env.S3_IMAGE_KEY_PATTERN}`,
  );
}

if (process.env.SERVICENAME) {
  parameterOverrides.push(`SERVICENAME=${process.env.SERVICENAME}`);
}

// now deploy lambda
shell.exec(
  `aws --region ${region} cloudformation deploy --template-file dist/template.yml --stack-name ${stackName} --parameter-overrides ${parameterOverrides.join(
    ' ',
  )} --capabilities CAPABILITY_NAMED_IAM`,
);
