FROM node:buster

RUN useradd --user-group --create-home --shell /bin/false app && \
  npm install --global --silent serve

ENV HOME=/home/app

COPY package.json $HOME/
COPY package-lock.json $HOME/
RUN chown -R app:app $HOME

USER app
WORKDIR $HOME

COPY package.json $HOME
COPY package-lock.json $HOME
RUN npm install --production --silent

COPY build $HOME/build
COPY public $HOME/public

EXPOSE 3000
CMD [ "serve", "-s", "build", "-l",  "3000" ]
