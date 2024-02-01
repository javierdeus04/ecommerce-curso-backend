import UsersService from "../services/users.service.js";
import { CustomError } from "../../utils/CustomErrors.js";
import { generatorProductError } from "../../utils/CauseMessageError.js";
import EnumsError from "../../utils/EnumsError.js";

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

        if (!first_name ||
            !last_name ||
            !email ||
            !password ||
            !age) {
            CustomError.create({
                name: 'Invalid data user',
                cause: generatorUserError({
                    first_name,
                    last_name,
                    email,
                    password,
                    age
                }),
                message: 'Error al crear un nuevo usuario',
                code: EnumsError.BAD_REQUEST_ERROR,
            })
        }

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