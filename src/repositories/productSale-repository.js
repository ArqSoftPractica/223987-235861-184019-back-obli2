const db = require('../db/connection/connection')
const ProductSale = db.productSale
const Product = db.product

module.exports = class ProductSaleRepository {
    async createProductsSale(productsData, companyId, saleId) {
        const newList = [];
        for (let i = 0; i < productsData.length; i++) {
            let productToInsert = {
                productId: productsData[i].id,
                productCost: productsData[i].productCost,
                productQuantity: productsData[i].productQuantity,
                companyId: companyId,
                saleId: saleId
            }
            newList.push(productToInsert);
        }
        
        const productsSale = await db.sequelize.transaction(async (t) => {
            const createdProuctSales = [];
            for (const item of newList) {
              let createdProuctSale = await ProductSale.create(item, { transaction: t });
              createdProuctSales.push(createdProuctSale);
            }
            return createdProuctSales
        })

        return productsSale
    }

    async getProductSalesByCompany(companyId) {
        return await ProductSale.findAll({ where: { companyId: companyId } });
    }

    async getProductSalesFromSale(saleId, companyId) {
        let whereClause = { saleId: saleId }
        if (companyId) {
            whereClause.companyId = companyId
        }
        return await ProductSale.findAll({ where: whereClause });
    }

    async getProductSaleFromCompanyForRange(companyId, startDate, endDate) { 
        let whereClause = { companyId: companyId }
        
        if (startDate && endDate) {
            whereClause['createdAt'] = {
                [db.Sequelize.Op.between]: [startDate, endDate]
            }
        }

        return await ProductSale.findAll({
            where: whereClause,
            attributes: ['productId', [db.sequelize.fn('SUM', db.sequelize.col('productQuantity')), 'totalQuantity']],
            group: ['productId'],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['name']
            }]
        });
    }
}
