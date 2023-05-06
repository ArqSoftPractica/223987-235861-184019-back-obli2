const db = require('../db/connection/connection')
const Purchase = db.purchase

module.exports = class PurchaseRepository {
    async createPurchase(purchaseData) {
        const purchase = await Purchase.create({
            companyId: purchaseData.companyId,
            providerId: purchaseData.providerId,
            date: purchaseData.date,
            totalcost: purchaseData.totalcost,
        });
        return purchase
    }

    async getPurchase(purchaseId, companyId) {
        let whereClause = { id: purchaseId }
        if (companyId) {
            whereClause.companyId = companyId
        }
        return await Purchase.findOne({ where: whereClause });
    }

    async getPurchases(companyId) { 
        let whereClause = {}
        if (companyId) {
            whereClause.companyId = companyId
        }
        return await Purchase.findAll({ where: whereClause });
    }
    async deletePurchase(purchaseId, companyId) {
        let whereClause = { id: purchaseId }
        if (companyId) {
            whereClause.companyId = companyId
        }
        await Purchase.destroy({where: whereClause});
    }

    async getPurchasesPerProvider(providerId, from, to) {
        return await Purchase.findAll({ where: { providerId: providerId, date: { [db.Sequelize.Op.between]: [from, to] } } });
    }

}
