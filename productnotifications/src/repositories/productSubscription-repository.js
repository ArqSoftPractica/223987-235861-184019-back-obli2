const db = require('../db/connection/connection')
const ProductSubscription = db.productSubscription
const User = db.user

module.exports = class ProductSubscriptionRepository {
    async upsertProductSubscription(
        productId, 
        userId, 
        willSubscribeProductBought,
        willSubscribeProductSold, 
        willSubscribeNoStock
    ) {
        const productSubscription = await ProductSubscription.upsert({
            productId: productId,
            userId: userId,
            productBought: willSubscribeProductBought,
            productSold: willSubscribeProductSold,
            noStock: willSubscribeNoStock,
        });
        if (productSubscription && Object.values(productSubscription).length > 0 && productSubscription[0].dataValues) {
            return productSubscription[0].dataValues
        } else {
            throw Error('Could not upsert Product subscription in database')
        }
    }

    async getProductSubscription(productId, userId) {
        const productSubscription = await ProductSubscription.findOne({where:{
            productId: productId,
            userId: userId
        }});
        return productSubscription
    }

    async getAllUsersSubscribedTo(productId, notificationType) {
        const whereClause = { productId: productId }
        whereClause[notificationType] = true

        const allSubscribers = await ProductSubscription.findAll({where:whereClause});
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
