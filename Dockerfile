FROM node:16-alpine3.14

ENV HOME /home
WORKDIR $HOME

# install AWS CDK
RUN npm install -g aws-cdk

# add libraries related to webpack and transpile for typescript by yarn
RUN yarn install \
  && yarn add -D webpack webpack-cli webpack-node-externals ts-loader

ADD . $HOME
