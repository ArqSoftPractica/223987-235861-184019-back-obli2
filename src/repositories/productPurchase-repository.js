const db = require('../db/connection/connection')
const ProductPurchase = db.productPurchase

module.exports = class ProductPurchaseRepository {
    async createProductPurchase(productPurchaseData, companyId) {
        const productPurchase = await ProductPurchase.create({
            productId: productPurchaseData.productId,
            companyId: companyId,
            productQuantity: productPurchaseData.productQuantity,
            productCost: productPurchaseData.productCost
        });
        return productPurchase
    }

    async createProductsPurchase(productsData, companyId, purchaseId) {
        const newList = [];
        for (let i = 0; i < productsData.length; i++) {
            let productToInsert = {
                productId: productsData[i].id,
                productCost: productsData[i].productCost,
                productQuantity: productsData[i].productQuantity,
                companyId: companyId,
                purchaseId: purchaseId
            }
            newList.push(productToInsert);
        }
        const productsPurchase = await db.sequelize.transaction(async (t) => {
            const createdProductPurchases = [];
            for (const item of newList) {
              let createdProductPurchase = await ProductPurchase.create(item, { transaction: t });
              createdProductPurchases.push(createdProductPurchase);
            }
            return createdProductPurchases
        })
        return productsPurchase
    }

    async getProductPurchase(productPurchaseId) {
        return await ProductPurchase.findAll({ where: { id: productPurchaseId } });
    }

    async getProductsPurchasesFromPurchase(purchaseId) { 
        return await ProductPurchase.findAll({ where: { purchaseId: purchaseId } });
    }
    
}