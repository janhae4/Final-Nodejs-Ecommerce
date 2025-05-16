require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
      apiKey: process.env.ELASTICSEARCH_API_KEY
  }
});

module.exports = elasticClient;
