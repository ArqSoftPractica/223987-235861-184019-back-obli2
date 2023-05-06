const express = require('express');
const Router    = express.Router()
const SalesController = require('../controllers/sales-controller')
const verifyToken = require("../authorization/verify-token");
const verifyPermission = require("../authorization/role-check");
const salesController = new SalesController();
const constants = require('../constants')

Router.use(express.json());

Router.post('/sales', verifyToken, verifyPermission([constants.roles.employee]), (req, res, next) => salesController.createSale(req, res, next));
Router.get('/sales', verifyToken, verifyPermission([constants.roles.employee]), (req, res, next) => salesController.getSales(req, res, next));
Router.get('/sales/:id', verifyToken, verifyPermission([constants.roles.employee]), (req, res, next) => salesController.getSale(req, res, next));
Router.get('/companySales', verifyToken, verifyPermission([constants.roles.employee]), (req, res, next) => salesController.getSalesByCompanyWithSaleProducts(req, res, next));
Router.get('/productSales', verifyToken, verifyPermission([constants.roles.employee]), (req, res, next) => salesController.getProductSaleFromCompanyForRange(req, res, next));

module.exports = Router
