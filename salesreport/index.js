require('newrelic');
const express = require('express');
var cors = require('cors')
const app = express();
const RestError = require('./src/controllers/rest-error')
require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });

app.use(express.json());
const dbconnection  = require('./src/db/connection/connection');
const salesReport = require('./src/routes/saleReport');
const reports = require('./src/routes/reports');

var salesReportQueue = require("./src/service/sales-bull-queue-service");
var logger = require("./src/logger/systemLogger")

app.use(cors())
app.use(salesReport)
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

module.exports = server;