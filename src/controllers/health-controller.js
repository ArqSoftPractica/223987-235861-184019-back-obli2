const express   = require('express');
const version = require('../../package.json').version;
const RestError = require('./rest-error');
const dbConnection = require('../db/connection/connection')
const redisConnection = require('../db/connection/redis-connection')

module.exports = class HealthController {
    constructor() {}
    
    async getSystemHealth(req, res, next) {
        try {
            const dbError = await dbConnection.sequelize.isDatabaseConnected()
            const isRedisConnected = redisConnection.redisIsConnected;

            const health = {
                available: true,
                dbConnection: !dbError,
                redisConnection: isRedisConnected,
                version: version
            }
            res.json(health);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async handleRepoError(err, next) {
        //error de base de datos.
        let http_code = (err.code == 11000)?409:400;
        let errorDesription = err.message
        if (err.errors && err.errors.length > 0 && err.errors[0].message) {
            errorDesription = err.errors[0].message
        }
        return next(new RestError(errorDesription, http_code));
    }
}
