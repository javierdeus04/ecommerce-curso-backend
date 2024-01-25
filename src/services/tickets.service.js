import TicketDao from "../dao/ticket.dao.js";

export default class TicketsService {
    static getAll(filter = {}) {
        return TicketDao.getAll(filter)
    }

    static create(data) {
        return TicketDao.create(data)
    }

    static async getById(id) {
        const result = await TicketDao.getAll({ _id: id });
        return result[0]
    }

    static updateById(id, data) {
        return TicketDao.updateById(id, data);
    }

    static deleteById(id) {
        return TicketDao.deleteById(id);
    }
}