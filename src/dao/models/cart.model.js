import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: { type: Number, default: 1 }
    }]
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema);