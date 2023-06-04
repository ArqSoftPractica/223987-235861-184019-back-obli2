const db = require('../db/connection/connection')
const Product = db.product

module.exports = class ProductRepository {
    async createProduct(productData) {
        const product = await Product.create({
            name: productData.name,
            companyId: productData.companyId,
            description: productData.description,
            image: productData.image,
            price: productData.price,
            stock: productData.stock
        });
        return product
    }

    async getProduct(productId, companyId) {
        let queryParamsDb = { id: productId };
        
        if (companyId) {
            queryParamsDb.companyId = companyId;
        }

        return await Product.findOne({ where: queryParamsDb });
    }

    async getProductsWithZeroStockFrom(companyId, productIdsStockChanged) {
        let queryParamsDb = { 
            stock : { [db.Sequelize.Op.eq]: 0},
            id: { [db.Sequelize.Op.in]: productIdsStockChanged},
            isActive: true,
            companyId: companyId
        };

        return await Product.findAll({ where: queryParamsDb });
    }

    async getProducts(queryParams, companyId) {
        let queryParamsDb = {};
        
        if (companyId) {
            queryParamsDb.companyId = companyId;
        }

        if (queryParams['isActive'] != undefined) {
            queryParamsDb['isActive'] = queryParams['isActive']
        }
        
        if (queryParams.stock != undefined) {
            queryParamsDb.stock = queryParams.stock
        }

        return await Product.findAll({ where: queryParamsDb });
    }

    async editProduct(id, body) {
        body.id = undefined;
        let whereClause = {id: id};
        whereClause.companyId = body.companyId;
        let productUpdated = await db.sequelize.transaction(async (t) => {
            const productUpdateResult = await Product.update(body, { where: whereClause, transaction: t})
            if (productUpdateResult == 0) {
                throw Error(`Could not update product with id: ${id}`)
            }

            const updatedProduct = await Product.findByPk(id, { transaction: t });
            return updatedProduct
        })
        return productUpdated
    }

    async changeProductsStock(productsWithQuantityToChange, addToStock) {
        await db.sequelize.transaction(async (t) => {
            for (const item of productsWithQuantityToChange) {
                let correctQuantity;
                if (item.productQuantity < 0) {
                    let correctErrorWord = "add";
                    if (addToStock == false) {
                        correctErrorWord = "remove"
                    }
                    throw Error(`Can only ${correctErrorWord} to stock positive numbers. Check the attempt to add to the following product id: ${item.id}`)
                }
                if (addToStock == true) {
                    correctQuantity = item.productQuantity   
                } else{
                    correctQuantity= -item.productQuantity
                }

                let whereCondition = { id: item.id, isActive: true};
                if (!addToStock) {
                    whereCondition.stock = { [db.Sequelize.Op.gte]: item.productQuantity }
                }

                const updatedItems = await Product.update(
                    { stock: db.sequelize.literal(`stock + ${correctQuantity}`)} ,
                    { 
                        where: whereCondition, 
                        transaction: t 
                    },
                )
                
                if (updatedItems == 0) {
                    let productToChangeQuantity = await Product.findOne({ where: { id: item.id } });
                    if (!productToChangeQuantity) {
                        throw Error(`No product with id: ${item.id}`)
                    }

                    if (productToChangeQuantity.isActive == false) {
                        throw Error(`${productToChangeQuantity.name} with id: ${productToChangeQuantity.id} is INACTIVE.`)
                    }

                    throw Error(`No stock for product: ${productToChangeQuantity.name}, with id: ${productToChangeQuantity.id}. Current stock is ${productToChangeQuantity.stock}, while the purchase tries to get ${item.productQuantity}`)
                }
            }
        })
    }
}
