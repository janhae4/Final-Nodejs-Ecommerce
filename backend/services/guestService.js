const client = require("../database/redisConnection");
const { v4: uuidv4 } = require("uuid");

exports.addGuestCart = async (data) => {
  const guestId = uuidv4();
  const cartKey = `guest_cart:${guestId}`;
  const cartItem = JSON.stringify({ data });
  await client.rPush(cartKey, cartItem);
  await client.expire(cartKey, 60 * 60 * 24 * 7);
  return guestId;
};

exports.getGuestCart = async (guestId) => {
  const cartKey = `guest_cart:${guestId}`;
  const cart = await client.lRange(cartKey, 0, -1);
  return cart.map((item) => JSON.parse(item));
};