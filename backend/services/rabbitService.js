const { publishToExchange } = require("../database/rabbitmqConnection");
const ORDER_EVENT_EXCHANGE = "order_events_exchange";
const AUTH_EVENT_EXCHANGE = "auth_events_exchange";

exports.publishUserCreated = async (user) =>
  await publishToExchange(AUTH_EVENT_EXCHANGE, "auth.user.registered", user);

exports.publishOrderCreated = async (order) =>
  await publishToExchange(ORDER_EVENT_EXCHANGE, "order.created", order);

exports.publishUserRecoveryPassword = async (user) =>
  await publishToExchange(AUTH_EVENT_EXCHANGE, "auth.user.changed", user);
