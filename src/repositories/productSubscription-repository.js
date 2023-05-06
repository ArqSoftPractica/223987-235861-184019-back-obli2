const db = require('../db/connection/connection')
const Product = db.product
const ProductSubscription = db.productSubscription
const User = db.user

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

    async getAllUsersSubscribedTo(productId) {
        const allSubscribers = await ProductSubscription.findAll({where:{
            productId: productId
        }});
        if (allSubscribers && Object.values(allSubscribers).length > 0) {
            const userIds = Object.values(allSubscribers).map(prodSub => prodSub.userId)
            return await User.findAll({
                where: {
                    id: { [db.Sequelize.Op.in]: userIds },
                }
            })
        }
        return allSubscribers
    }
}
