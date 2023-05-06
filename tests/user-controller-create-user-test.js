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

describe("Create User - Register an admin", function() {
    let sandbox;
    let next;
    let res, userController;
    let userRepository;
    let companyRepository;
    let getCompanyStub, createStub, createCompanyStub, deleteCompanyStub;
    let companyValue;
    let stubValue;
    let unhashedApiKey = "adb147c5-691c-4269-babe-0b6c8a963682";
    
    beforeEach(function () {
        companyValue = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            apiKey: unhashedApiKey,
        };

        stubValue = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            username: crypto.randomBytes(4).toString('hex'),
            userName: crypto.randomBytes(4).toString('hex'),
            email: `${crypto.randomBytes(4).toString('hex')}@${crypto.randomBytes(4).toString('hex')}.com`,
            password: stubHashedPassword,
            companyId: companyValue.id,
            companyName: companyValue.name,
            companyApiKey: unhashedApiKey,
            role: constants.roles.admin,
            createdAt:new Date(),
            updatedAt:new Date(),
        };
        req = { body: {} };
        res = { json: sinon.stub() };
        next = sinon.stub();
        userRepository = new UserRepository();
        companyRepository = new CompanyRepository();
        userController = new UserController();
        userController.userRepository = userRepository;
        userController.companyRepository = companyRepository;
        sandbox = sinon.createSandbox();
        getCompanyStub = sandbox.stub(companyRepository, 'getCompany');
        getCompanyByNameStub = sandbox.stub(companyRepository, 'getCompanyByName');
        createCompanyStub = sandbox.stub(companyRepository, 'createCompany');
        createStub = sandbox.stub(userRepository, 'createUser');
        deleteCompanyStub = sandbox.stub(companyRepository, 'deleteCompany');
    });

    afterEach(function () {
        sandbox.restore();
        sinon.restore();
    });

    it('should return a 400 error if no body is provided', async () => {
        await userController.createUser({ ...req, body: null }, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Please send the user information');
    });

    it('should return a 400 error if the user role is not admin', async () => {
        req.body.role = constants.roles.employee;
        await userController.createUser(req, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Only admins are allowed to be created via this method. To create other roles, please ask an admin of the company you want to send you an invite, or if the company is not created yet, please create the company and invite other ADMIN or EMPLOYEE users.');
    });

    it('should return a 400 error if a company with the same name already exists', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.resolves(companyValue);
        await userController.createUser(req, res, next);
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.contains('Company with that name already registered');
    });

    it('should create a new company and user if a company with the same name does not exist', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.resolves(undefined);
        createCompanyStub.resolves(companyValue)
        createStub.resolves(stubValue)
        await userController.createUser(req, res, next);
        expect(createStub.calledOnce).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0].id).to.deep.equal(stubValue.id);
        expect(res.json.args[0][0].userName).equal(stubValue.userName);
        expect(res.json.args[0][0].password).equal(stubHashedPassword);
        expect(res.json.args[0][0].email).equal(stubValue.email);
        expect(res.json.args[0][0].companyId).equal(companyValue.id);
        expect(res.json.args[0][0].role).equal(constants.roles.admin);
        expect(res.json.args[0][0].updatedAt).equal(stubValue.updatedAt);
        expect(res.json.args[0][0].createdAt).equal(stubValue.createdAt);
        expect(res.json.args[0][0].apiKey).to.not.equal(companyValue.apiKey);
    });

    it('should handle repository errors and return an appropriate response', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.resolves(undefined);
        createCompanyStub.resolves(companyValue)
        deleteCompanyStub.resolves(undefined)
        createStub.rejects(new Error('Repository error'));
        await userController.createUser(req, res, next);
        expect(createStub.calledOnce).to.be.true;
        expect(res.json.called).to.be.false;
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Repository error');
    });

    it('should handle database errors and return an appropriate response', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.resolves(undefined);
        createCompanyStub.resolves(companyValue)
        deleteCompanyStub.resolves(undefined)
        createStub.rejects({ code: 11000, message: 'Database error', errors: [{ message: 'Duplicate key error' }] });
        await userController.createUser(req, res, next);
        expect(createStub.calledOnce).to.be.true;
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(409);
        expect(next.args[0][0].message).to.equal('Duplicate key error');
    });

    it('should handle repository errors for getting company', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.rejects(new Error('Repository error'));
        await userController.createUser(req, res, next);
        expect(getCompanyByNameStub.calledOnce).to.be.true;
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Repository error');
    });

    it('should handle repository errors for deleting company', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.resolves(undefined);
        createCompanyStub.resolves(companyValue)
        deleteCompanyStub.rejects(new Error('Repository error'));
        createStub.rejects(new Error('Repository error'));
        await userController.createUser(req, res, next);
        expect(createStub.calledOnce).to.be.true;
        expect(deleteCompanyStub.calledOnce).to.be.true;
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Repository error');
    });

    it('should handle repository errors creating company stub', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.resolves(undefined);
        createCompanyStub.rejects(new Error('Repository error'));
        await userController.createUser(req, res, next);
        expect(createCompanyStub.calledOnce).to.be.true;
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(400);
        expect(next.args[0][0].message).to.equal('Repository error');
    });

    it('should handle repository errors creating stub2', async () => {
        req.body.role = constants.roles.admin;
        req.body.companyName = companyValue.name;
        getCompanyByNameStub.resolves(undefined);
        createCompanyStub.rejects({ code: 11000, message: 'Database error'});
        await userController.createUser(req, res, next);
        expect(createCompanyStub.calledOnce).to.be.true;
        expect(next.args[0][0]).to.be.an.instanceOf(RestError);
        expect(next.args[0][0].status).to.equal(409);
    });
});
