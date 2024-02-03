import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    code: { type: String, required: true },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: { type: Number, required: true }
        }
    ],
    total: { type: Number, required: false },
    status: { type: String, required: false, default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);