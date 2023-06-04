const Queue = require("bull");
const SalesReportRepository = require("../repositories/saleReport-repository")
const logger = require('../logger/systemLogger')

module.exports.initSalesReportQueue = async function () {
  var eventQueryQueue = new Queue("sale-queue", process.env.REDIS_URL);
  var salesReportRepository = new SalesReportRepository();
  eventQueryQueue.process(async (job, done) => {
    try {
      if (job.data) {
            try {
                logger.logInfo('sales-queue: Will process job with data: ' + job.data)

                let allSalesReported = salesReportRepository.upsertSalesReport(job.data)

                logger.logInfo('sales-queue: Processed data: ' + JSON.stringify(allSalesReported))
                done();   
            } catch (err) {
                logger.logInfo('sales-queue:Error when trying to process data in job...' + err.message)
                done(Error('Error when trying to process data in job...'));    
            }
      } else {
          logger.logInfo('sales-queue:No data in job...')
          done(Error('No data in job...'));
      }
    } catch (err) {
      logger.logError(`sales-queue:${err.message}`, err);
      done(Error(err.message));
    }
  })
};
