import EnumsError from "../../utils/EnumsError.js";
import { logger } from "../config/logger.js";

export const errorHandlerMiddleware = (error, req, res, next) => {
    logger.error(error.cause || error.message);
    switch (error.code) {
        case EnumsError.BAD_REQUEST_ERROR:
        case EnumsError.INVALID_PARAMS_ERROR:
            res.status(400).json({ status: 'error', message: error.message });
            break;
        case EnumsError.DATA_BASE_ERROR:
        case EnumsError.ROUTING_ERROR:
        default:
            res.status(500).json({ status: 'error', message: error.message });
    }
}