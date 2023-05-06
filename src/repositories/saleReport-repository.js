const db = require('../db/connection/connection')
const SaleReport = db.saleReport

module.exports = class SaleReportRepository {
    async upsertSaleReport(productId, companyId, productCountToSum) {
        return await SaleReport.upsert(
            {
              productId: productId,
              companyId: companyId,
              totalSales: sequelize.literal(`totalSales + ${productCountToSum}`)
            },
            {
              returning: true 
            }
          );
    }

    async upsertSalesReport(products) {  
        return await db.sequelize.transaction(async (t) => {
            const createdProuctSales = [];
            for (const item of products) {
              let saleReportRowToLook = await SaleReport.findOne({ 
                  where: { companyId: item.companyId, productId: item.productId}
              });
              let upsertedVal = undefined;
              if (saleReportRowToLook) {
                upsertedVal = await SaleReport.update(
                    { totalSales: db.Sequelize.literal(`totalSales + ${parseFloat(item.productQuantity)}`) },
                    { where: { id: saleReportRowToLook.id } },
                ).then(([numOfRows, updatedRows]) => {
                  return SaleReport.findOne({ where: {id: saleReportRowToLook.id} });
                });
              } else {
                upsertedVal = await SaleReport.create(
                  {
                    companyId: item.companyId, 
                    productId: item.productId,
                    totalSales: parseFloat(item.productQuantity)
                  }
                );
              }
            
              createdProuctSales.push(upsertedVal)
            }
            return createdProuctSales
        })
  }

    async getTopSalesReport(companyId, limit) {
        return await SaleReport.findAll({ 
            where: { companyId: companyId, },
            order: [['totalSales', 'DESC']],
            limit: parseInt(limit ?? 3)
        });
    }

    async getAll() {
      return await SaleReport.findAll();
  }
}
