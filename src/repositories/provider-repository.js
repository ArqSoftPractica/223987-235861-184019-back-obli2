const db = require('../db/connection/connection')
const Provider = db.provider

module.exports = class ProviderRepository {
    async createProvider(providerData) {
        const provider = await Provider.create({
            name: providerData.name,
            address: providerData.address,
            email: providerData.email,
            phone: providerData.phone,
            companyId: providerData.companyId
        });
        return provider
    }

    async getProvider(providerId, companyId) {
        let whereClause = { id: providerId }
        if (companyId) {
            whereClause.companyId = companyId
        }
        return await Provider.findOne({ where: whereClause });
    }

    async getProviders(queryParams, companyId) {
        let queryParamsDb = {};
        if (queryParams.isActive != undefined) {
            queryParamsDb.isActive = queryParams.isActive
        }
        if (companyId) {
            queryParamsDb.companyId = companyId
        }
        return await Provider.findAll({ where: queryParamsDb });
    }

    async editProvider(id, body, companyId) {
        body.id = undefined;
        let queryParamsDb = {id: id}
        if (body.companyId) {
            queryParamsDb.companyId = companyId
        }
        return Provider
                .update(body, { where: queryParamsDb})
                .then(([numOfRows, updatedRows]) => {
                    return Provider.findOne({ where: queryParamsDb });
                })
    }
}
