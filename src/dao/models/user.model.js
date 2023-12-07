import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: false },
    role: {
        type: String,
        enum: ['user', 'admin'], // Lista de roles permitidos
        default: 'user', // Rol predeterminado
      }
}, { timestamps: true });

UserSchema.plugin(mongoosePaginate);

export default mongoose.model('User', UserSchema);