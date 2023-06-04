require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const Bull = require('bull');
const SaleRepository = require('../repositories/sale-repository');
const ProductRepositroy = require('../repositories/product-repository');
const ProductSaleRepository = require('../repositories/productSale-repository');
const CompanyRepository = require('../repositories/company-repository');
const {notificationType} = require('../constants')
var logger = require("../logger/systemLogger")
const schedule = require('node-schedule');
const moment = require('moment-timezone');

module.exports = class saleController {
    constructor() {
        this.productRepository = new ProductRepositroy();
        this.saleRepository = new SaleRepository();
        this.productSaleRepository = new ProductSaleRepository();
        this.comanyRepository = new CompanyRepository();
        this.salesQueue = new Bull("sale-queue", process.env.REDIS_URL);
        this.productEventNotification = new Bull("product-event-notification", process.env.REDIS_URL);
    }

    async executeSaleJob(body, companyId) {
        try {
            await this.executeSale(body, companyId)
        } catch (err) {
            logger.logError('Error In Scheduled Sale execution', err)
        }
    }

    executeSale = async (saleBody, companyId) => {
        try {
            let saleCreated = await this.saleRepository.createSale(saleBody);
            try {
                let productsSold = await this.productSaleRepository.createProductsSale(saleBody.productsSold, companyId, saleCreated.id);            
                let allSaleData = {
                    id: saleCreated.id,
                    date: saleCreated.date,
                    companyId: saleCreated.companyId,
                    totalCost: saleCreated.totalCost,
                    clientName: saleCreated.clientName,
                    updatedAt: saleCreated.updatedAt,
                    createdAt: saleCreated.createdAt,
                    productsSold: productsSold,
                }
                try {
                    this.salesQueue.add(productsSold);
                } catch (err) {
                    logger.logError("Error sendign salesQueue", err)
                }
                
                try {
                    this.productEventNotification.add(
                        {
                            notificationType: notificationType.productSold,
                            productsForEvent: productsSold
                        }
                    );
                } catch (err) {
                    logger.logError("Error sendign product-event-notification", err)
                }
    
                return allSaleData
            } catch (err) {
                let saleDeleted = await this.saleRepository.deleteSale(saleCreated.id);
                let addProductStockBack = await this.productRepository.changeProductsStock(saleBody.productsSold, true)
                throw err   
            }
        } catch (err) {
            let addProductStockBack = await this.productRepository.changeProductsStock(saleBody.productsSold, true)
            throw err
        }
    };

    async createSale(req, res, next) {
        try{
            if (!req?.user?.companyId) {
                return next(new RestError('companyIdRequired', 400));    
            }

            req.body.companyId = req?.user?.companyId

            if (!req.body.productsSold || !Array.isArray(req.body.productsSold)) {
                return next(new RestError('productsSold required. You need to send an array of products please.', 400));  
            }

            let company = await this.comanyRepository.getCompany(req.user.companyId)

            if (!company) {
                return next(new RestError('Company doesn\'t exist.', 404));
            }

            let removingProductsFromStock = await this.productRepository.changeProductsStock(req.body.productsSold, false)
            if (req.query.scheduledFor) {
                const parsedScheduledFor = Date.parse(req.query.scheduledFor);
                if (req.query.timeZone && moment.tz.zone(req.query.timeZone) == null) {
                    throw Error('Incorrect timezone')
                }

                if (isNaN(parsedScheduledFor)) {
                    throw Error('Incorrect date format for scheduling a sale')
                } else {
                    const nowDate = new Date();
                    const dateToSchedule = moment.tz(req.query.scheduledFor, req.query.timeZone ?? 'America/Montevideo').toDate();
                    if (nowDate > dateToSchedule) {
                        throw Error('Date cannot be in the past')
                    }
                    //TODO: save this data in db in case service goes down, it can get all jobs rescheduled back again
                    schedule.scheduleJob(dateToSchedule, () => this.executeSaleJob(req.body, company.id));
                    
                    this.notifyStockZeroIfApplicable(req.body.productsSold, company.id)
                    
                    res.status(204);
                    return res.json();   
                }
            } else {
                let allSaleData = await this.executeSale(req.body, company.id);

                this.notifyStockZeroIfApplicable(req.body.productsSold, company.id)

                return res.json(allSaleData);
            }
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async notifyStockZeroIfApplicable(productsSold, companyId) {
            const productIdsStockChanged = Object.values(productsSold).map(item => item.id)

            let productsAtZero = await this.productRepository.getProductsWithZeroStockFrom(
                companyId,
                productIdsStockChanged
            )

            if (productsAtZero && productsAtZero.length > 0) {
                const prodForEvent = Object.values(productsAtZero).map(item =>  
                    ({
                        productId: item.id,
                        companyId: item.companyId
                    })
                )
                try {
                    this.productEventNotification.add({
                        notificationType: notificationType.noStock,
                        productsForEvent: prodForEvent
                    });
                } catch (err) {
                    logger.logError("Error sendign product-no-stock-notification", err)
                }
            }
    }

    async getSale(req, res, next) {
        const id = req.params.id;
        if (!id) {
            return next(new RestError('id required', 400));    
        }
        let companyId = undefined;
        if (req.user?.companyId) {
            companyId = companyId;
        }
        try{
            let sale = await this.saleRepository.getSale(id);
            if (sale) {
                let productSales = await this.productSaleRepository.getProductSalesFromSale(id, companyId)
                let totalSaleInfo = {
                    id: sale.id,
                    date: sale.date,
                    companyId: sale.companyId,
                    totalCost: sale.totalCost,
                    clientName: sale.clientName,
                    updatedAt: sale.updatedAt,
                    createdAt: sale.createdAt,
                    productsSold: productSales,
                }
                res.json(totalSaleInfo);
            } else {
                return next(new RestError(`sale not found`, 404));    
            }
        }catch(err){
            this.handleRepoError(err, next)
        }
    }

    async getSales(req, res, next) {
        try {
            let sales = await this.saleRepository.getSales(req.user?.companyId);
            
            res.json(sales);
        } catch (err) { 
            this.handleRepoError(err, next)
        }
    }

    async getSalesByCompanyWithSaleProducts(req, res, next) {
        try {
            let user = req.user
            if (!user) {
                return next(new RestError(`Invalid token`, 404));    
            }

            if (!user.companyId) {
                return next(new RestError(`Invalid token`, 404));    
            }
            let startFilterDate = undefined
            let endFilterDate = undefined
            if (req.query.startDate) {
                const parsedStartDate = Date.parse(req.query.startDate);
                const parsedEndDate = Date.parse(req.query.endDate);
                if (!isNaN(parsedStartDate) && !isNaN(parsedEndDate)) {
                    startFilterDate = new Date(req.query.startDate)
                    endFilterDate = new Date(req.query.endDate)
                }
            }

            let offset = parseInt(req.query.offset, 10);
            if (isNaN(offset)) {
                offset = undefined
            }

            let pageSize = parseInt(req.query.pageSize, 10);
            if (isNaN(offset)) {
                pageSize = undefined
            }

            let sales = await this.saleRepository.getSalesByCompanyWithSaleProducts(
                user.companyId, 
                offset, 
                pageSize,
                startFilterDate,
                endFilterDate
            )
            
            res.json(sales);
        } catch (err) { 
            this.handleRepoError(err, next)
        }
    }

    async getProductSaleFromCompanyForRange(req, res, next) {
        try {
            let user = req.user
            if (!user) {
                return next(new RestError(`Invalid token`, 404));    
            }

            if (!user.companyId) {
                return next(new RestError(`Invalid token`, 404));    
            }
            
            let startFilterDate = undefined
            let endFilterDate = undefined
            
            if (req.query.startDate) {
                const parsedStartDate = Date.parse(req.query.startDate);
                const parsedEndDate = Date.parse(req.query.endDate);
                if (!isNaN(parsedStartDate) && !isNaN(parsedEndDate)) {
                    startFilterDate = new Date(req.query.startDate)
                    endFilterDate = new Date(req.query.endDate)
                }
            }

            let productSales = await this.productSaleRepository.getProductSaleFromCompanyForRange(
                user.companyId, 
                startFilterDate,
                endFilterDate
            )
            res.json(productSales);
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
