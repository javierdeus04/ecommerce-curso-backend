import OrderModel from "./models/order.model.js";

export default class OrderDaoMongoDB {
    static getAll(criteria = {}) {
        return OrderModel.find(criteria)
    }

    static create(data) {
        return OrderModel.create(data)
    }

    static updateById(uid, data) {
        return OrderModel.updateOne({ _id: uid }, { $set: data })
    }

    static deleteById(uid) {
        return OrderModel.deleteOne({ _id: uid })
    }
}