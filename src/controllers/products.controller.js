import ProductsService from "../services/products.service.js";

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
            !stock) {
                throw new Error('Todos los campos son requeridos')
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