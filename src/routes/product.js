const express = require('express');
const Router    = express.Router()
const ProductController = require('../controllers/products-controller')
const verifyToken = require("../authorization/verify-token");
const verifyPermission = require("../authorization/role-check");
const productController = new ProductController();
const constants = require('../constants')

Router.use(express.json());

Router.post('/products', verifyToken, verifyPermission(), (req, res, next) => productController.createProduct(req, res, next));
Router.get('/products', verifyToken, verifyPermission(constants.roles.all), (req, res, next) => productController.getProducts(req, res, next));
Router.get('/products/:id', verifyToken, verifyPermission(constants.roles.all), (req, res, next) => productController.getProduct(req, res, next));
Router.delete('/products/:id', verifyToken, verifyPermission(), (req, res, next) => productController.deactivateProduct(req, res, next));
Router.put('/products/:id', verifyToken, verifyPermission(), (req, res, next) => productController.editProduct(req, res, next));

module.exports = Router
