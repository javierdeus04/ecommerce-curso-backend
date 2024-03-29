import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import session from 'express-session';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { __dirname } from '../utils/utils.js'
import { URI } from './db/mongodb.js';
import authRouter from './routers/api/auth.router.js';
import indexRouter from './routers/views/index.router.js';
import productsRouter from './routers/api/products.router.js';
import cartsRouter from './routers/api/carts.router.js';
import usersRouter from './routers/api/users.router.js';
import ordersRouter from './routers/api/orders.router.js'
import ticketsRouter from './routers/api/tickets.router.js'
import { init as initPassport } from './config/passport.config.js';
import { errorHandlerMiddleware } from './middlewares/error-handler-middleware.js';
import { addLogger, logger } from './config/logger.js';


const app = express();

const corsOptions = {
    origin: 'http://localhost:5500',
    method: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

const COOKIE_SECRET = 'mh3|253j*e%l=>w5t}(TD7WBYPb1m_{Z'

app.use(cors(corsOptions));
app.use(addLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser(COOKIE_SECRET));

if (process.env.NODE_ENV !== 'production') {
    const swaggerOpts = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: "MoviEcommerce API",
                description: "Documentacion de la API de MoviEcommerce. Una aplicacion para la compra y venta de peliculas en formato fisico.",
            },
        },
        apis: [path.join(__dirname, '..', 'src', 'docs', '**', '*.yaml')],
    }
    const specs = swaggerJsDoc(swaggerOpts);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

app.use('/api/auth/github', session({
    secret: '0pyPA(*g3AdF\g$028gfqibSFv-y0L',
    resave: false,
    saveUninitialized: false,
}));

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '../src/views'));
app.set('view engine', 'handlebars');


initPassport();
app.use(passport.initialize());

////////

app.use('/',
    indexRouter,
    productsRouter,
    cartsRouter,
    authRouter,
    usersRouter,
    ordersRouter,
    ticketsRouter
);
app.use('/api',
    productsRouter,
    cartsRouter,
    authRouter,
    usersRouter,
    ordersRouter,
    ticketsRouter
);
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/products');
    } else {
        res.redirect('/login');
    }
});
app.use(errorHandlerMiddleware)

////////


app.use((error, req, res, next) => {
    const message = `Ha ocurrido un error desconocido: ${error.message}`;
    logger.fatal(message);
    res.status(500).json({ message })
})

export default app;
