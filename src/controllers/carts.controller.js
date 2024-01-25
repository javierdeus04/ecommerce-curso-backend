import CartsService from "../services/carts.service.js";
import ProductsService from "../services/products.service.js"
import UsersService from "../services/users.service.js";
import UserController from "./users.controller.js";
import OrdersController from "./orders.controller.js";
import OrdersService from "../services/orders.service.js";

export default class CartsController {

    static getAll(filter = {}) {
        return CartsService.getAll(filter);
    }

    static create(data) {
        return CartsService.create(data);
    };
    
    static async getById(id) {
        try {
            const cart = await CartsService.getById(id)
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart;
        } catch (error) {
            throw new Error('Error al intenar buscar el carrito: ' + error.message);
        }
    };

    static async addProductToCart(cid, pid) {
        try {
            const existingCart = await CartsService.getById(cid);

            if (!existingCart) {
                const newCartData = { products: [{ product: pid }] };
                return CartsService.create(newCartData);
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
            throw new Error('Error al agregar producto al carrito: ' + error.message);
        }
    }

    static async deleteProductById(cid, pid) {
        const cart = await CartsService.getById(cid);        
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        const updatedProducts = cart.products.filter(product => product.product.toString() !== pid);
        return CartsService.updateById(cid, { products: updatedProducts });
    }

    static async updateOneProductQuantity(cid, pid, quantity) {
        try {
            const filter = { _id: cid, "products.product": pid };
            const update = { $set: { "products.$.quantity": quantity } };
            const options = { new: true };
            const cartToUpdate = await CartsService.getById(cid);
            const updatedCart = await cartToUpdate.findOneAndUpdate(filter, update, options).populate('products.product');
            if (!updatedCart) {
                throw new Error('No se encontró el carrito o el producto en el carrito');
            }
            return updatedCart;
        } catch (error) {
            throw new Error('Error al actualizar la cantidad del producto en el carrito: ' + error.message);
        }
    }

    static async deleteAllProductsFromCart(id) {
        const cart = await CartsService.getById(id);        
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return CartsService.updateById(id, { products: [] });
    }

    static async cartPurchase(id) {

        const userResult = await UsersService.getById(id); 
        const currentUserWithCart = await userResult.populate('cart');
        const currentCart = currentUserWithCart.cart;
        const currentCartId = currentCart._id;
        const itemsInCart = await currentCart.populate('products.product');
        const productsInCart = itemsInCart.products;

        const allProducts = await ProductsService.getAll();
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
                }else {
                    refusedProducts.push(cartProduct.product)
                }
            } else {
                refusedProducts.push(cartProduct.product)
            }
        }

        await CartsService.updateById(currentCartId, { products: refusedProducts })
    
        return refusedProducts;
    }
    
}

    
