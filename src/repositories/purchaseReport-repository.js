const db = require('../db/connection/connection')
const PurchaseReport = db.purchaseReport

module.exports = class PurchaseReportRepository {

    async createPurchase(purchaseData) {
        const purchase = await Purchase.upsert(
            purchaseData,
            {
              returning: true 
            }
        );
        return purchase;
    }

    async getTopPurchasesReport(companyId, limit) {
        return await PurchaseReport.findAll({ 
            where: { companyId: companyId, },
            order: [['totalPurchases', 'DESC']],
            limit: parseInt(limit ?? 3)
        });
    }

}
