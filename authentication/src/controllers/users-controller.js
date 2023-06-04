require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const express   = require('express');
const Router    = express.Router();
const RestError = require('./rest-error');
const UserRepository = require('../repositories/user-repository')
const CompanyRepository = require('../repositories/company-repository');
const fs = require('fs');
const path = require("path");
const jwt = require('jsonwebtoken'); 
const crypto = require('crypto');
const RedisClient = require('../db/connection/redis-connection');
const { default: axios } = require('axios');
const sendinblueApiKey = process.env.SENDIN_BLUE_API_KEY;
const emailTemplateId = 1;
const constants = require("../constants")

module.exports = class UsersController {
    constructor() {
        this.userRepository = new UserRepository();
        this.companyRepository = new CompanyRepository();
    }

    async sendRegisterLink(req, res, next) {
        const email = req.body.email;
        
        if (!req.user) {
            return next(new RestError('User needs to be logged in and be part of a company', 400));  
        }
        
        let companyId = req.user.companyId;
        const roleToAssign = req.body.role;
        
        if(!email){
            return next(new RestError('Recipient email required', 400));    
        }

        if(!companyId){
            return next(new RestError('User needs to be be part of a company', 400));  
        }

        if(!roleToAssign){
            return next(new RestError('role required', 400));     
        }

        try {
            let company = await this.companyRepository.getCompany(companyId);

            if (!company) {
                return next(new RestError('No company with the suggested companyId', 400));     
            }

            const token = crypto.randomBytes(32).toString('hex');
            const currentDate = new Date(); 
            const oneWeekInSeconds = 7 * 24 * 60 * 60; 
            const expirationTime = new Date(currentDate.getTime() + oneWeekInSeconds * 1000);
            const userData = { companyId: companyId, email: email, expirationDate: expirationTime, role: roleToAssign };
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            RedisClient.set(hashedToken, JSON.stringify(userData));
            RedisClient.expire(hashedToken, oneWeekInSeconds);
            
            const registrationUrl = `${process.env.REGISTER_LINK_BASE_URL}/register?companyName=${company.name}&token=${token}`;
            
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

            const formattedExpirationDate = expirationTime.toLocaleDateString("en-US", options)

            let body = {
                to: [{ email: email }],
                templateId: emailTemplateId,
                params: {
                    recipient_email: email,
                    company_name: company.name,
                    registration_link: registrationUrl,
                    valid_through: formattedExpirationDate
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
                        res.status(204);
                        res.json();
                    } else {
                        this.handleRepoError(Error('Error sending registration email: ' + response.data), next);
                    }
                })
                .catch(function (error) {
                    return next(new RestError(error.message, error.response.status));
                });
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async register(req, res, next) {
        try {
            if (!req.body) {
                return next(new RestError('No body for registration', 400))
            }

            const token = req.body?.token;
        
            if (!token) {
                return next(new RestError('Register token required in body. Email should have had that token', 400));
            }
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            let data = await RedisClient.get(hashedToken);

            if (req.body.role == constants.roles.admin && req.body.roles.employee) {
                return next(new RestError('Only ADMIN or EMPLOYEE users are able to register through this method. Please ask the admin that sent the invite to send it again correctly.', 400))
            }

            if (data) {
                const tokenData = JSON.parse(data);
                if (tokenData) {
                    let company = this.companyRepository.getCompany(tokenData.companyId)
                    if (company) {
                        req.body.companyName = undefined
                        if (tokenData.role && tokenData.companyId) {
                            try {
                                req.body.role = tokenData.role
                                req.body.companyId = tokenData.companyId;
                    
                                let userCreated = await this.userRepository.createUser(req.body);
                    
                                req.body.password = undefined
                                //Delete token so that the invite doesn't work anymore
                                RedisClient.del(hashedToken);
                                res.json(userCreated);
                            } catch (err) {
                                this.handleRepoError(err, next)
                            }
                        } else {
                            this.clearTokenFromRedisSendError(hashedToken, next);
                        }
                    } else {
                        this.clearTokenFromRedisSendError(hashedToken, next);
                    }
                } else {
                    this.clearTokenFromRedisSendError(hashedToken, next);
                }
            } else {
                this.clearTokenFromRedisSendError(hashedToken, next);
            }
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    clearTokenFromRedisSendError(hashedToken, next) {
        //deleting token for security
        RedisClient.del(hashedToken);
        return next(new RestError('Invald, expired or already used registration link', 400));
    }

    async login(req, res, next) {
        if (!req.body) {
            return next(new RestError('Body required', 400));  
        }

        const email = req.body.email;
        let pwd = req.body.password;
        
        if(!email){
            return next(new RestError('email required', 400));  
        }
        
        if(!pwd){
            return next(new RestError('password required', 400));  
        }

        try {
            let userReturned = await this.userRepository.getUserByEmailPassword(email, pwd);
            if (userReturned) {
                userReturned.password = undefined;
                if (!userReturned.userId) {
                    userReturned.userId = userReturned._id
                }
                
                const PRIVATE_KEY  = fs.readFileSync(path.resolve(__dirname, '../private.key'), 'utf8');
                const jsonFromUser = JSON.stringify(userReturned);
                const token = jwt.sign(jsonFromUser, PRIVATE_KEY, {algorithm:  "RS256"});
                res.json({
                    token:token,
                    user: userReturned
                });
            } else {
                return next(new RestError(`Either the user doesn\'t exist or user and password don\'t match`, 401));    
            }
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async getUser(req, res, next) {
        const id = req.params.id;
        if (!id) {
            return next(new RestError('id required', 400));   
        }

        try {
            let companyId = req.user?.companyId
            let userReturned = await this.userRepository.getUser(id, companyId);
            if (userReturned) {
                userReturned.password = undefined;
                res.json(userReturned);
            } else {
                return next(new RestError(`User not found`, 404));    
            }
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }
    
    async getUsers(req, res, next) {
        try {
            let companyId = req.user?.companyId
            let users = await this.userRepository.getUsers(companyId);
            
            res.json(users);
        } catch (err) {
            this.handleRepoError(err, next)
        }
    }

    async createUser(req, res, next) {
        try {
            if (!req.body) {
                return next(new RestError(`Please send the user information`, 400));    
            }

            if (req.body.role != constants.roles.admin) {
                return next(new RestError(`Only admins are allowed to be created via this method. To create other roles, please ask an admin of the company you want to send you an invite, or if the company is not created yet, please create the company and invite other ADMIN or EMPLOYEE users.`, 400));    
            }

            let companyName = req.body.companyName;
            let company = await this.companyRepository.getCompanyByName(companyName);
            let apiKey = undefined
            
            if (company) {
                return next(new RestError(`Company with that name already registered:\n\n  • Select a new name to create a Company.\n\n    • Ask a Company Admin send you an invite link or contact support.`, 400));    
            } else {
                apiKey = crypto.randomBytes(32).toString('hex');
                company = await this.companyRepository.createCompany(companyName, apiKey);
            }

            req.body.companyId  = company.id;
            try {
                let userCreated = await this.userRepository.createUser(req.body);
                req.body.companyApiKey = apiKey
                
                res.json({
                    id: userCreated.id,
                    userName: userCreated.userName,
                    password: userCreated.password,
                    email: userCreated.email,
                    companyId: userCreated.companyId,
                    role: userCreated.role,
                    updatedAt: userCreated.updatedAt,
                    createdAt: userCreated.createdAt,
                    companyApiKey: apiKey
                });
            } catch (err) {
                await this.companyRepository.deleteCompany(companyName, apiKey);
                this.handleRepoError(err, next)    
            }
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
