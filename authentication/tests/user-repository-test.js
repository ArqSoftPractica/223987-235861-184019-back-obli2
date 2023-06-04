const crypto = require('crypto');
const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const User = require("../src/db/models/users");
const UserRepository = require("../src/repositories/user-repository");
const constants = require("../src/constants");
const db = require('../src/db/connection/connection');

const stubValueUnHashedPassword = 'testPassword1*'
const stubHashedPassword = "c67100c65e3ab96647156d991a6790ed6fd7d47c2585d0f7441ecf5931a66931"

describe("UserRepository", function() {
    let sequelizeStubCreate;
    let sequelizeStubGetAll;
    let sequelizeStubFindOne;
    let sandbox;
    let stubValue, companyValue;
    
    beforeEach(function () {
        companyValue = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            apiKey: crypto.randomUUID(),
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
            role: constants.roles.admin,
            createdAt:new Date(),
            updatedAt:new Date(),
        };
        sandbox = sinon.createSandbox();
        sequelizeStubCreate = sandbox.stub(db.user, 'create').resolves(stubValue);
        sequelizeStubGetAll = sandbox.stub(db.user, 'findAll').resolves([stubValue]);
        sequelizeStubFindOne = sandbox.stub(db.user, 'findOne').resolves(stubValue);
    });

    afterEach(function () {
        sandbox.restore();
        sinon.restore();
    });

    it("should add a new user to the db", async function() {

        // Use the stub to create a model
        let userRepository = new UserRepository();
        const user = await userRepository.createUser(stubValue);
        expect(sequelizeStubCreate.calledOnce).to.be.true;
        expect(user.id).to.equal(stubValue.id);
        expect(user.name).to.equal(stubValue.name);
        expect(user.role).to.equal(stubValue.role);
        expect(user.email).to.equal(stubValue.email);
        expect(user.companyId).to.equal(stubValue.companyId);
        expect(user.createdAt).to.equal(stubValue.createdAt);
        expect(user.updatedAt).to.equal(stubValue.updatedAt);
        expect(true).to.equal(true);
    });

    it("Get user with id and companyID", async function() {
        // Use the stub to create a model
        let userRepository = new UserRepository();
        const user = await userRepository.getUser(stubValue.id, stubValue.companyId);
        expect(sequelizeStubFindOne.calledOnce).to.be.true;
        expect(user.id).to.equal(stubValue.id);
        expect(user.name).to.equal(stubValue.name);
        expect(user.role).to.equal(stubValue.role);
        expect(user.email).to.equal(stubValue.email);
        expect(user.companyId).to.equal(stubValue.companyId);
        expect(user.createdAt).to.equal(stubValue.createdAt);
        expect(user.updatedAt).to.equal(stubValue.updatedAt);
    });

    it("get user only with id", async function() {
        // Use the stub to create a model
        let userRepository = new UserRepository();
        const user = await userRepository.getUser(stubValue.id);
        expect(sequelizeStubFindOne.calledOnce).to.be.true;
        expect(user.id).to.equal(stubValue.id);
        expect(user.name).to.equal(stubValue.name);
        expect(user.role).to.equal(stubValue.role);
        expect(user.email).to.equal(stubValue.email);
        expect(user.companyId).to.equal(stubValue.companyId);
        expect(user.createdAt).to.equal(stubValue.createdAt);
        expect(user.updatedAt).to.equal(stubValue.updatedAt);
    });

    it("get users with no filter", async function() {
        // Use the stub to create a model
        let userRepository = new UserRepository();
        const users = await userRepository.getUsers();
        const user = users[0];
        expect(sequelizeStubGetAll.calledOnce).to.be.true;
        expect(user.id).to.equal(stubValue.id);
        expect(user.name).to.equal(stubValue.name);
        expect(user.role).to.equal(stubValue.role);
        expect(user.email).to.equal(stubValue.email);
        expect(user.companyId).to.equal(stubValue.companyId);
        expect(user.createdAt).to.equal(stubValue.createdAt);
        expect(user.updatedAt).to.equal(stubValue.updatedAt);
    });

    it("should add a new user to the db", async function() {
        // Use the stub to create a model
        let userRepository = new UserRepository();
        const users = await userRepository.getUsers(stubValue.companyId);
        const user = users[0];
        expect(sequelizeStubGetAll.calledOnce).to.be.true;
        expect(user.id).to.equal(stubValue.id);
        expect(user.name).to.equal(stubValue.name);
        expect(user.role).to.equal(stubValue.role);
        expect(user.email).to.equal(stubValue.email);
        expect(user.companyId).to.equal(stubValue.companyId);
        expect(user.createdAt).to.equal(stubValue.createdAt);
        expect(user.updatedAt).to.equal(stubValue.updatedAt);
    });

    it("should get user by email or password", async function() {
        // Use the stub to create a model
        let userRepository = new UserRepository();
        const user = await userRepository.getUserByEmailPassword(stubValue.email, stubValueUnHashedPassword);
        expect(sequelizeStubFindOne.calledOnce).to.be.true;
        expect(user.id).to.equal(stubValue.id);
        expect(user.name).to.equal(stubValue.name);
        expect(user.role).to.equal(stubValue.role);
        expect(user.email).to.equal(stubValue.email);
        expect(user.password).to.equal(stubValue.password);
        expect(user.companyId).to.equal(stubValue.companyId);
        expect(user.createdAt).to.equal(stubValue.createdAt);
        expect(user.updatedAt).to.equal(stubValue.updatedAt);
    });

    it("should NOT get user by email, because wrong password", async function() {
        // Use the stub to create a model
        let userRepository = new UserRepository();
        try {
            await userRepository.getUserByEmailPassword(stubValue.email, 'Not correct password')
            //should be unreachable. This was done because we did not find a way to have success with await error getting caught by expect
            expect(true).to.equal(false);
        } catch(err) {
            expect(err.message).to.equal('User or password incorrect');
        }
    });
});

describe("UserRepository", function() {
    let sequelizeStubFindOne;
    let sandbox;
    
    before(function () {
        sandbox = sinon.createSandbox();
        sequelizeStubFindOne = sandbox.stub(db.user, 'findOne').resolves(undefined);
    });

    after(function () {
        sandbox.restore();
    });

    it("should NOT get user by email, because wrong user", async function() {
        // Use the stub to create a model
        let userRepository = new UserRepository();
        try {
            await userRepository.getUserByEmailPassword(db.user.email, 'Not correct password')
            //should be unreachable. This was done because we did not find a way to have success with await error getting caught by expect
            expect(true).to.equal(false);
        } catch(err) {
            expect(err.message).to.equal('User or password incorrect');
        }
    });
})

describe('User model', () => {
    let sandbox;
    const companyStub = {
        id: crypto.randomUUID(),
        name:"NOT STORING IN MYSQL SHIZZLE",
        apiKey:"apiKey",
    };

    const stubUser = {
        id: crypto.randomUUID(),
        userName: "username",
        email: "memory@email.com",
        companyId: companyStub.id,
        password: crypto.randomUUID(),
        role: constants.roles.admin,
        password: stubValueUnHashedPassword,
        createdAt:new Date(),
        updatedAt:new Date(),
    };
    
    before(function () {
        sandbox = sinon.createSandbox();
    });

    after(function () {
        sandbox.restore();
    });

    describe('beforeCreate', () => {
        it('hashes the password field before creating a new user', async () => {
            const createdCompany = await db.company.create(companyStub);
            const createdUser = await db.user.create(stubUser);
            
            expect(stubUser.password).not.to.equal(createdUser.password);
            expect(createdUser.password).to.equal(stubHashedPassword);
        });
    });
  });