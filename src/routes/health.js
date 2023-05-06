const express = require('express');
const Router    = express.Router();
const HealthController = require('../controllers/health-controller')
const healthController = new HealthController();

Router.use(express.json());

Router.get('/health', (req, res, next) => healthController.getSystemHealth(req, res, next));

module.exports = Router
