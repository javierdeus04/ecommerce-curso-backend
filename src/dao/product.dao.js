import ProductModel from "./models/product.model.js";

export default class ProductDaoMongoDB {
    static getAll(criteria = {}) {
        return ProductModel.find(criteria)
    }

    static create(data) {
        return ProductModel.create(data)
    }

    static updateById(pid, data) {
        return ProductModel.updateOne({ _id: pid }, { $set: data })
    }

    static deleteById(pid) {
        return ProductModel.deleteOne({ _id: pid })
    }
}