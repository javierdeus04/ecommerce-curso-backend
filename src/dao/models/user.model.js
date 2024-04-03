import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    age: { type: Number, required: false },
    profile_picture: {
        type: {
            name: { type: String },
            reference: { type: String },
        },
        default: {},
        required: true
    },
    role: { type: String, default: 'user', enum: ['user', 'admin', 'anonymus', 'premium'] },
    status: { type: Boolean, default: true },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },
    orders: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order',
            }
        ], required: false, default: []
    },
    tickets: { type: Array },
    documents: {
        type: [
            {
            name: { type: String },
            reference: { type: String },
            status: { type: Boolean, default: false }
        }],
        required: false,
        default: []
    },
    last_connection: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

UserSchema.plugin(mongoosePaginate);

export default mongoose.model('User', UserSchema);