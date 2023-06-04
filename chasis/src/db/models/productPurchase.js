const uuid = require('uuid');
const sequelize = require('../connection/connection')

module.exports = (sequelize, DataTypes, Product, Purchase, Company) => {
    const ProductPurchase = sequelize.define('productPurchase', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Product,
                key: 'id'
            },
        },
        purchaseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Purchase,
                key: 'id'
            },
        },
        companyId: {   
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Company,
                key: 'id'
            },
        },
        productQuantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        productCost: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    });

    return ProductPurchase;
}