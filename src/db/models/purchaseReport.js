const uuid = require('uuid');
const sequelize = require('../connection/connection')

module.exports = (sequelize, DataTypes) => {
    const PurchaseReport = sequelize.define('purchaseReport', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: {
                name: 'companyId_productId',
                msg: 'Product already exists for this company',
            },
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: {
                name: 'companyId_productId',
                msg: 'Product already exists for this company',
            },
        },
        totalPurchases: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    });

    return PurchaseReport;
}
