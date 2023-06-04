const express   = require('express');
const app       = express();
const jwt = require('jsonwebtoken'); 
const fs = require('fs');
const path = require("path");
const logger = require('../logger/systemLogger');

async function verifyToken(req, res, next) {
    // API client sends Authorization: Bearer token 
    try {
        let token = req.headers['authorization'].split(' ')[1];
        if (token) {
            try {
                const PUBLIC_KEY  = fs.readFileSync(path.resolve(__dirname, './public.key'), 'utf8');
                jwt.verify(token, PUBLIC_KEY, {algorithm:  "RS256"}, function(err, usr){ 
                    if(err){
                        logger.logError(err.message, err);
                        return res.status(401).send({ error:err.message});
                    }
                    else{
                        //Add user for all subsequent calls
                        req.user = usr;
                        return next();
                    }
                }); 
            } catch (error) {
                logger.logError(error.message, error);
                return res.status(401).send({ error: error.message });
            }
        } else {
            let errorMessage = 'No token provided. Auth token is required.'
            logger.logError(errorMessage);
            return res.status(401).send({ error:errorMessage });
        }
    } catch (error) {
        let errorMessage = `Please send auth token in the header in form of: Bearer token. Error: ${error.message} ==> Error: 401`
        logger.logError(errorMessage, error);
        return res.status(401).send({ error: errorMessage });
    }
}

module.exports = verifyToken;