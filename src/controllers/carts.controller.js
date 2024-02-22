import CartsService from "../services/carts.service.js";
import ProductsService from "../services/products.service.js"
import UsersService from "../services/users.service.js";
import { logger } from "../config/logger.js";
import { generatorProductIdError, generatorUserIdError } from "../../utils/CauseMessageError.js";
import { Types } from "mongoose";
import { CustomError } from "../../utils/CustomErrors.js";
import EnumsError from "../../utils/EnumsError.js";

export default class CartsController {

    static getAll(filter = {}) {
        return CartsService.getAll(filter);
    }

    static create(data) {
        return CartsService.create(data);
    };

    static async getById(id) {
        try {
            if (!Types.ObjectId.isValid(id)) {
                CustomError.create({
                    name: 'Invalid cart id format',
                    cause: generatorProductIdError(id),
                    message: 'Error al intentar obtener el carrito por su id',
                    code: EnumsError.INVALID_PARAMS_ERROR
                });
            }
            const cart = await CartsService.getById(id)
            logger.debug('CartsService.getById() finished successfully')
            if (!cart) {
                logger.error('Cart not found')
                throw new Error('Carrito no encontrado');
            }
            return cart;
        } catch (error) {
            logger.error('Error when trying to search for the cart');
            throw new Error('Error al intenar buscar el carrito');
        }
    };

    static async addProductToCart(uid, cid, pid) {
        try {
            if (!Types.ObjectId.isValid(uid)) {
                CustomError.create({
                    name: 'Invalid user id format',
                    cause: generatorUserIdError(uid),
                    message: 'Error al intentar obtener el uusario por su id',
                    code: EnumsError.INVALID_PARAMS_ERROR
                });
            }

            const existingUser = await UsersService.getById(uid);
            logger.debug('UsersService.getById() finished successfully')

            if (!existingUser) {
                logger.error(`User ${uid} not found`);
                throw new Error(`Usuario ${uid} no encontrado`);
            }

            const existingCart = await CartsService.getById(cid);
            logger.debug('CartsService.getById() finished successfully')

            if (!Types.ObjectId.isValid(pid)) {
                CustomError.create({
                    name: 'Invalid product id format',
                    cause: generatorProductIdError(pid),
                    message: 'Error al intentar obtener el producto por su id',
                    code: EnumsError.INVALID_PARAMS_ERROR
                });
            }

            const product = await ProductsService.getById(pid);
            logger.debug('ProductsService.getById() finished successfully')

            if (existingUser.role === 'premium' && product.owner.toString() === existingUser._id.toString()) {
                logger.error(`User cannot buy their own product`);
                throw new Error('El usuario no puede comprar su propio producto')
            }

            if (!existingCart) {
                const newCartData = { products: [{ product: pid }] };
                const newCart = await CartsService.create(newCartData);
                logger.debug('CartsService.create() finished successfully')
                return newCart
            }

            const existingProduct = existingCart.products.find(
                (item) => item.product._id.toString() === pid.toString()
            );

            if (existingProduct) {
                existingProduct.quantity = (existingProduct.quantity || 1) + 1;
            } else {
                existingCart.products.push({ product: pid, quantity: 1 });
            }
            const updatedCart = await existingCart.save();

            return updatedCart.populate('products.product');
        } catch (error) {
            logger.error(error.message);
            logger.error('Error when trying to add product to cart')
            throw new Error('Error al intentar agregar producto al carrito: ' + error.message);
        }
    }

    static async deleteProductById(cid, pid) {
        const cart = await CartsService.getById(cid);
        logger.debug('CartsService.getById() finished successfully')
        if (!cart) {
            logger.error('Cart not found')
            throw new Error('Carrito no encontrado');
        }
        if (!Types.ObjectId.isValid(pid)) {
            CustomError.create({
                name: 'Invalid product id format',
                cause: generatorProductIdError(pid),
                message: 'Error al intentar obtener el producto por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const productToDelete = await ProductsService.getById(pid);
        logger.debug('ProductsService.getById() finished successfully')
        if (!productToDelete) {
            logger.error('Product not found')
            throw new Error('Producto no encontrado');
        }

        const isProductInCart = cart.products.some(product => product.product.toString() === pid);
        if (!isProductInCart) {
            logger.error('Product not found in cart');
            throw new Error('Producto no encontrado en el carrito');
        }

        const updatedProducts = cart.products.filter(product => product.product.toString() !== pid);
        return CartsService.updateById(cid, { products: updatedProducts });
    }

    static async updateOneProductQuantity(cid, pid, quantity) {
        try {
            const cart = await CartsService.getById(cid);
            logger.debug('CartsService.getById() finished successfully');

            if (!cart) {
                logger.error('Cart not found');
                throw new Error('Carrito no encontrado');
            }

            const productIndex = cart.products.findIndex(product => product.product.toString() === pid);

            if (productIndex === -1) {
                logger.error('Product not found in cart');
                throw new Error('Producto no encontrado en el carrito');
            }

            let newQuantity = quantity;
            if (quantity <= 1) {
                newQuantity = 1;
            }

            cart.products[productIndex].quantity = newQuantity;

            await cart.save();
            return cart;
        } catch (error) {
            logger.error('Error updating the quantity of the product in the cart')
            throw new Error('Error al actualizar la cantidad del producto en el carrito');
        }
    }

    static async deleteAllProductsFromCart(id) {
        const cart = await CartsService.getById(id)
        logger.debug('CartsService.getById() finished successfully')
        if (!cart) {
            logger.error('Cart not found')
            throw new Error('Carrito no encontrado');
        }
        return CartsService.updateById(id, { products: [] });
    }

    static async cartPurchase(id) {

        const userResult = await UsersService.getById(id);
        logger.debug('UsersService.getById() finished successfully');
        const currentUserWithCart = await userResult.populate('cart');
        const currentCart = currentUserWithCart.cart;
        const currentCartId = currentCart._id;
        const itemsInCart = await currentCart.populate('products.product');
        const productsInCart = itemsInCart.products;

        const allProducts = await ProductsService.getAll();
        logger.debug('ProductsService.getAll() finished successfully');
        const stockProducts = allProducts.filter(p => p.stock !== 0);

        const refusedProducts = [];

        for (const cartProduct of productsInCart) {
            const productsWithStockInCart = stockProducts.find(stockProduct => stockProduct._id.toString() === cartProduct.product._id.toString());

            if (productsWithStockInCart) {
                const availableStock = productsWithStockInCart.stock;
                const quantityInCart = cartProduct.quantity;

                if (availableStock >= quantityInCart) {
                    productsWithStockInCart.stock -= quantityInCart;
                    await productsWithStockInCart.save();
                } else {
                    refusedProducts.push({
                        product: cartProduct.product._id,
                        quantity: 1,
                    })
                }
            } else {
                refusedProducts.push({
                    product: cartProduct.product._id,
                    quantity: 1,
                })
            }
        }

        await CartsService.updateById(currentCartId, { products: refusedProducts })
        logger.debug('CartsService.updateById() finished successfully')

        return refusedProducts
    }

}


