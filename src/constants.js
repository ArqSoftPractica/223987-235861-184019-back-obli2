const roles = {
    all: ['MASTER', 'ADMIN', 'PROVIDERS', 'MAINTENANCE', 'EMPLOYEE', 'TEST'],
    provider: 'PROVIDERS',
    maintenance: 'MAINTENANCE',
    admin: 'ADMIN',
    employee: 'EMPLOYEE',
    master: 'MASTER',
    test: 'TEST',
};

const notificationType = {
    productBought: 'PRODUCT_BOUGHT',
    productSold: 'PRODUCT_SOLD',
};

module.exports = { roles, notificationType };