import { v4 as uuidv4 } from 'uuid';

import TicketsService from "../services/tickets.service.js";
import OrdersService from "../services/orders.service.js";
import UsersService from "../services/users.service.js";
import { logger } from '../config/logger.js';
import { CustomError } from "../../utils/CustomErrors.js";
import EnumsError from "../../utils/EnumsError.js";
import { generatorTicketIdError, generatorTicketError, generatorUserIdError } from "../../utils/CauseMessageError.js";


export default class TicketsController {
    static getAll(filter = {}) {
        return TicketsService.getAll(filter);
    }

    static async create(data) {

        const code = uuidv4();
        const currentUser = await UsersService.getById(data);
        logger.debug('UsersService.getById() finished successfully');

        const userId = currentUser._id;

        const populateOrders = await currentUser.populate('orders');
        const userOrders = populateOrders.orders;
        const pendingOrders = userOrders.filter(order => order.status === 'pending');

        if (!pendingOrders) {
            logger.error('There are no pending orders')
            throw new Error('No existen ordenes pendientes');
        }

        const lastPendingOrder = pendingOrders[pendingOrders.length - 1]
        const pendingOrderId = lastPendingOrder._id;
        const currentProducts = lastPendingOrder.products;

        if (!currentProducts || currentProducts.length === 0) {
            logger.error('Products no available')
            throw new Error('Productos no disponibles');
        } else {
            const amount = lastPendingOrder.total;
            const purchaser = currentUser.email;

            if (!code ||
                !amount ||
                !purchaser
            ) {
                CustomError.create({
                    name: 'Invalid data ticket',
                    cause: generatorTicketError({
                        code,
                        amount,
                        purchaser
                    }),
                    message: 'Error al crear un nuevo ticket',
                    code: EnumsError.BAD_REQUEST_ERROR,
                })
            }

            const newTicket = {
                code,
                amount,
                purchaser
            }

            const { tickets } = currentUser;
            tickets.push(newTicket);
            await UsersService.updateById(userId, { tickets });
            logger.debug('UsersService.updateById() finished successfully');

            await OrdersService.updateById(pendingOrderId, { status: 'completed' });
            logger.debug('OrdersService.updateById() finished successfully');
            const updatedOrder = await OrdersService.getById(pendingOrderId)
            logger.debug('OrdersService.getById() finished successfully');

            const ticketCreated = await TicketsService.create(newTicket);
            logger.debug('TicketsService.create() finished successfully');

            return { updatedOrder, ticketCreated }
        }
    }

    static async getById(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid ticket id format',
                cause: generatorTicketIdError(id),
                message: 'Error al intentar obtener el ticket por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const ticket = await TicketsService.getById(id);
        if (!ticket) {
            logger.error(`Ticket ${id} not found`)
            throw new Error(`Ticket ${id} no encontrado`)
        }
        return ticket
    }

    static async deleteByCode(code) {
        const existingTicket = await TicketsService.getByCode(code)
        if (!existingTicket) {
            logger.error("Ticket not found")
            throw new Error(`Ticket ${code} no encontrado`)
        }
        return TicketsService.deleteByCode(code);
    }

    static async deleteAllTickets(id) {
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
        return UsersService.updateById(id, { tickets: [] });
    }
}