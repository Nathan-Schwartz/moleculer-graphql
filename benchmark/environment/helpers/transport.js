const MQTT = require('moleculer/src/transporters/mqtt');
const AMQP = require('moleculer/src/transporters/amqp');

module.exports = () => {
  if (!process.env.TRANSPORT) throw new Error('no transporter specified')
  if (process.env.TRANSPORT.toLowerCase() === "amqp") {
    return new AMQP({
      amqp: {
        url: 'amqp://guest:guest@127.0.0.1:5672',
      },
    });
  } else {
    return new MQTT('mqtt://localhost:1883');
  }
}