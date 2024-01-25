import { v4 as uuidv4 } from 'uuid';

import TicketsService from "../services/tickets.service.js";
import OrdersService from "../services/orders.service.js";
import UsersService from "../services/users.service.js";
import CartsController from './carts.controller.js';
import OrdersController from './orders.controller.js';

export default class TicketsController {
    static getAll(filter = {}) {
        return TicketsService.getAll(filter);
    }

    static async create(data) {

        const { user } = data;
        const code = uuidv4();
        const currentUser = await UsersService.getById(user);

        const populateOrders = await currentUser.populate('orders');
        const userOrders = populateOrders.orders;
        const pendingOrder = userOrders.find(order => order.status === 'pending');
        const pendingOrderId = pendingOrder._id;

        const currentProducts = pendingOrder.products;

        if (!currentProducts || currentProducts.length === 0) {
            throw new Error('Productos no disponibles');
        } else {
            const amount = pendingOrder.total;
            const userEmail = user.email;

            const newTicket = {
                code,
                amount,
                purchaser: userEmail
            }

            await OrdersService.updateById(pendingOrderId, { status: 'completed' });
            const updatedOrder = await OrdersService.getById(pendingOrderId)

            const ticketCreated = await TicketsService.create(newTicket);

            return { updatedOrder, ticketCreated }
        }
    }

    static async getById(id) {

    }

    static async updateById(id, data) {

    }

    static async deleteById(id) {

    }
}