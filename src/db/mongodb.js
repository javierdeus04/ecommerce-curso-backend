import mongoose from "mongoose";

import config from "../config/config.js";

export const URI = config.mongodbUri;

export const initMongodb = async () => {
    try {
        await mongoose.connect(URI);
        console.log('Database connected successfully')
    } catch (error) {
        console.error('Ha ocuurido un error al intentar conectarse a la base de datos', error.message)
    };
};