import mongoose from "mongoose";

import ProductModel from "./product.model.js";

const CartSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            quantity: { type: Number, default: 1 }
        },
    }]
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema);