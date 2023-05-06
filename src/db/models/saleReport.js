const uuid = require('uuid');
const sequelize = require('../connection/connection')

module.exports = (sequelize, DataTypes, Company, Product) => {
    const SaleReport = sequelize.define('saleReport', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Company,
                key: 'id',
            },
            unique: {
                name: 'companyId_productId',
                msg: 'Product already exists for this company',
            },
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Product,
                key: 'id',
            },
            unique: {
                name: 'companyId_productId',
                msg: 'Product already exists for this company',
            },
        },
        totalSales: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    });

    return SaleReport;
}
