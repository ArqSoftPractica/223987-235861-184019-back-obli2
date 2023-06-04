const express   = require('express');
const app       = express();
const logger = require('../logger/systemLogger');

async function verifyCompanyId(req, res, next) {
    try {
        let companyId = req.user?.companyId;
        const paramCompanyId= req.params?.companyId;
        if (paramCompanyId && companyId == paramCompanyId) {
            try {                
                return next();
            } catch (error) {
                logger.logError(error.message, error);
                return res.status(401).send({ error: error.message });
            }
        } else {
            let errorMessage = 'You do not have permissions for this company.'
            logger.logError(errorMessage);
            return res.status(401).send({ error:errorMessage });
        }
    } catch (error) {
        let errorMessage = `Please send api key in the header in form of: x-api-key. Error: ${error.message} ==> Error: 401`
        logger.logError(errorMessage, error);
        return res.status(401).send({ error: errorMessage });
    }
}

module.exports = verifyCompanyId;