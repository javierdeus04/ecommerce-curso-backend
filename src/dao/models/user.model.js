import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    age: { type: Number, required: false },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    status: { type: Boolean, default: true },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    }
}, { timestamps: true });

UserSchema.plugin(mongoosePaginate);

export default mongoose.model('User', UserSchema);