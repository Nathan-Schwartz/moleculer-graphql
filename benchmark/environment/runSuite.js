const fs = require('fs');
const { resolve } = require('path');
const run = require('./helpers/runFile');
const benchmark = require('./helpers/benchmark');

if (!process.env.STRATEGY) {
  throw new Error('No Strategy provided. Options: DECENTRALIZED, CENTRALIZED')
} else if (!['centralized', 'decentralized'].includes(process.env.STRATEGY.toLowerCase())) {
  throw new Error('Invalid strategy provided. Options: DECENTRALIZED, CENTRALIZED')
}
const folder = process.env.STRATEGY.toLowerCase();
const children = fs.readdirSync(resolve(__dirname, folder)).map(file => run(resolve(__dirname, folder, file)));

const { ServiceBroker } = require('moleculer');
const { promisify } = require('util');
const transporter = require('./helpers/transport')();

const waitFor = promisify(setTimeout);

const broker = new ServiceBroker({
  nodeID: `client`,
  logger: console, // Leaving this one in for easy debugging
  namespace: 'graphql-testing',
  disableBalancer: true,
  transporter,
});

broker.start()
  .then(() => waitFor(5000))
  .then(() => benchmark(broker))
  .then(() => children.map(c => c.kill()))
  .then(() => broker.stop())
