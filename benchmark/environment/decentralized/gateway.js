const { ServiceBroker } = require('moleculer');
const { graphql } = require('graphql');
const { GraphQLGateway } = require('../../../lib/Gateway/GraphQLGateway');
const { authors } = require('../helpers/data');
const transporter = require('../helpers/transport')();

const broker = new ServiceBroker({
  nodeID: `Gateway`,
  // logger: console,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,
  namespace: 'graphql-testing',
  disableBalancer: true,
  transporter,
});

const gateway = new GraphQLGateway({
  broker,
});

broker
  .start()
  .then(() => gateway.start())
