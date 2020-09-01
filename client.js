/* eslint-disable no-undef */
/*
 * Basic test client for the Websocket to X-Plane UDP proxy
 *
 * Start with 'npm client.js', this then connects to your local
 * websocket proxy on port :8080 (you start this with 'npm server.js')
 * and that proxy will talk to X-Plane if it's running.
 *
 * Press:
 * 1: Send the command to open/close the glove box on the C172SP.
 * 2: Send the command to toggle APR mode on the S-TEC like AP.
 * 3: Tell X-Plane to send you the flaps setting at most once per second.
 * 4: Tell X-Plane to send you the flaps setting up to four times per second.
 * 5: Tell X-Plane to stop sending you flaps updates.
 * 6: Set the flaps value dataRef to 0.0
 * 7: Set the flaps value dataRef to 1.0
 * 8: Lower the flaps one notch
 * 8: Raise the flaps one notch
 * ctrl-C or command-C: exit the client
 *
 * (Note: the websocket proxy currently only sends value updates if the
 * value changed, so you probably will see fewer responses than requested).
 */

const WebSocket = require('ws');
const JsonRPC = require('simple-jsonrpc-js');

function heartbeat() {
  clearTimeout(this.pingTimeout);

  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 10000 + 1000);
}

function connect() {
  console.log('connecting ...');

  const jrpc = new JsonRPC();
  const ws = new WebSocket('ws://localhost:8080');

  ws.jrpc = jrpc;

  ws.on('open', heartbeat);

  ws.on('ping', heartbeat);

  ws.on('close', function clear() {
    clearTimeout(this.pingTimeout);
    console.log('disconnected');
  });

  jrpc.on(
    'dataRefUpdate',
    ['dataRef', 'value'],
    (updatedDataRef, updatedValue) => {
      console.log(`the dataref ${updatedDataRef} has value ${updatedValue}`);
    },
  );

  jrpc.toStream = function toStream(_msg) {
    ws.send(_msg);
  };

  ws.on('message', function incoming(data) {
    // console.log(`got message: ${data}`);
    jrpc.messageHandler(data);
  });

  return ws;
}

const ws = connect();

// node.js get keypress
const { stdin } = process;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();
// i don't want binary, do you?
stdin.setEncoding('utf8');

// on any data into stdin
stdin.on('data', function on(key) {
  // ctrl-c ( end of text )
  // @ts-ignore
  if (key === '\u0003') {
    // eslint-disable-next-line no-process-exit
    process.exit();
  }

  // if (ws !== null) {
  //  console.log('Not connected');
  //  return;
  // }

  // without rawmode, it returns EOL with the string
  if (key.indexOf('1') === 0) {
    console.log(`toggling glove box`);
    ws.jrpc.call('sendCommand', ['sim/operation/slider_24']);
  }

  if (key.indexOf('2') === 0) {
    console.log(`toggling AP APR`);
    ws.jrpc.call('sendCommand', ['sim/autopilot/approach']);
  }

  if (key.indexOf('3') === 0) {
    console.log(`requesting flaps at lowest speed (1 per sec)`);
    ws.jrpc.call('requestDataRef', ['sim/flightmodel/controls/flaprat', 1]);
  }

  if (key.indexOf('4') === 0) {
    console.log(`requesting flaps at medium speed (4 per sec)`);
    ws.jrpc.call('requestDataRef', ['sim/flightmodel/controls/flaprat', 4]);
  }

  if (key.indexOf('5') === 0) {
    console.log(`requesting no more flaps updates`);
    ws.jrpc.call('requestDataRef', ['sim/flightmodel/controls/flaprat', 0]);
  }

  if (key.indexOf('6') === 0) {
    console.log(`setting flaps to 1.0`);
    ws.jrpc.call('setDataRef', ['sim/flightmodel/controls/flaprqst', 1.0]);
  }

  if (key.indexOf('7') === 0) {
    console.log(`setting flaps to 0.0`);
    ws.jrpc.call('setDataRef', ['sim/flightmodel/controls/flaprqst', 0.0]);
  }

  if (key.indexOf('8') === 0) {
    console.log(`flaps down one`);
    ws.jrpc.call('sendCommand', ['sim/flight_controls/flaps_down']);
  }

  if (key.indexOf('9') === 0) {
    console.log(`flaps up one`);
    ws.jrpc.call('sendCommand', ['sim/flight_controls/flaps_up']);
  }

  // write the key to stdout all normal like
  // process.stdout.write( key );
});
