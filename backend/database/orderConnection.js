const mongoose = require('mongoose');

const orderConnection = mongoose.createConnection(process.env.ORDER_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
module.exports = orderConnection;