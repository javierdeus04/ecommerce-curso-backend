import CartsService from "../services/carts.service.js";
import OrdersService from "../services/orders.service.js";
import UsersService from "../services/users.service.js";
import { v4 as uuidv4 } from 'uuid';
import CartsController from "./carts.controller.js";

export default class OrdersController {
    static getAll(filter = {}, opts = {}) {
        opts.sort = { createdAt: -1 };
        return OrdersService.getAll(filter, opts);
    }

    static async create(data) {
        const { user } = data;
    
        const code = uuidv4();
        const userResult = await UsersService.getById(user);
        const userId = user._id.toString();
    
        await userResult.populate('cart');
        const orderedProducts = userResult.cart.products;
    
        const orderResult = await CartsController.cartPurchase(userResult);
        const productsToPurchase = orderResult.productsToPurchase;
    
        let totalPrice = 0;
        productsToPurchase.forEach(item => {
                const productTotalPrice = item.product.price * item.quantity;
                totalPrice += productTotalPrice;
        });
    
        const newOrder = {
            code,
            user: userId,
            products: productsToPurchase,
            total: totalPrice,
        };    
        const createdOrder = await OrdersService.create(newOrder);
    
        const { orders } = userResult;
        orders.push(createdOrder);
        await UsersService.updateById(userId, { orders });
    
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

    static async deleteAllOrders(id) {
        const user = await UsersService.getById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return UsersService.updateById(id, { orders: [] });
        
    }

    static async deleteById(id) {
        await UserController.getById(id);
        return UsersService.deleteById(id);
    }
}
