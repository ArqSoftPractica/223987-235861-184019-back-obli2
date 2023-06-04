const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const CompanyRepository = require('../repositories/company-repository');

module.exports = class CompanyController {
    constructor() {
        this.companyRepository = new CompanyRepository();
    }
    
    async getCompanies(req, res, next) {
        try {
            let companies = await this.companyRepository.getCompanies();
            companies.forEach(element => {
                element.apiKey = undefined
            });
            res.json(companies);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getCompany(req, res, next) {
        const id = req.params.companyId;
        if (!id) {
            return next(new RestError('id required', 400));    
        }

        try {
            let company = await this.companyRepository.getCompany(id);
            if (company) {
                company.apiKey = undefined
                res.json(company);
            } else {
                return next(new RestError(`Company not found`, 404));    
            }
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
