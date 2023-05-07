require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const ProductPurchaseRepository = require('../repositories/productPurchase-repository');
var logger = require("../logger/systemLogger");
const SaleReportRepository = require('../repositories/saleReport-repository');
const sendinblueApiKey = process.env.SENDIN_BLUE_API_KEY;
const { createCanvas, Canvas } = require('canvas');
const Chart = require('chart.js');
const { ChartJSNodeCanvas, MimeType } = require('chartjs-node-canvas');
const { default: axios } = require('axios');

module.exports = class purchaseController {
    constructor() {
        this.productPurchaseRepository = new ProductPurchaseRepository();
        this.saleReportRepository = new SaleReportRepository();
    }

    async sendReportEmailForUser(req, res, next) {
        try{
            if (!req?.params?.companyId) {
                return next(new RestError('Parameter in url required: companyId', 400));    
            }

            if (!req?.user?.email) {
                return next(new RestError('Email not registered for user', 400));    
            }

            let salesReport = await this.saleReportRepository.getTopSalesReport(req.params.companyId);
            let productPurchases = await this.productPurchaseRepository.getTopSalesReport(req.params.companyId);

            await this.generateSendEmailChartForSales(salesReport, req.user.email, res, next)
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async generateSendEmailChartForSales(productSales, email, res, next) {
        const width = 400; // Width of the chart image
        const height = 400; // Height of the chart image
        const canvas = createCanvas(width, height);
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
            canvas: canvas, 
            width: width, 
            height: height 
        }, 'image/png');
    
        const labels = productSales.map((product) => 
                product.productId
        )
        const values = productSales.map((product) => product.totalSales)
        const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
        const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;
        const colors = values.map(() => randomRGB())
    
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: '',
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors,
                }
            ]
        };
    
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false
        };
    
        const chartConfiguration = {
            type: 'pie',
            data: chartData,
            options: chartOptions
        };
    
        // Convert the chart to HTML
        
        const image = (await chartJSNodeCanvas.renderToBuffer(chartConfiguration)).toString('base64');
        
            
        // Construct the email template with the chart
        const emailTemplate = `<html><body><h1>Chart Example</h1><p>...</p></body></html>`;
    
        // Send the email using Sendinblue 
        let data = {
            to: [{ email: email }],
            sender: { 
                name: "Company 1",
                email: 'cuentaincognita2016@gmail.com' 
            },
            subject: 'Sales Chart!',
            htmlContent: emailTemplate,
            attachment: [
                { 
                    content: image, 
                    name: 'mypng.png' 
                }
            ]
        };
    
        let sendinblueUrl = 'https://api.sendinblue.com/v3/smtp/email';
        let headers = { headers: {
                'api-key': sendinblueApiKey,
                'Content-Type': 'application/json'
            } 
        }

        axios.post(sendinblueUrl, data, headers)
            .then(async response => {
                if (response.status == 200 || response.status == 204 || response.status == 201) {
                    res.status(204);
                    res.json();
                } else {
                    this.handleRepoError(Error('Error sending registration email: ' + response.data), next);
                }
            })
            .catch(function (error) {
                return next(new RestError(error.message, error.response.status));
            });
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