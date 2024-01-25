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

        const currentOrderId = currentUser.orders[0]
        const currentOrder = await OrdersService.getById(currentOrderId)

        const currentProducts = currentOrder.products;

        if (!currentProducts || currentProducts.length === 0) {
            throw new Error('Productos no disponibles');
        } else {
            const amount = currentOrder.total;
            const userEmail = user.email;

            const newTicket = {
                code,
                amount,
                purchaser: userEmail
            }

            return TicketsService.create(newTicket);
        }
    }

    static async getById(id) {

    }

    static async updateById(id, data) {

    }

    static async deleteById(id) {

    }
}