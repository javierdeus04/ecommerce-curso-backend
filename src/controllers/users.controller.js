import UsersService from "../services/users.service.js";
import { CustomError } from "../../utils/CustomErrors.js";
import EnumsError from "../../utils/EnumsError.js";
import { generatorUserError, generatorUserIdError } from "../../utils/CauseMessageError.js";
import { logger } from "../config/logger.js";
import { Types } from "mongoose";


export default class UserController {
    static async getAll(filter = {}) {
        const result = await UsersService.getAll(filter);
        if (!result) {
            logger.error('User/s not found');
            throw new Error('Usuario/s no encontrado/s')
        }
        return result
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
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorUserIdError(id),
                message: 'Error al intentar obtener el usuario por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingUser = await UsersService.getById(id);
        if (!existingUser) {
            logger.error('User not found')
            throw new Error(`Usuario ${id} no encontrado`)
        }
        return existingUser
    }

    static async updateById(id, data) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorUserIdError(id),
                message: 'Error al intentar obtener el usuario por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }

        const existingUser = await UsersService.getById(id);
        if (!existingUser) {
            logger.error('User not found')
            throw new Error('Usuario no encontrado');
        }
        return UsersService.updateById(id, data);
    }

    static async deleteById(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorUserIdError(id),
                message: 'Error al intentar obtener el usuario por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingUser = await UsersService.getById(id);
        if (!existingUser) {
            logger.error('User not found')
            throw new Error('Usuario no encontrado');
        }
        return UsersService.deleteById(id);
    }

    static async updateRole(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorUserIdError(id),
                message: 'Error al intentar obtener el usuario por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }

        const existingUser = await UsersService.getById(id);
        if (!existingUser) {
            logger.error('User not found')
            throw new Error('Usuario no encontrado');
        }

        if (existingUser.role === 'user') {
            existingUser.role = 'premium'
            await existingUser.save();
            return existingUser
        } else if (existingUser.role === 'premium') {
            existingUser.role = 'user'
            await existingUser.save();
            return existingUser
        }
    }

    static async approveDocuments(userId) {
        const existingUser = await UsersService.getById(userId);
        if (!existingUser) {
            throw new Error('Usuario no encontrado.');
        }

        existingUser.documents.forEach(doc => {
            doc.status = true;
        });

        await existingUser.save();
        return existingUser;
    }
}