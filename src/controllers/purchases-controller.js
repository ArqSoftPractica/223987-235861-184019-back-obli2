require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const PurchaseRepository = require('../repositories/purchase-repository');
const CompanyRepository = require('../repositories/company-repository');
const ProductRepositroy = require('../repositories/product-repository');
const ProductPurchaseRepository = require('../repositories/productPurchase-repository');
const ProviderRepository = require('../repositories/provider-repository');
const Bull = require('bull');
const {notificationType} = require('../constants')
var logger = require("../logger/systemLogger")

module.exports = class purchaseController {
    constructor() {
        this.purchaseRepository = new PurchaseRepository();
        this.companyRepository = new CompanyRepository();
        this.productRepository = new ProductRepositroy();
        this.productPurchaseRepository = new ProductPurchaseRepository();
        this.providerRepository = new ProviderRepository();
        this.productEventNotification = new Bull("product-event-notification", process.env.REDIS_URL);
    }

    async createPurchase(req, res, next) {
        try{
            if (!req?.user?.companyId) {
                return next(new RestError('companyIdRequired', 400));  
            }
            
            req.body.companyId = req?.user?.companyId

            if(!req.body.providerId) {
                return next(new RestError('providerId required.', 400));
            }

            if (!req.body.productsPurchased || !Array.isArray(req.body.productsPurchased)) {
                return next(new RestError('productsPurchased required. You need to send an array of products please.', 400));    
            }

            let company = await this.companyRepository.getCompany(req.user.companyId)

            if (!company) {
                return next(new RestError('Company doesn\'t exist.', 404));   
            }

            let provider = await this.providerRepository.getProvider(req.body.providerId)

            if(!provider) {
                return next(new RestError('Provider doesn\'t exist.', 404));
            }

            try {
                let purchasCreated = await this.purchaseRepository.createPurchase(req.body);
                try {
                    let productsPurchased = await this.productPurchaseRepository.createProductsPurchase(req.body.productsPurchased, company.id, purchasCreated.id);            
                    let allPurchaseData = {
                        id: purchasCreated.id,
                        date: purchasCreated.date,
                        companyId: purchasCreated.companyId,
                        providerId: purchasCreated.providerId,
                        totalCost: purchasCreated.totalCost,
                        updatedAt: purchasCreated.updatedAt,
                        createdAt: purchasCreated.createdAt,
                        productsPurchased: productsPurchased,
                    }

                    try {
                        this.productEventNotification.add(
                            {
                                notificationType: notificationType.productBought,
                                productsForEvent: productsPurchased
                            }
                        );
                    } catch (err) {
                        logger.logError("Error sendign product-event-notification", err)
                    }

                    let addingProductsToStock = await this.productRepository.changeProductsStock(req.body.productsPurchased, true)
                    res.json(allPurchaseData);
                } catch (err) {
                    let purchaseDeleted = await this.purchaseRepository.deletePurchase(purchasCreated.id);
                    this.handleRepoError(err, next)    
                }
            } catch (err) {
                this.handleRepoError(err, next)
            }
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getPurchase(req, res, next) {
        const id = req.params.id;
        if (!id) {
            return next(new RestError('id required', 400));    
        }
        try{
            let purchase = await this.purchaseRepository.getPurchase(id, req?.user?.companyId);
            if (purchase) {
                let productPurchases = await this.productPurchaseRepository.getProductsPurchasesFromPurchase(id)
                purchase.productPurchases = productPurchases
                res.json(purchase);
            } else {
                return next(new RestError(`purchase not found`, 404));    
            }
        }catch(err){
            this.handleRepoError(err, next)
        }
    }

    async getPurchases(req, res, next) {
        try {
            let purchases = await this.purchaseRepository.getPurchases(req?.user?.companyId);
            for (let i = 0; i < purchases.length; i++) {
                let productPurchases = await this.productPurchaseRepository.getProductsPurchasesFromPurchase(purchases[i].id)
                purchases[i].productPurchases = productPurchases;
            }
            res.json(purchases);
        } catch (err) { 
            this.handleRepoError(err, next)
        }
    }

    async getPurchasesPerProvider(req, res, next) {
        try{
            const id = req.params.id;
            const from = req.query.from;
            const to = req.query.to;
            let purchases = await this.purchaseRepository.getPurchasesPerProvider(id, from, to);
            
            res.json(purchases);
        }catch(err){
            this.handleRepoError(err, next)
        }
    }

    async handleRepoError(err, next) {
        //error de base de datos.
        let http_code = (err.code == 11000)?409:400;
        return next(new RestError(err.message, http_code));
    }
}