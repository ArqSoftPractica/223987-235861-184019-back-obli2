const express = require('express');
const Router    = express.Router()
const ProductController = require('../controllers/products-controller')
const verifyToken = require("../authorization/verify-token");
const verifyPermission = require("../authorization/role-check");
const productController = new ProductController();

Router.use(express.json());

Router.post('/products/subscribe/:id', verifyToken, verifyPermission(), (req, res, next) => productController.upsertProductSubscription(req, res, next));
Router.get('/products/subscribe/:id', verifyToken, verifyPermission(), (req, res, next) => productController.getIfSuscribedToProduct(req, res, next));

module.exports = Router
