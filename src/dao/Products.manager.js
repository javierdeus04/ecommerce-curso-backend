import ProductModel from './models/product.model.js'

export default class ProductsManager {
    static get() {
        return ProductModel.find();
    };

    static async getById(pid) {
        const product = await ProductModel.findById(pid);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    };

    static create(data) {
        if (!data.title, !data.category, !data.description, !data.price, !data.code, !data.stock) {
            throw new Error('Todos los campos son obligatorios');
        }
        return ProductModel.create(data);
    };

    static async updateById(pid, data) {
        const product = await ProductsManager.getById(pid);
        if (!product) {
            throw new Error('Producto no encontrado');
        } else {
            await ProductModel.updateOne({ _id: pid }, { $set: data });
            console.log(`El producto ${pid} ha sido actualizado correctamente`);
        };
    };

    static async deleteById(pid) {
        const product = await ProductsManager.getById(pid);
        if (!product) {
            throw new Error('Producto no encontrado');
        } else {
            await ProductModel.deleteOne({ _id: pid });
            console.log(`El producto ${pid} ha sido eliminado correctamente`);
        }
    }
}