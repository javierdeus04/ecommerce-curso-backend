import CartDao from "../dao/cart.dao.js";

export default class CartsService {
    static getAll(filter = {}) {
        return CartDao.getAll(filter)
    }

    static create(data) {
        return CartDao.create(data)
    }

    static async getById(id) {
        const result = await CartDao.getAll({ _id: id });
        return result[0]
    }

    static updateById(id, data) {
        return CartDao.updateById(id, data);
    }

    static deleteById(id) {
        return CartDao.deleteById(id);
    }
}
