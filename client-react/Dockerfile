FROM node:buster

RUN useradd --user-group --create-home --shell /bin/false app && \
  npm install --global --silent serve

ENV HOME=/home/app

COPY package.json $HOME/
COPY package-lock.json $HOME/
RUN chown -R app:app $HOME

USER app
WORKDIR $HOME
RUN npm install --silent --production
COPY . $HOME/
RUN npm run build

EXPOSE 3000
CMD [ "serve", "-s", "build", "-l",  "3000" ]
