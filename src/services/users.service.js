import UserDao from "../dao/user.dao.js";

export default class UsersService {
    static getAll(filter = {}) {
        return UserDao.getAll(filter)
    }

    static create(data) {
        return UserDao.create(data)
    }

    static async getById(id) {
        const result = await UserDao.getAll({ _id: id });
        return result[0]
    }

    static updateById(id, data) {
        return UserDao.updateById(id, data);
    }

    static deleteById(id) {
        return UserDao.deleteById(id);
    }
}
