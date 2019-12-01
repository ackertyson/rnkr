FROM elixir:1.9-alpine as build

# install build dependencies
RUN apk add --update git build-base nodejs npm python

# prepare build dir
RUN mkdir -p /app/rnkr_interface
WORKDIR /app/rnkr_interface

# install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# set build ENV
ENV MIX_ENV=prod

# include core project dependency
COPY rnkr /app/rnkr

# install mix dependencies
COPY rnkr_interface/mix.exs rnkr_interface/mix.lock ./
COPY rnkr_interface/config config
RUN mix deps.get
RUN mix deps.compile

# build assets
COPY rnkr_interface/assets assets
RUN cd assets && npm install && npm run deploy
RUN mix phx.digest

# build project
COPY rnkr_interface/priv priv
COPY rnkr_interface/lib lib
RUN mix compile

# build release
#COPY rnkr_interface/rel rel
RUN mix release

# prepare release image
FROM alpine:3.9 AS app
RUN apk add --update bash openssl

RUN mkdir /app
WORKDIR /app

COPY --from=build /app/rnkr_interface/_build/prod/rel/rnkr_interface ./
RUN chown -R nobody: /app
USER nobody

ENV HOME=/app
