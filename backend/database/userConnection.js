const mongoose = require('mongoose');
require('dotenv').config();

const userConnection = mongoose.createConnection(process.env.USER_DB_URI);
module.exports = userConnection;