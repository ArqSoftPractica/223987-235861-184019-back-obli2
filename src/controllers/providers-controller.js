const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const ProviderRepository = require('../repositories/provider-repository');

module.exports = class ProviderController {
    constructor() {
        this.providerRepository = new ProviderRepository();
    }

    async createProvider(req, res, next) {
        try {
            req.body.companyId = req?.user?.companyId
            let providerCreated = await this.providerRepository.createProvider(req.body);
        
            res.json(providerCreated);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getProvider(req, res, next) {
        const id = req.params.id;
        if (!id) {
            return next(new RestError('id required', 400));    
        }

        try {
            let provider = await this.providerRepository.getProvider(id, req?.user?.companyId);
            if (provider) {
                res.json(provider);
            } else {
                next(new RestError(`Provider not found`, 404));    
            }
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getProviders(req, res, next) {
        try {
            let queryParams = {};
            if (req.query.isActive) {
                queryParams.isActive = req.query.isActive == 'true'
            }

            let providers = await this.providerRepository.getProviders(queryParams, req?.user?.companyId);
            
            res.json(providers);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async editProvider(req, res, next) {
        try {
            const id = req.params.id;
            req.body.companyId = req?.user?.companyId
            let provider = await this.providerRepository.editProvider(id, req.body, req?.user?.companyId);
            
            res.json(provider);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async deactivateProvider(req, res, next) {
        try {
            const id = req.params.id;
            let body = {isActive: false}
            let provider = await this.providerRepository.editProvider(id, body, req?.user?.companyId);
            
            res.json(provider);
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
