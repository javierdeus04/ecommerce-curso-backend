import CartsService from "../services/carts.service.js";
import OrdersService from "../services/orders.service.js";
import UsersService from "../services/users.service.js";
import { v4 as uuidv4 } from 'uuid';

export default class OrdersController {
    static getAll(filter = {}, opts = {}) {
        return OrdersService.getAll(filter, opts);
    }

    static async create(data) {
        const {
            user,
        } = data;

        const code = uuidv4();
        const userResult = await UsersService.getById(user);
        const userId = user._id.toString();
        console.log(userId);
        await userResult.populate('cart');
        const cartId = userResult.cart._id;
        const orderedProducts = userResult.cart.products;
        const productsInCart = await CartsService.getById(cartId);
        await productsInCart.populate('products.product');

        let totalPrice = 0;
        orderedProducts.map(item => {
            const product = productsInCart.products.find(cartProduct => cartProduct._id.toString() === item._id.toString());
            if (product && product.product && product.product.price) {
                const productTotalPrice = product.product.price * item.quantity;
                totalPrice += productTotalPrice;
                return {
                    product: product.product._id,
                    quantity: item.quantity,
                    total: productTotalPrice,
                };
            }
            return null;
        }).filter(Boolean);

        const newOrder = {
            code,
            user: userId,
            products: orderedProducts,
            total: totalPrice,
        }
        const createdOrder = await OrdersService.create(newOrder)

        const { orders } = user;
        orders.push(createdOrder);
        await UsersService.updateById(userId, { orders });
        console.log(user);

        return createdOrder;
    }

    static async resolve(id, { status }) {
        await OrdersService.updateById(id, { status });
    }

    static async getById(id) {
        const order = await OrdersService.getById(id);
        if (!order) {
            throw new Error(`Orden ${id} no encontrada`)
        }
        return order
    }

    static async updateById(id, data) {
        await UserController.getById(id)
        return UsersService.updateById(id, data);
    }

    static async deleteById(id) {
        await UserController.getById(id)
        return UsersService.deleteById(id);
    }
}
