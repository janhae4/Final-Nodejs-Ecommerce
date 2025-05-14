require('dotenv').config();
const amqp = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'; 
let connection = null;
let channel = null;
const connectRabbitMQ = async () => {
    try {
        if (!connection) {
            connection = await amqp.connect(RABBITMQ_URL);
            console.log('Successfully connected to RabbitMQ');

            connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err.message);
                connection = null;
                setTimeout(connectRabbitMQ, 5000);
            });

            connection.on('close', () => {
                console.warn('RabbitMQ connection closed. Reconnecting...');
                connection = null;
                setTimeout(connectRabbitMQ, 5000);
            });
        }

        if (connection && !channel) {
            channel = await connection.createChannel();
            console.log('RabbitMQ channel created');

            channel.on('error', (err) => {
                console.error('RabbitMQ channel error:', err.message);
                channel = null;
            });

            channel.on('close', () => {
                console.warn('RabbitMQ channel closed.');
                channel = null;
            });
        }
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error.message);
        connection = null;
        channel = null;
        setTimeout(connectRabbitMQ, 5000);
    }
};

const getChannel = async () => {
    if (!channel) {
        await connectRabbitMQ();
    }
    return channel;
};

const publishToExchange = async (exchangeName, routingKey, message, options = {}) => {
    try {
        const ch = await getChannel();
        if (!ch) {
            throw new Error("RabbitMQ channel is not available.");
        }

        await ch.assertExchange(exchangeName, 'topic', { durable: true, ...options.exchangeOptions });

        const P_MESSAGE = JSON.stringify(message);
        const sent = ch.publish(
            exchangeName,
            routingKey,
            Buffer.from(P_MESSAGE),
            { persistent: true, ...options.publishOptions }
        );

        if (sent) {
            console.log(`[AMQP] Sent to exchange '${exchangeName}' with key '${routingKey}':`, P_MESSAGE);
        } else {
            console.warn(`[AMQP] Failed to send to exchange '${exchangeName}' with key '${routingKey}'. Message might be requeued or dropped.`);
        }
        return sent;
    } catch (error) {
        console.error(`Error publishing to exchange ${exchangeName}:`, error);
        throw error;
    }
};

const publishToQueue = async (queueName, message, options = {}) => {
    try {
        const ch = await getChannel();
        if (!ch) {
            throw new Error("RabbitMQ channel is not available.");
        }
        await ch.assertQueue(queueName, { durable: true, ...options.queueOptions });
        const P_MESSAGE = JSON.stringify(message);
        const sent = ch.sendToQueue(queueName, Buffer.from(P_MESSAGE), { persistent: true, ...options.publishOptions });

        if (sent) {
            console.log(`[AMQP] Sent to queue '${queueName}':`, P_MESSAGE);
        } else {
            console.warn(`[AMQP] Failed to send to queue '${queueName}'. Message might be requeued or dropped.`);
        }
        return sent;
    } catch (error) {
        console.error(`Error publishing to queue ${queueName}:`, error);
        throw error;
    }
};

const consumeFromQueue = async (queueName, exchangeName, bindingKey, onMessageCallback) => {
    try {
        const ch = await getChannel();
        if (!ch) {
            throw new Error("RabbitMQ channel is not available.");
        }

        await ch.assertExchange(exchangeName, 'topic', { durable: true });
        const q = await ch.assertQueue(queueName, { durable: true });
        await ch.bindQueue(q.queue, exchangeName, bindingKey);

        console.log(`[*] Waiting for messages in queue ${q.queue} for binding key ${bindingKey}. To exit press CTRL+C`);

        ch.consume(q.queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`[AMQP] Received from queue '${q.queue}' with key '${msg.fields.routingKey}':`, content);
                    await onMessageCallback(content, msg.fields.routingKey);
                    ch.ack(msg);
                } catch (processingError) {
                    console.error(`Error processing message from ${q.queue}:`, processingError);
                    ch.nack(msg, false, false);
                }
            }
        }, { noAck: false }); 
    } catch (error) {
        console.error(`Error consuming from queue ${queueName}:`, error);
        throw error;
    }
};


module.exports = {
    connectRabbitMQ,
    getChannel,
    publishToQueue,
    publishToExchange,
    consumeFromQueue,
};
