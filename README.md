# Rnkr

Toy app with simple scoring/ranking algorithm

## Local dev

### Start Docker containers

From project root...

1. `docker-compose -f docker-compose.development.yaml up -d`

### Start Phoenix server

From project root...

1. `cd rnkr_interface`
2. `iex -S mix phx.server`

### Start React client

From project root...

1. `cd client-react`
2. `npm start`

And then in browser...

1. Start new contest from Producer screen
2. Open Consumer screen in new tab, join same contest, and vote!
