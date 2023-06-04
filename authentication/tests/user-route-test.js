const crypto = require('crypto');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const constants = require('../src/constants')
require('dotenv').config({ path: `${__dirname}/.env.${process.env.NODE_ENV}` });
const server = require('../index')

describe('User Routes Test', function() {
    let sandbox;
    let req, res, next;
    let companyValue;
    let userStub;
    
    before(() => {
        req = { body: userStub };
        res = { json: sinon.stub() };
        next = sinon.stub();
        sandbox = sinon.createSandbox();
    })

    after(() => {
        // app.get.restore()
        // app.post.restore()
    })

    beforeEach(function () {
        companyValue = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            apiKey: crypto.randomUUID(),
        };
        
        userStub = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            username: crypto.randomBytes(4).toString('hex'),
            userName: crypto.randomBytes(4).toString('hex'),
            email: `${crypto.randomBytes(4).toString('hex')}@${crypto.randomBytes(4).toString('hex')}.com`,
            password: crypto.randomUUID(),
            companyId: companyValue.id,
            companyName: companyValue.name,
            role: constants.roles.admin,
            createdAt:new Date(),
            updatedAt:new Date(),
        };
    });

    afterEach(function () {
        sinon.restore()
        sandbox.restore();
    });

    describe('POST /users', function() {
        it('should call the createUser method and return a 200 response', function() {
            return new Promise(function(resolve) {
                chai.request(server)
                .post('/users')
                .send(userStub)
                .end((err, res) => {
                    expect(res.status).equals(200);
                    //Chequear que el usuario sea el correcto generado por el stub
                    resolve();
                });
            });
        });
    });

    describe('POST /login', function() {
        it('should call the login method and return a 200 response', function() {
            return new Promise(function(resolve) {
                chai.request(server)
                .post('/users')
                .send(userStub)
                .then((err, res) => {
                    chai.request(server)
                        .post('/login')
                        .send({
                            "email": userStub.email,
                            "password": userStub.password
                          })
                        .end(function(err, res) {
                            expect(res.status).equals(200);
                            expect(res.body.token).not.equal(undefined);
                            expect(res.body.user.userName).equals(userStub.userName);
                            expect(res.body.user.email).equals(userStub.email);
                            resolve();
                        });
                });
            });
        });
    });
});