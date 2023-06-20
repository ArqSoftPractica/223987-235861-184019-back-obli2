const Queue = require("bull");
const PurchaseReportRepository = require("../repositories/purchaseReport-repository");
const logger = require('../logger/systemLogger')

module.exports.initPurchasesReportQueue = async function () {
  var eventQueryQueue = new Queue("purchases-report-queue", process.env.REDIS_URL);
  var purchaseReportRepository = new PurchaseReportRepository();
  eventQueryQueue.process(async (job, done) => {
    try {
      if (job.data) {
            try {
                logger.logInfo('purchases-report-queueservice: Will process job with data: ' + job.data)

                let allPurchasesReported = purchaseReportRepository.upsertPurchasesReport(job.data)

                logger.logInfo('purchases-report-queueservice: Processed data: ' + JSON.stringify(allPurchasesReported))
                done();   
            } catch (err) {
                logger.logInfo('purchases-report-queueError when trying to process data in job...' + err.message)
                done(Error('Error when trying to process data in job...'));    
            }
      } else {
          logger.logInfo('purchases-report-queueNo data in job...')
          done(Error('No data in job...'));
      }
    } catch (err) {
      logger.logError(`purchases-report-queue:${err.message}`, err);
      done(Error(err.message));
    }
  })
};
