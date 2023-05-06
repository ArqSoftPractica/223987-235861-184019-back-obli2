const db = require('../db/connection/connection')
const Sale = db.sale
const ProductSale = db.productSale
const Product = db.product

module.exports = class SaleRepository {
    async createSale(productData) {
        const sale = await Sale.create({
            companyId: productData.companyId,
            totalcost: productData.totalCost,
            clientName: productData.clientName
        });
        return sale
    }

    async getSale(saleId, companyId) {
        let whereClause = { id: saleId }
        if (companyId) {
            whereClause.companyId = companyId
        }
        return await Sale.findOne({ where: whereClause });
    }

    async getSales(companyId) { 
        let whereClause = { }
        if (companyId) {
            whereClause.companyId = companyId
        }
        return await Sale.findAll({ where: whereClause });
    }

    async getSalesByCompanyWithSaleProducts(companyId, offset, pageSize, startDate, endDate) { 
        let whereClause = { companyId: companyId }
        
        if (startDate && endDate) {
            whereClause['createdAt'] = {
                [db.Sequelize.Op.between]: [startDate, endDate]
            }
        }

        let query = {
            where: whereClause,
            include: [{
                model: ProductSale,
                as: 'saleProducts',
                required: false,
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name']
                }]
            }],
            order: [['date', 'DESC']]
        }

        if (pageSize) {
            query['limit'] = pageSize
        }

        if (offset) {
            query['offset'] = offset
        }

        const salesPromise = Sale.findAll(query);
        const countPromise = Sale.count({where: whereClause});
        const [sales, count] = await Promise.all([salesPromise, countPromise]);
        return {
            totalSalesCount: count,
            offset: offset,
            pageSize: pageSize,
            startDate: startDate,
            endDate: endDate,
            sales: sales
        };
    }

    async deleteSale(id) {
        await Sale.destroy({where: { id: id }});
    }
}
