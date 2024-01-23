import OrderDao from "../dao/order.dao.js";

export default class OrdersService {
    static getAll(filter = {}) {
        return OrderDao.getAll(filter)
    }

    static create(data) {
        return OrderDao.create(data)
    }

    static async getById(id) {
        const result = await OrderDao.getAll({ _id: id });
        return result[0]
    }

    static updateById(id, data) {
        return OrderDao.updateById(id, data);
    }

    static deleteById(id) {
        return OrderDao.deleteById(id);
    }
}