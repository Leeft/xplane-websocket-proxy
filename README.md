# xplane-websocket-proxy

A basic websocket to X-Plane Legacy UDP proxy written in node; this proxy makes it easy to talk to X-Plane from a Javascript application such as the Stream Deck plugin I'm also working on.

When started, this listens on localhost:8080 (TCP) for websocket connections, and talks to X-Plane on localhost:49000 (UDP).

## Installation

### The easy way

Grab the latest executable for your platform from https://github.com/Leeft/xplane-node-udp-client/releases. Place it anywhere you like, and run it. Windows, MacOS and Linux binaries are included, but only Windows is tested right now.

A window will open which will echo the instructions that are received; as this is project is in early stages this can not currently be disabled nor can anything be configured.

You can't directly do anything with this; use my Stream Deck plugin to talk to your X-Plane.

Hit control-C (or command-C) to stop the server.

### For development

Install node (https://nodejs.org) for your platform, clone this repository and run `npm install` in its directory; this will install all dependencies you need to run it manually.

I recommend the free Visual Studio Code with the appropriate extensions as a good development tool.

Run `node server.js` to start the server, run `node client.js` to start a quick and dirty test client. See inside that script for a bit more information on what it does.

## See also

Includes my little library https://github.com/Leeft/xplane-node-udp-client to talk to X-Plane.

Running this server is currently required for my Stream Deck plugin https://github.com/Leeft/streamdeck-xplane to work.