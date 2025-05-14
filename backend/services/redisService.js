const client = require("../database/redisConnection");
const { v4: uuidv4 } = require("uuid");

exports.addCart = async (data) => {
  const guestId = `guest-${uuidv4()}`;
  const cartKey = `guest_cart:${data.id || guestId}`;
  const infoKey = `guest_info:${data.id || guestId}`;

  const cartItem = JSON.stringify(data);
  await client.rPush(cartKey, cartItem);
  await client.expire(cartKey, 60 * 60 * 24 * 7);

  const guestInfo = { addresses: [] };
  await client.set(infoKey, JSON.stringify(guestInfo));
  await client.expire(infoKey, 60 * 60 * 24 * 7);

  return guestId;
};

exports.updateCart = async (guestId, data) => {
  const cartKey = `guest_cart:${guestId}`;
  await client.del(cartKey);
  const normalizedData = data.data ? data.data : data;
  const cartItem = JSON.stringify(normalizedData);
  await client.rPush(cartKey, cartItem);
  await client.expire(cartKey, 60 * 60 * 24 * 7);
  return normalizedData;
};

exports.deleteCart = async (guestId) => {
  const cartKey = `guest_cart:${guestId}`;
  console.log(cartKey)
  await client.del(cartKey);
};

exports.getCart = async (guestId) => {
  const cartKey = `guest_cart:${guestId}`;
  const cart = await client.lRange(cartKey, 0, -1);
  console.log(cart);
  return cart.map((item) => JSON.parse(item))[0];
};

exports.addGuestAddress = async (guestId, data) => {
  try {
    const {address, userInfo} = data;
    console.log(userInfo)
    const key = `guest_info:${guestId}`;
    const raw = await client.get(key);
    if (!raw) {
      await client.set(
        key,
        JSON.stringify({ ...userInfo, addresses: [address] })
      );
    } else {
      console.log(2)
      const guest = JSON.parse(raw);
      guest.addresses = guest.addresses || [];
      guest.addresses.push(address);
      await client.set(key, JSON.stringify(guest, {...userInfo}));
    }
    return data;
  } catch (error) {
    throw error;
  }
};

exports.createOrder = async (data) => {
  const orderId = uuidv4();
  const key = `guest_info:${data.userInfo.userId}`;

  const info = await client.get(key);
  const parsedInfo = JSON.parse(info);

  const currentPoints = parsedInfo.loyaltyPoints || 0;
  const newPoints = currentPoints + (data.loyaltyPoints || 0);

  await client.set(
    key,
    JSON.stringify({
      ...parsedInfo,
      loyaltyPoints: newPoints,
    })
  );

  await this.deleteCart(data.userInfo.userId);

  return orderId;
};

exports.getGuestOrders = async (guestId) => {
  const orders = await client.lRange(`guest_orders:${guestId}`, 0, -1);
  return orders.map((order) => JSON.parse(order));
};

exports.getGuestAddresses = async (guestId) => {
  const key = `guest_info:${guestId}`;
  const raw = await client.get(key);
  if (!raw) {
    return [];
  }
  const guest = JSON.parse(raw);
  return guest.addresses || [];
};

exports.deleteGuestAddress = async (guestId, addressId) => {
  const key = `guest_info:${guestId}`;
  const raw = await client.get(key);
  if (!raw) {
    return [];
  }
  const guest = JSON.parse(raw);
  guest.addresses = guest.addresses.filter(
    (address) => address._id.toString() !== addressId
  );
  await client.set(key, JSON.stringify(guest));
  return guest;
};

exports.updateGuestAddress = async (guestId, data) => {
  const key = `guest_info:${guestId}`;
  const raw = await client.get(key);

  if (!raw) {
    return [];
  }
  const guest = JSON.parse(raw);
  guest.addresses = guest.addresses.map((address) => {
    if (address._id === data._id) {
      return { ...data };
    }
    return address;
  });
  await client.set(key, JSON.stringify(guest));
  return guest;
};

exports.getInfo = async (guestId) => {
  const key = `guest_info:${guestId}`;
  const raw = await client.get(key);
  if (!raw) {
    return [];
  }
  const guest = JSON.parse(raw);
  return guest;
};

exports.updateInfo = async (guestId, data) => {
  console.log(data);
  const key = `guest_info:${guestId}`;
  const raw = await client.get(key);
  console.log(raw);
  await client.set(key, JSON.stringify({ ...raw, ...data }));
  return data;
};

exports.deleteInfo = async (guestId) => {
  const key = `guest_info:${guestId}`;
  await client.del(key);
};