const { initMongo } = require('@applicationSchema/schemas');
const config = require('./config/config');
const app = require('./config/express');

initMongo(config.mongo.host).then(async () => {
  app.listen(config.port, () => {
    console.log(`server started on ${config.port} --${config.env}`);
  });
});
