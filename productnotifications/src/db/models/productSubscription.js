const uuid = require('uuid');
const sequelize = require('../connection/connection')

module.exports = (sequelize, DataTypes, Product, User) => {
    const ProductSubscription = sequelize.define('productSubscription', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            },
            unique: {
                name: 'userId_productId',
                msg: 'Already subscribed',
            },
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Product,
                key: 'id'
            },
            unique: {
                name: 'userId_productId',
                msg: 'Already subscribed',
            },
        }
    });

    return ProductSubscription;
}