FROM lambci/lambda:build-nodejs10.x

# install yarn
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum install -y yarn

ARG AWS_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG CDN_CERTIFICATE_ARN
ARG CDN_ALIASES
ARG S3_FUNCTION_BUCKET
ARG S3_IMAGE_BUCKET
ARG S3_IMAGE_KEY_PATTERN
ARG STACK_NAME
ARG SERVICENAME

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN node build.js
RUN node deploy.js
