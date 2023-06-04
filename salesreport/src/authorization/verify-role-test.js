const express   = require('express');
const app       = express();
const rolePermissions = require("../constants");
const logger = require('../logger/systemLogger');

async function verifyTestRole(req, res, next) {
        let role = req.user.role
        
        if (role) {
            if (role == rolePermissions.roles.test) {
                return next();
            } else {
                const errorMessage ="Unauthorized. You do not have the correct permissions for this action."
                logger.logError(errorMessage);
                return res.status(403).json({error: errorMessage});
            }
        } else {
            const errorMessage = "Unauthorized. User does not have a role."
            logger.logError(errorMessage);
            return res.status(403).json({error: errorMessage});
        }
}
  
module.exports = verifyTestRole;
