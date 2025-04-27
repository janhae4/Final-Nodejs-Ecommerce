const mongoose = require('mongoose');

const discountConnection = mongoose.createConnection(process.env.DISCOUNT_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
module.exports = discountConnection;