import CartModel from "./models/cart.model.js";

export default class CartDaoMongoDB {
    static getAll(criteria = {}) {
        return CartModel.find(criteria)
    }

    static create(data) {
        return CartModel.create(data)
    }

    static updateById(uid, data) {
        return CartModel.updateOne({ _id: uid }, { $set: data })
    }

    static deleteById(uid) {
        return CartModel.deleteOne({ _id: uid })
    }
}