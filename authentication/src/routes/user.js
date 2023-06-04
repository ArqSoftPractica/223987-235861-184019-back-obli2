const express = require('express');
const Router    = express.Router()
const UsersController = require('../controllers/users-controller');
const userController = new UsersController();

Router.use(express.json());
Router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next(); 
});

//No token required
Router.post('/users', (req, res, next) => userController.createUser(req, res, next));
Router.post('/login', (req, res, next) => userController.login(req, res, next));

//Register token sent through link required in body
Router.post('/register', (req, res, next) => userController.register(req, res, next));

module.exports = Router
