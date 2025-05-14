const { createClient } = require("redis");

require("dotenv").config();
const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 15780,
  },
});
client.on("connect", () => console.log("Redis Client Connected"));
client.on("error", (err) => console.log("Redis Client Error", err));
(async () => {
  await client.connect();
})();
module.exports = client;
