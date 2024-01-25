import TicketModel from "./models/ticket.model.js";

export default class TicketDaoMongoDB {
    static getAll(criteria = {}) {
        return TicketModel.find(criteria)
    }

    static create(data) {
        return TicketModel.create(data)
    }

    static updateById(uid, data) {
        return TicketModel.updateOne({ _id: uid }, { $set: data })
    }

    static deleteById(uid) {
        return TicketModel.deleteOne({ _id: uid })
    }
}