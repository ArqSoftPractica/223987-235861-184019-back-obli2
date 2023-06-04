const uuid = require('uuid');
const sequelize = require('../connection/connection')

module.exports = (sequelize, DataTypes, Product, User) => {
    const ProductSubscription = sequelize.define('productSubscription', {
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
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
            primaryKey: true,
            references: {
                model: Product,
                key: 'id'
            },
            unique: {
                name: 'userId_productId',
                msg: 'Already subscribed',
            },
        },
        productBought: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        productSold: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        noStock: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    });

    // Define the associations between models
    User.hasMany(ProductSubscription, { foreignKey: 'userId' });
    Product.hasMany(ProductSubscription, { foreignKey: 'productId' });
    ProductSubscription.belongsTo(User, { foreignKey: 'userId' });
    ProductSubscription.belongsTo(Product, { foreignKey: 'productId' });
    
    return ProductSubscription;
}