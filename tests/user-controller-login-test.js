const crypto = require('crypto');
const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const User = require("../src/db/models/users");
const UserRepository = require("../src/repositories/user-repository");
const constants = require("../src/constants");
const db = require('../src/db/connection/connection');
const UserController = require('../src/controllers/users-controller');
const CompanyRepository = require('../src/repositories/company-repository');
const RestError = require('../src/controllers/rest-error')

const stubValueUnHashedPassword = 'testPassword1*'
const stubHashedPassword = "c67100c65e3ab96647156d991a6790ed6fd7d47c2585d0f7441ecf5931a66931"

describe('Login tests', () => {
    let sandbox;
    let next;
    let res, userController;
    let userRepository;
    let companyRepository;
    let getUserByEmailPasswordStub;
    let userStub;
    let companyValue;
    
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
            password: stubHashedPassword,
            companyId: companyValue.id,
            companyName: companyValue.name,
            role: constants.roles.admin,
            createdAt:new Date(),
            updatedAt:new Date(),
        };

        req = { body: {email: "some email", password: "testpassword*"} };
        res = { json: sinon.stub() };
        next = sinon.stub();
        userRepository = new UserRepository();
        userController = new UserController();
        userController.userRepository = userRepository;
        userController.companyRepository = companyRepository;
        sandbox = sinon.createSandbox();
        getUserByEmailPasswordStub = sandbox.stub(userRepository, 'getUserByEmailPassword');
    });

    afterEach(function () {
        sandbox.restore();
        sinon.restore();
    });

    it('should return a 400 error if no body is provided', async () => {
        await userController.login({ ...req, body: null }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Body required');
    });
  
    it('should return an error if req.body is null', async () => {
        req.body = null;
        await userController.login(req, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Body required');
    });
  
    it('should return an error if req.body.email is null', async () => {
        req.body.email = null;
    
        await userController.login(req, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('email required');
    });
  
    it('should return an error if req.body.password is null', async () => {
        req.body.password = null;
    
        await userController.login(req, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('password required');
    });
  
    it('should return an error if the user does not exist or the password is incorrect', async () => {
        getUserByEmailPasswordStub.resolves(undefined);
    
        await userController.login(req, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(401);
    });

    it('should return a token and user object if the login is successful', async () => {
        getUserByEmailPasswordStub.resolves(userStub);
        await userController.login(req, res, next);
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.have.property('token');
        expect(res.json.args[0][0]).to.have.property('user');
        expect(res.json.args[0][0].user).to.deep.equal(userStub);
        expect(res.json.args[0][0].token).to.be.a('string');
    });

    it('should return a token and user object if the login is successful', async () => {
        getUserByEmailPasswordStub.resolves(userStub);
        await userController.login(req, res, next);
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.have.property('token');
        expect(res.json.args[0][0]).to.have.property('user');
        expect(res.json.args[0][0].user).to.deep.equal(userStub);
        expect(res.json.args[0][0].token).to.be.a('string');
    });

    it('should handle getUserByEmailPasswordStub failure', async () => {
        getUserByEmailPasswordStub.rejects(new Error('Repository error'));
        await userController.login(req, res, next);
        expect(getUserByEmailPasswordStub.calledOnce).to.be.true;
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Repository error');
    });    
});
