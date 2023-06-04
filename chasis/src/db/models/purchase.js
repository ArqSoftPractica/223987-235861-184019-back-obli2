const uuid = require('uuid');
const sequelize = require('../connection/connection')

module.exports = (sequelize, DataTypes, Company, Provider) => {
    const Purchase = sequelize.define('purchase', {
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
                key: 'id'
            },
        },
        providerId:{
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Provider,
                key: 'id'
            },
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        totalcost: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    });

    return Purchase;
}
