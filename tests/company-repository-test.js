const crypto = require('crypto');
const chai = require("chai");
const sinon = require("sinon");
const expect = chai.expect;
const CompanyRepository = require("../src/repositories/company-repository");
const db = require('../src/db/connection/connection');

describe("UserRepository", function() {
    let sequelizeStubCreate;
    let sequelizeStubGetAll;
    let sequelizeStubFindOne;
    let sequelizeStubDelete;
    let sandbox;
    let companyRepository;
    let companyStub;
    
    beforeEach(function () {
        companyStub = {
            id: crypto.randomUUID(),
            name: crypto.randomBytes(4).toString('hex'),
            apiKey: crypto.randomUUID(),
        };
        sandbox = sinon.createSandbox();
        sequelizeStubCreate = sandbox.stub(db.company, 'create');
        sequelizeStubGetAll = sandbox.stub(db.company, 'findAll');
        sequelizeStubFindOne = sandbox.stub(db.company, 'findOne');
        sequelizeStubDelete = sandbox.stub(db.company, 'destroy');
        companyRepository = new CompanyRepository();
    });

    afterEach(function () {
        sandbox.restore();
        sinon.restore();
    });

    it("should add a new company to the db", async function() {
        sequelizeStubCreate.resolves(companyStub)
        const company = await companyRepository.createCompany(companyStub);
        expect(sequelizeStubCreate.calledOnce).to.be.true;
        expect(company.id).to.equal(companyStub.id);
        expect(company.apiKey).to.equal(companyStub.apiKey);
        expect(company.name).to.equal(companyStub.name);
    });

    it("should delete the specified company from the db", async function() {
        sequelizeStubDelete.resolves(1);
        const result = await companyRepository.deleteCompany(companyStub.name);
        expect(sequelizeStubDelete.calledOnceWith({ name: companyStub.name })).to.be.true;
        expect(result).to.equal(1);
    });

    it("should retrieve the specified company from the db by name", async function() {
        sequelizeStubFindOne.resolves(companyStub);
        const company = await companyRepository.getCompanyByName(companyStub.name);
        expect(sequelizeStubFindOne.calledOnceWith({ where: { name: companyStub.name } })).to.be.true;
        expect(company.id).to.equal(companyStub.id);
        expect(company.apiKey).to.equal(companyStub.apiKey);
        expect(company.name).to.equal(companyStub.name);
    });

    it("should retrieve the specified company from the db by id", async function() {
        sequelizeStubFindOne.resolves(companyStub);
        const company = await companyRepository.getCompany(companyStub.id);
        const result = sequelizeStubFindOne.calledOnceWith({ where: { id: companyStub.id } });
        expect(result).to.be.true;
        expect(company.id).to.equal(companyStub.id);
        expect(company.apiKey).to.equal(companyStub.apiKey);
        expect(company.name).to.equal(companyStub.name);
    });

    it("should get a company by its API key", async function() {
        sequelizeStubFindOne.resolves(companyStub);
        const company = await companyRepository.getCompanyByApiKey(companyStub.apiKey);
        expect(sequelizeStubFindOne.calledOnceWith({ where: { apiKey: companyStub.apiKey } })).to.be.true;
        expect(company.id).to.equal(companyStub.id);
        expect(company.apiKey).to.equal(companyStub.apiKey);
        expect(company.name).to.equal(companyStub.name);
    });

    it("should get all companies from the db", async function() {
        sequelizeStubGetAll.resolves([companyStub]);
        const companies = await companyRepository.getCompanies();
        expect(sequelizeStubGetAll.calledOnce).to.be.true;
        expect(companies).to.be.an("array");
        expect(companies.length).to.equal(1);
        expect(companies[0].id).to.equal(companyStub.id);
        expect(companies[0].apiKey).to.equal(companyStub.apiKey);
        expect(companies[0].name).to.equal(companyStub.name);
      });
});
