const { createClient } = require('redis');

require('dotenv').config();
const connection = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 15780
    }
});

connection.on('error', err => console.log('Redis Client Error', err));
const client = connection.connect();
module.exports = client;

