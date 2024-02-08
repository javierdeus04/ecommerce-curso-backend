import winston from "winston";

import config from "./config.js";

const customeLevelOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'magenta',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'white',
        debug: 'blue',
    }
}

export const devLogger = winston.createLogger({
    levels: customeLevelOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ colors: customeLevelOptions.colors }),
                winston.format.simple(),
            )
        }),
    ],
});

export const prodLogger = winston.createLogger({
    levels: customeLevelOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({ colors: customeLevelOptions.colors }),
                winston.format.simple(),
            )
        }),
        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: winston.format.simple(),

        })
    ],
});

export const logger = config.env === 'production' ? prodLogger : devLogger;

export const addLogger = (req, res, next) => {
    req.logger = logger;
    next();
}

