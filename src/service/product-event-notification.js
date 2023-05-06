const Queue = require("bull");
const logger = require('../logger/systemLogger')
const ProductSubscriptionRepository = require('../repositories/productSubscription-repository')
const productSubscriptionRepository = new ProductSubscriptionRepository()
const {notificationType} = require('../constants');
const ProductRepository = require("../repositories/product-repository");
const CompanyRepository = require("../repositories/company-repository");
const productRepository = new ProductRepository()
const companyRepository = new CompanyRepository()
const sendinblueApiKey = process.env.SENDIN_BLUE_API_KEY;
const { default: axios } = require('axios');

async function notifyProductEvent(usersToNotify, notificationType, productId, productName, companyName, eventDate, json) {
    try {
        const options = {
            timeZone: "UTC",
            timeZoneName: "short",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        };

        const formattedDate = eventDate.toLocaleDateString("en-US", options)

        let sendingTo = Object.values(usersToNotify).map(user => ({ email: user.email}));

        let body = {
            to: sendingTo,
            templateId: 2,
            params: {
                company_name: companyName,
                notification_type: notificationType,
                product_id: productId,
                product_name: productName,
                product_id: productId,
                description: JSON.stringify(json),
                date: formattedDate
            }
        };
        
        let sendinblueUrl = 'https://api.sendinblue.com/v3/smtp/email';
        let headers = { headers: {
            'api-key': sendinblueApiKey,
            'Content-Type': 'application/json'
        } }

        axios.post(sendinblueUrl, body, headers)
            .then(async response => {
                if (response.status == 200 || response.status == 204 || response.status == 201) {
                    logger.logInfo(`Email for ${notificationType} product ${productId} sent.`)
                    return
                } else {
                    logger.logInfo(`Email for ${notificationType} product ${productId} sent.`)
                    return
                }
            })
            .catch(function (error) {
                logger.logError(`Email for ${notificationType} product ${productId} NOT sent.`, error)
                return
            });
    } catch (err) {
        logger.logError(`Email for ${notificationType} product ${productId} NOT sent.`, error)
        return
    }
}

module.exports.initProductEventNotification = async function () {
  var productEventQueue = new Queue("product-event-notification", process.env.REDIS_URL);
  
  productEventQueue.process(async (job, done) => {
    try {
      if (job.data) {
            try {
                logger.logInfo('product-event-notification: Will process job with data: ' + job.data)
                switch (job.data.notificationType) {
                    case notificationType.productSold:
                    case notificationType.productBought:
                        Object.values(job.data.productsForEvent).forEach(
                            async productEvent => {
                                try {
                                    let allSubscribers = await productSubscriptionRepository.getAllUsersSubscribedTo(productEvent.productId)
                                    let product = await productRepository.getProduct(productEvent.productId, productEvent.companyId)
                                    let company = await companyRepository.getCompany(productEvent.companyId)
    
                                    notifyProductEvent(allSubscribers, job.data.notificationType, productEvent.productId, product.name, company.name, new Date(productEvent.createdAt), productEvent)
                                } catch (err) {
                                    logger.logError(`Could not notify users from ${job.data.notificationType}: ${productEvent.productId} id of Item: ${productEvent.productId}`)
                                }
                            }
                        )
                        done();  
                        break;
                    default:
                        logger.logError('Errror in product-event-notification notification type: ' + job.notificationType)
                        done(); 
                    break;
                }
            } catch (err) {
                logger.logInfo('product-event-notification:Error when trying to process data in job...' + err.message)
                done(Error('Error when trying to process data in job...'));    
            }
      } else {
          logger.logInfo('product-event-notification:No data in job...')
          done(Error('No data in job...'));
      }
    } catch (err) {
      logger.logError(`product-event-notification:${err.message}`, err);
      done(Error(err.message));
    }
  })
};
