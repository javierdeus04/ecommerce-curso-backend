import TicketDao from "../dao/ticket.dao.js";

export default class TicketsService {
    static getAll(filter = {}) {
        return TicketDao.getAll(filter)
    }

    static create(data) {
        return TicketDao.create(data)
    }

    static async getByCode(code) {
        const result = await TicketDao.getAll({ code: code });
        return result[0]
    }

    static updateById(id, data) {
        return TicketDao.updateById(id, data);
    }

    static deleteByCode(code) {
        return TicketDao.deleteByCode(code);
    }
}