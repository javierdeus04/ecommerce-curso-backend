import mongoose from "mongoose";

import config from "../config/config.js";
import { logger } from "../config/logger.js";

export const URI = config.mongodbUri;

export const initMongodb = async () => {
    try {
        await mongoose.connect(URI);
        logger.info('Database connected successfully')
    } catch (error) {
        logger.error('An error occurred while trying to connect to the database', error.message)
    };
};