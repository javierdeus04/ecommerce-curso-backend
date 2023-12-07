import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { __dirname } from './utils.js';
import { URI } from './db/mongodb.js';
import indexRouter from './routers/views/index.router.js'
import productsRouter from './routers/api/products.router.js'
import cartsRouter from './routers/api/carts.router.js'
import sessionsRouter from './routers/api/sessions.router.js'
import { init as initPassport} from './config/passport.config.js';


const app = express();

const SESSION_SECRET = '84wq&£:1K:f&HYZ`chAm7<?pD:5jCS6O'

app.use(session({
    store: MongoStore.create({
        mongoUrl: URI,
        mongoOptions: {},
        ttl: 120000000,
    }),
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

initPassport();
app.use(passport.initialize());
app.use(passport.session());

////////

app.use('/', indexRouter, productsRouter, cartsRouter, sessionsRouter);
app.use('/api', productsRouter, cartsRouter, sessionsRouter);
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/products');
    } else {
        res.redirect('/login');
    }
});

////////


app.use((error, req, res, next) => {
    const message = `Ha ocurrido un error desconocido: ${error.message}`;
    console.log(message);
    res.status(500).json({ message }) 
})

export default app;
