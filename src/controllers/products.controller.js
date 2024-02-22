import ProductsService from "../services/products.service.js";
import { CustomError } from "../../utils/CustomErrors.js";
import { generatorProductError, generatorProductIdError } from "../../utils/CauseMessageError.js";
import EnumsError from "../../utils/EnumsError.js";
import { Types  } from "mongoose";
import { logger } from "../config/logger.js";
import UsersService from "../services/users.service.js";

export default class ProductsController {
    static getAll() {
        return ProductsService.getAll();
    }

    static create(data, ownerId) {

        const {
            title,
            category,
            description,
            price,
            thumbnail,
            code,
            stock,
        } = data;

        if (!title ||
            !category ||
            !description ||
            !price ||
            !thumbnail ||
            !code ||
            !stock
        ) {
            CustomError.create({
                name: 'Invalid data product',
                cause: generatorProductError({
                    title,
                    category,
                    description,
                    price,
                    thumbnail,
                    code,
                    stock
                }),
                message: 'Error al crear un nuevo producto',
                code: EnumsError.BAD_REQUEST_ERROR,
            })
        }

        let owner;

        if (!ownerId) {
            owner = 'admin';
        } else {
            owner = ownerId
        }

        const newProduct = {
            title,
            category,
            description,
            price,
            thumbnail,
            code,
            stock,
            owner,
        }
        return ProductsService.create(newProduct)
    }

    static async getById(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid product id format',
                cause: generatorProductIdError(id),
                message: 'Error al intentar obtener el producto por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const product = await ProductsService.getById(id);
        if (!product) {
            logger.error('Product not found')
            throw new Error(`Producto ${id} no encontrado`)
        }
        return product
    }

    static async updateById(id, data) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid product id format',
                cause: generatorProductIdError(id),
                message: 'Error al intentar obtener el producto por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingProduct = await ProductsService.getById(id)
        if (!existingProduct) {
            logger.error("Product not found")
            throw new Error(`Producto ${id} no encontrado`)
        }
        logger.debug('ProductsService.getById() finished successfully')
        return ProductsService.updateById(id, data);
    }

    static async updateOwnProductById(uid, pid, data) {
        if (!Types.ObjectId.isValid(pid)) {
            CustomError.create({
                name: 'Invalid product id format',
                cause: generatorProductIdError(pid),
                message: 'Error al intentar obtener el producto por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }

        if (!Types.ObjectId.isValid(uid)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorUserIdError(uid),
                message: 'Error al intentar obtener el usuario por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }

        const user = await UsersService.getById(uid);
        logger.debug('UsersService.getById() finished successfully')

        if (!user) {
            logger.error(`User ${uid} not found`);
            throw new Error(`Usuario ${uid} no encontrado`);
        }

        if (user.role !== 'premium') {
            logger.error(`Forbidenn access. Unauthorized user: ${uid}`)
            throw new Error(`Acceso prohibido. Usuario ${uid} no autorizado.`)
        }

        const existingProduct = await ProductsService.getById(pid)
        if (!existingProduct) {
            logger.error("Product not found")
            throw new Error(`Producto ${pid} no encontrado`)
        }
        logger.debug('ProductsService.getById() finished successfully')

        if (existingProduct.owner.toString() !== uid.toString()) {
            logger.error(`Product ${pid} does not belong to the user`)
            throw new Error(`El producto ${pid} no pertenece al usuario`)
        }

        return ProductsService.updateById(pid, data);
    }

    static async deleteById(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid product id format',
                cause: generatorProductIdError(id),
                message: 'Error al intentar obtener el producto por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const existingProduct = await ProductsService.getById(id)
        if (!existingProduct) {
            logger.error("Product not found")
            throw new Error(`Producto ${id} no encontrado`)
        }
        return ProductsService.deleteById(id);
    }

    static async deleteOwnProductById(uid, pid) {
        if (!Types.ObjectId.isValid(pid)) {
            CustomError.create({
                name: 'Invalid product id format',
                cause: generatorProductIdError(pid),
                message: 'Error al intentar obtener el producto por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }

        if (!Types.ObjectId.isValid(uid)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorUserIdError(uid),
                message: 'Error al intentar obtener el usuario por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }

        const user = await UsersService.getById(uid);
        logger.debug('UsersService.getById() finished successfully')

        if (!user) {
            logger.error(`User ${uid} not found`);
            throw new Error(`Usuario ${uid} no encontrado`);
        }

        if (user.role !== 'premium') {
            logger.error(`Forbidenn access. Unauthorized user: ${uid}`)
            throw new Error(`Acceso prohibido. Usuario ${uid} no autorizado.`)
        }

        const existingProduct = await ProductsService.getById(pid)
        logger.debug('ProductsService.getById() finished successfully')
        if (!existingProduct) {
            logger.error(`roduct ${pid} not found`)
            throw new Error(`Producto ${pid} no encontrado`)
        }

        if (existingProduct.owner.toString() !== uid.toString()) {
            logger.error(`Product ${pid} does not belong to the user`)
            throw new Error(`El producto ${pid} no pertenece al usuario`)
        }

        return ProductsService.deleteById(pid);
    }
}