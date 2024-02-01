import ProductsService from "../services/products.service.js";
import { CustomError } from "../../utils/CustomErrors.js";
import { generatorProductError, generatorProductIdError } from "../../utils/CauseMessageError.js";
import EnumsError from "../../utils/EnumsError.js";
import { Types  } from "mongoose";

export default class ProductsController {
    static getAll() {
        return ProductsService.getAll();
    }

    static create(data) {
        const {
            title,
            category,
            description,
            price,
            thumbnail,
            code,
            stock
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
        const newProduct = {
            title,
            category,
            description,
            price,
            thumbnail,
            code,
            stock
        }
        return ProductsService.create(newProduct)

    }

    static async getById(id) {
        if (!Types.ObjectId.isValid(id)) {
            CustomError.create({
                name: 'Invalid user id format',
                cause: generatorProductIdError(id),
                message: 'Error al intentar obtener el producto por su id',
                code: EnumsError.INVALID_PARAMS_ERROR
            });
        }
        const product = await ProductsService.getById(id);
        if (!product) {
            throw new Error(`Producto ${id} no encontrado`)
        }
        return product
    }

    static async updateById(id, data) {
        await ProductsController.getById(id)
        return ProductsService.updateById(id, data);
    }

    static async deleteById(id) {
        await ProductsController.getById(id)
        return ProductsService.deleteById(id);
    }
}