import OrdersService from "../services/orders.service.js";
import UsersService from "../services/users.service.js";
import { v4 as uuidv4 } from 'uuid';
import ProductsService from "../services/products.service.js";
import { CustomError } from "../../utils/CustomErrors.js";
import EnumsError from "../../utils/EnumsError.js";
import { generatorOrderError, generatorOrderIdError, generatorUserIdError } from "../../utils/CauseMessageError.js";
import { logger } from "../config/logger.js";
import { Types  } from "mongoose";

export default class OrdersController {
    static getAll(filter = {}) {
        return OrdersService.getAll(filter);
    }

    static async create(data) {
        const { user } = data;

        const code = uuidv4();
        const userResult = await UsersService.getById(user);
        logger.debug('UsersService.getById() finished successfully')
        const userId = user._id.toString();

        const currentUserWithCart = await userResult.populate('cart');

        const currentCart = currentUserWithCart.cart;

        const itemsInCart = await currentCart.populate('products.product');

        const productsInCart = itemsInCart.products;

        const allProducts = await ProductsService.getAll();
        logger.debug('ProductsService.getAll() finished successfully')
        const stockProducts = allProducts.filter(p => p.stock !== 0);

        const productsToPurchase = [];

        for (const cartProduct of productsInCart) {
            const productsWithStockInCart = stockProducts.find(stockProduct => stockProduct._id.toString() === cartProduct.product._id.toString());

            if (productsWithStockInCart) {
                const availableStock = productsWithStockInCart.stock;
                const quantityInCart = cartProduct.quantity;

                if (availableStock >= quantityInCart) {
                    productsToPurchase.push({
                        product: cartProduct.product._id,
                        quantity: quantityInCart
                    });
                }
            }
        }


        let totalPrice = 0;

        for (const item of productsToPurchase) {
            try {
                const product = await ProductsService.getById(item.product);
                logger.debug('ProductsService.getById() finished successfully')

                if (product && product.price) {
                    const productTotalPrice = product.price * item.quantity;
                    totalPrice += productTotalPrice;
                } else {
                    logger.error(`Could not get product information. Product ID: ${item.product}`);
                    throw new Error(`No se pudo obtener información del producto. ID del producto: ${item.product}`)
                }
            } catch (error) {
                logger.error(`Error getting product ${item.product}: ${error.message}`);
                throw new Error(`Error al obtener el producto ${item.product}: ${error.message}`)

            }
        }

        if (!code ||
            !userId ||
            !productsToPurchase ||
            totalPrice === 0
        ) {
            CustomError.create({
                name: 'Invalid data order',
                cause: generatorOrderError({
                    code,
                    user,
                    products,
                    total
                }),
                message: 'Error al crear una nueva orden',
                code: EnumsError.BAD_REQUEST_ERROR,
            })
        }

        const newOrder = {
            code,
            user: userId,
            products: productsToPurchase,
            total: totalPrice,
        };
        const createdOrder = await OrdersService.create(newOrder);
        logger.debug('OrdersService.create() finished successfully')

        const { orders } = userResult;
        orders.push(createdOrder);
        await UsersService.updateById(userId, { orders });
        logger.debug('UsersService.updateById() finished successfully')

        return createdOrder;
    }

    static async getById(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid order id format',
                cause: generatorOrderIdError(id),
                message: 'Error al intentar obtener la orden por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingOrder = await OrdersService.getById(id);
        logger.debug('OrdersService.getById() finished successfully')
        if (!existingOrder) {
            logger.error('Order not found')
            throw new Error(`Orden ${id} no encontrada`)
        }
        return existingOrder
    }

    static async updateById(id, data) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid order id format',
                cause: generatorOrderIdError(id),
                message: 'Error al intentar actualizar la orden por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingOrder = await OrdersService.getById(id);
        logger.debug('OrdersService.getById() finished successfully')
        if (!existingOrder) {
            logger.error('Order not found')
            throw new Error(`Orden ${id} no encontrada`)
        }
        return OrdersService.updateById(id, data);
    }

    static async deleteAllOrders(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorUserIdError(id),
                message: 'Error al intentar obtener el usuario por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingUser = await UsersService.getById(id);
        logger.debug('UsersService.getById() finished successfully')
        if (!existingUser) {
            logger.error('User not found')
            throw new Error('Usuario no encontrado');
        }
        return UsersService.updateById(id, { orders: [] });
    }

    static async deleteById(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid order id format',
                cause: generatorOrderIdError(id),
                message: 'Error al intentar eliminar la orden por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingOrder = await OrdersService.getById(id);
        logger.debug('OrdersService.getById() finished successfully')
        if (!existingOrder) {
            logger.error('Order not found')
            throw new Error(`Orden ${id} no encontrada`)
        }
        return OrdersService.deleteById(id);
    }
}
