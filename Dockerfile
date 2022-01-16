FROM node:16-alpine3.14

ENV HOME /home
WORKDIR $HOME

# Install compiler for TypeScript
RUN npm install -g typescript

# Install AWS CDK
RUN npm install -g aws-cdk

# Install AWS CLI
RUN apk update && apk add aws-cli
