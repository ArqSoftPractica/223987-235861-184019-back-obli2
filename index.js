require('newrelic');
const express = require('express');
var cors = require('cors')
const app = express();
const RestError = require('./src/controllers/rest-error')
require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });

app.use(express.json());
const dbconnection  = require('./src/db/connection/connection');
const user = require('./src/routes/user');
const company = require('./src/routes/company');
const provider = require('./src/routes/provider');
const product = require('./src/routes/product');
const sale = require('./src/routes/sale');
const salesReport = require('./src/routes/saleReport');
const purchase = require('./src/routes/purchase');
const health = require('./src/routes/health');
const reports = require('./src/routes/reports');

var salesReportQueue = require("./src/service/sales-bull-queue-service");
var productEventNotification = require("./src/service/product-event-notification");

var logger = require("./src/logger/systemLogger")

app.use(cors())
app.use(user)
app.use(company)
app.use(provider)
app.use(product)
app.use(purchase)
app.use(sale)
app.use(salesReport)
app.use(health)
app.use(reports)

dbconnection.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.use((err,req ,res, next) => {
    let errorStatus = err instanceof RestError? err.status: 500
    let logErrorMessage = `Error on endpoint: ${req.originalUrl} Error Status: ${errorStatus} Error Message:${err.message}`
    if (req.user && req.user._id) {
        logErrorMessage = `USER: ${req.user._id} ` + logErrorMessage
    }
    logger.logError(logErrorMessage, err)
    res.status(errorStatus);
    res.json({error:err.message});
});

const server = app.listen(process.env.PORT ?? 3000, function(){
    const logText = `Listening to port ${process.env.PORT ?? 3000}`
    logger.logInfo(logText)
});

(async() => {
  await salesReportQueue.initSalesReportQueue();
})();

(async() => {
  await productEventNotification.initProductEventNotification();
})();

module.exports = server;