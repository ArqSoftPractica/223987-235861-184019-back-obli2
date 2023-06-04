const express = require('express');
const Router    = express.Router()
const SaleReportController = require('../controllers/salesReport-controller')
const saleReportController = new SaleReportController();
const verifyCompanyApiKey = require('../authorization/verify-company-api-key');
const verifyToken = require('../authorization/verify-token');
const verifyTestRole = require("../authorization/verify-role-test");
const verifyReqCompanyIdEqualReqCompanyId = require("../authorization/verify-req-company-id-equal-param-company-id")

Router.use(express.json());

Router.get('/saleReport/:companyId', verifyCompanyApiKey, verifyReqCompanyIdEqualReqCompanyId, (req, res, next) => saleReportController.getSaleReportFromReqCompanyId(req, res, next));
Router.get('/saleReportTest/:companyId', verifyToken, verifyTestRole, (req, res, next) => saleReportController.getSaleReportFromReqCompanyId(req, res, next));

module.exports = Router
