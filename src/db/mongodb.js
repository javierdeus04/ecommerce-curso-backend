import mongoose from "mongoose";

export const URI = 'mongodb+srv://developer:O59O8fLInlSGpQXg@cluster0.ayy2zqg.mongodb.net/ecommerce';

export const initMongodb = async () => {
    try {
        await mongoose.connect(URI);
        console.log('Database connected successfully')
    } catch (error) {
        console.error('Ha ocuurido un error al intentar conectarse a la base de datos', error.message)
    };
};