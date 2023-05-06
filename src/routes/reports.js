const express = require('express');
const Router    = express.Router()
const verifyToken = require('../authorization/verify-token');
const verifyRole = require('../authorization/role-check');
const ReportController = require('../controllers/report-controller')
const reportController = new ReportController();
const {roles} = require('../constants');
const verifyCompanyId = require('../authorization/verify-company-id-same-as-user-company-id');

Router.use(express.json());

Router.post('/reports/:companyId', verifyToken, verifyRole(roles.employee), verifyCompanyId, (req, res, next) => reportController.sendReportEmailForUser(req, res, next));

module.exports = Router
