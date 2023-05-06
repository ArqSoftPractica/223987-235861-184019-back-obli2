const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const SaleReportRepository = require('../repositories/saleReport-repository');

module.exports = class SaleReportController {
    constructor() {
        this.saleReportRepository = new SaleReportRepository();
    }

    async getSaleReportFromReqCompanyId(req, res, next) {
        try{
            if (!req?.params?.companyId) {
                return next(new RestError('Parameter in url required: companyId', 400));    
            }
            let topSalesReport = await this.saleReportRepository.getTopSalesReport(req.params.companyId, req.query.limit);

            return res.json(topSalesReport);
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
