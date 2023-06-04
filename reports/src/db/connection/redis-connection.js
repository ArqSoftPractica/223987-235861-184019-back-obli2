require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const Redis = require('redis');
const redisUrl = process.env.REDIS_URL;

const RedisClient = Redis.createClient({
    url: redisUrl
})

RedisClient.redisIsConnected = false

RedisClient.connect();

RedisClient.on('connect', function() {
    console.log('Cliente conectado a redis')
    RedisClient.redisIsConnected = true
});

RedisClient.on('error', function(err) {
    console.log(`Redis connection error: ${err?.message ?? ""}`)
    RedisClient.redisIsConnected = false
});

module.exports = RedisClient