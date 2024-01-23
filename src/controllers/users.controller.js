import UsersService from "../services/users.service.js";

export default class UserController {
    static getAll(filter = {}) {
        return UsersService.getAll(filter);
    }

    static async create(data) {
        const {
            first_name,
            last_name,
            email,
            password,
            age
        } = data;

        const newUser = {
            first_name,
            last_name,
            email,
            password,
            age
        }
        return UsersService.create(newUser)
    }

    static async getById(id) {
        const user = await UsersService.getById(id);
        if (!user) {
            throw new Error(`Usuario ${id} no encontrado`)
        }
        return user
    }

    static async updateById(id, data) {
        const existingUser = await UserController.getById(id);
        if (!existingUser) {
            throw new Error('Usuario no encontrado');
        }
        return UsersService.updateById(id, data);
    }

    static async deleteById(id) {
        await UserController.getById(id)
        return UsersService.deleteById(id);
    }
}