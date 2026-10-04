# NATS Node Test

A small NATS demo with a local NATS server, Node.js publisher/subscriber scripts, and a browser page with two independent consumers.

## Requirements

- Docker Desktop (or Docker Engine) installed and running
- Node.js 18 or newer, including npm
- Internet access in the browser to load the NATS WebSocket client from the CDN

Verify Docker and Node.js are available:

```sh
docker --version
node --version
npm --version
```

Install the Node.js dependency from the project directory:

```sh
npm install
```

## Quick Start (macOS)

Run the helper script from the project directory:

```sh
./script.sh
```

It starts or restarts the `nats-server` container, starts the web server on port 8000, and opens the browser. If the page does not open automatically, visit <http://localhost:8000/>. The script uses macOS's `open` command; on other platforms, start NATS and the web server separately using the steps below.

## Start NATS

From the project directory, start the NATS container with the local configuration:

```sh
docker run -d --name nats-server \
  -p 4222:4222 -p 8222:8222 -p 8080:8080 \
  -v "$(pwd)/nats.conf:/nats.conf" \
  nats:latest -c /nats.conf
```

The configuration enables JetStream and exposes these ports:

- `4222`: NATS client connections
- `8222`: NATS monitoring HTTP endpoint, available at <http://localhost:8222/varz>
- `8080`: NATS WebSocket connections used by `index.html`

Check the container and its logs:

```sh
docker ps --filter name=nats-server
docker logs nats-server
```

Stop and restart the container without removing it:

```sh
docker stop nats-server
docker start nats-server
```

## Run the Node.js Scripts

Run the subscribe-and-publish smoke test. It connects to `localhost:4222`, subscribes to `demo.test`, publishes a message, and prints the received message:

```sh
node test-nats.mjs
```

Publish a message from the standalone publisher:

```sh
node publish-nats.mjs "Hello from Node.js"
```

The publisher defaults to `nats://localhost:4222` and the `demo.test` subject. Override either with environment variables:

```sh
NATS_URL=nats://localhost:4222 NATS_SUBJECT=demo.test \
  node publish-nats.mjs "A custom message"
```

## Run the Browser Demo

Start the Node.js web server from the project directory:

```sh
npm start
```

Open <http://localhost:8000/>. The server serves `index.html` on localhost; set `PORT` to use a different port, for example `PORT=8081 npm start`. The page connects to NATS over WebSocket at `ws://localhost:8080`. Wait for the status to show connected, enter a message, and publish it to `demo.test` to see it appear in both consumer panes. You can also publish to `demo.test` from `publish-nats.mjs` in another terminal. The page loads its browser NATS client from a CDN, so the browser needs internet access.

## Remove the Container

Removing the container also removes data stored in its writable layer, including the configured JetStream store:

```sh
docker rm -f nats-server
```