const db = require('../db/connection/connection')
const Product = db.product
const ProductSubscription = db.productSubscription

module.exports = class ProductSubscriptionRepository {
    async createProductSubscription(productId, userId) {
        const productSubscription = await ProductSubscription.create({
            productId: productId,
            userId: userId
        });
        return productSubscription
    }

    async deleteProductSubscription(productId, userId) {
        const productSubscription = await ProductSubscription.destroy({
            where: {
                productId: productId,
                userId: userId
            }
        });
        
        return productSubscription
    }

    async getProductSubscription(productId, userId) {
        const productSubscription = await ProductSubscription.findOne({where:{
            productId: productId,
            userId: userId
        }});
        return productSubscription
    }
}
