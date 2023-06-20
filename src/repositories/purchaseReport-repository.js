const db = require('../db/connection/connection')
const PurchaseReport = db.purchaseReport

module.exports = class PurchaseReportRepository {
    async upsertPurchaseReport(productId, companyId, productCountToSum) {
        return await PurchaseReport.upsert(
            {
              productId: productId,
              companyId: companyId,
              totalPurchases: sequelize.literal(`totalPurchases + ${productCountToSum}`)
            },
            {
              returning: true 
            }
          );
    }

    async upsertPurchasesReport(products) {  
        return await db.sequelize.transaction(async (t) => {
            const createdPurchases = [];
            for (const item of products) {
              let purchaseReportRowToLook = await PurchaseReport.findOne({ 
                  where: { companyId: item.companyId, productId: item.productId}
              });
              let upsertedVal = undefined;
              if (purchaseReportRowToLook) {
                upsertedVal = await PurchaseReport.update(
                    { totalPurchases: db.Sequelize.literal(`totalPurchases + ${parseFloat(item.productQuantity)}`) },
                    { where: { id: purchaseReportRowToLook.id } },
                ).then(([numOfRows, updatedRows]) => {
                  return PurchaseReport.findOne({ where: {id: purchaseReportRowToLook.id} });
                });
              } else {
                upsertedVal = await PurchaseReport.create(
                  {
                    companyId: item.companyId, 
                    productId: item.productId,
                    totalPurchases: parseFloat(item.productQuantity)
                  }
                );
              }
            
              createdPurchases.push(upsertedVal)
            }
            return createdPurchases
        })
  }

    async getTopPurchasesReport(companyId, limit) {
        return await PurchaseReport.findAll({ 
            where: { companyId: companyId, },
            order: [['totalPurchases', 'DESC']],
            limit: parseInt(limit ?? 3)
        });
    }

    async getAllPurchasesReport(companyId) {
      return await PurchaseReport.findAll({ 
          where: { companyId: companyId, },
          order: [['totalPurchases', 'DESC']]
      });
  }

    async getAll() {
      return await PurchaseReport.findAll();
  }
}
