const mongoose = require('mongoose');

let conn = null;

module.exports = async mongoUri => {
  try {
    if (conn == null) {
      conn = mongoose
        .connect(mongoUri, {
          keepAlive: true,
          autoIndex: true
        })
        .then(() => mongoose);

      mongoose.connection.on('error', () => {
        throw new Error(`unable to connect to database: ${mongoUri}`);
      });

      // `await`ing connection after assigning to the `conn` variable
      // to avoid multiple function calls creating new connections
      await conn;
    }
    return conn;
  } catch (error) {
    console.log(error);
  }
};