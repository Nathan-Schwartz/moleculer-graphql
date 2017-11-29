const { resolve } = require('path');
const exec = (cmd, args = [], opts) => new Promise((res, rej) =>
  require('child_process')
    .spawn(cmd, args, opts)
    .on('exit', res)
    .on('error', rej)
)

const strategies = ['DECENTRALIZED', 'CENTRALIZED'];
const transports = ['AMQP', 'MQTT'];

async function iife() {
  for (var STRATEGY of strategies) {
    for (var TRANSPORT of transports) {
      const env = Object.assign({}, process.env, { STRATEGY, TRANSPORT });
      await exec(
        'node',
        [resolve(__dirname, 'environment', 'runSuite')],
        {
          env,
          stdio: 'inherit',
          shell: true
        }
      );
    }
  }
}
iife();
