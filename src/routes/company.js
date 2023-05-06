const express = require('express');
const Router    = express.Router();
const CompanyController = require('../controllers/companies-controller');
const verifyToken = require("../authorization/verify-token");
const verifyPermission = require("../authorization/role-check");
const verifyCompanyId = require("../authorization/verify-company-id-same-as-user-company-id");
const verifyOnlyMasterToken = require("../authorization/verify-role-master");
const companyController = new CompanyController();

Router.use(express.json());

Router.get('/companies', verifyToken, verifyOnlyMasterToken, (req, res, next) => companyController.getCompanies(req, res, next));
Router.get('/companies/:companyId', verifyToken, verifyPermission(), verifyCompanyId, (req, res, next) => companyController.getCompany(req, res, next));

module.exports = Router
