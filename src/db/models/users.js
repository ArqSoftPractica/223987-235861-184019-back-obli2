const constants = require('../../constants')
const crypto = require('crypto');

module.exports = (sequelize, DataTypes, Company) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                isEmail: true
            }
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Company,
                key: 'id',
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [8],
                    msg: 'Password must be at least 8 characters long',
                },
            },
        },
        role: {
            type: DataTypes.ENUM,
            values: constants.roles.all,
            allowNull: false
        }
    }, 
    {
        hooks: {
            beforeCreate: (user) => {
                user.password = crypto.createHash('sha256').update(user.password).digest('hex');
            }
        }
    });

    User.belongsTo(Company, { foreignKey: 'companyId' });

    return User
}
