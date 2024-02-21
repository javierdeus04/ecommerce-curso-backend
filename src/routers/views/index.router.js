import { Router } from 'express';
import path from 'path';
import passport from 'passport';

import { admin, buildResponsePaginated } from '../../../utils/utils.js'
import ProductModel from '../../dao/models/product.model.js'
import EmailService from '../../services/email.service.js';
import { __dirname } from '../../../utils/utils.js';
import TwilioService from '../../services/twilio.service.js';
import { generateProduct, authenticateJWT } from '../../../utils/utils.js';
import { createUserDTO } from '../../dao/dto/user.dto.js';
import ProductsController from '../../controllers/products.controller.js';
import { tr } from '@faker-js/faker';
import OrdersController from '../../controllers/orders.controller.js';
import { logger } from '../../config/logger.js';


const router = Router();

router.get('/loggerTest', (req, res) => {
    req.logger.fatal('Logger req (fatal');
    req.logger.error('Logger req (error)');
    req.logger.warn('Logger req (warning)');
    req.logger.info('Logger req (info)');
    req.logger.http('Logger req (http)');
    req.logger.debug('Logger req (debug)');
    res.send('Bienvenido')
})

router.get('/products', authenticateJWT, async (req, res) => {
    const { limit = 10, page = 1, sort, search, stock } = req.query;
    const criteria = {};
    const options = { limit, page };
    if (sort) {
        options.sort = { price: sort };
    }
    if (search) {
        criteria.category = search;
    }
    if (stock !== undefined) {
        criteria.stock = stock === 'true' ? { $ne: 0 } : undefined;
    }

    try {
        const products = await ProductModel.paginate(criteria, options);

        if (page > products.totalPages) {
            const errorMessage = new Error(`La página solicitada: ${page} no existe.`);
            logger.error('Page not found')
            res.render('error', { title: 'Error', errorMessage, cid });
        }

        const baseUrl = 'http://localhost:8080';
        const data = buildResponsePaginated({ ...products, sort, search, stock }, baseUrl);

        if (req.user) {
            if (req.user.role === "admin") {
                const userAdmin = req.user;
                res.render('products', { title: 'Productos', sort, baseUrl, ...data, userAdmin });
            } else {
                const user = req.user;
                const userDTO = createUserDTO(user);
                res.render('products', { title: 'Productos', sort, baseUrl, ...data, userDTO });
            }
        } else {
            res.render('products', { title: 'Productos', sort, baseUrl, ...data });
        }

    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /products', error.message);
        res.status(400).send({ error: error.message });
    }
});

router.get('/products/:pid', authenticateJWT, async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductsController.getById(pid);
        const productObject = product.toObject();

        const user = req.user;

        if (user) {
            if (user.role === "admin") {
                const userAdmin = user;
                res.render('productDetail', { title: 'Productos', productObject, userAdmin, user });
            } else {
                const userDTO = createUserDTO(user);
                res.render('productDetail', { title: 'Productos', productObject, userDTO, user });
            }
        } else {
            res.render('productDetail', { title: 'Productos', productObject });
        }
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /products/:pid', error.message);
        res.status(400).send({ error: error.message });
    }
});

router.get('/chat', (req, res) => {
    res.render('chat', { title: 'Chat' });
});

router.get('/carts/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const currentUser = req.user;
        const userWithCart = await currentUser.populate('cart');
        const cart = userWithCart.cart;
        const cartWithProducts = await cart.populate('products.product')
        const productsInCart = cartWithProducts.products.map(product => product.toObject());

        productsInCart.forEach(product => {
            product.subtotal = product.product.price * product.quantity;
        });
        const totalPrice = productsInCart.reduce((total, product) => total + product.subtotal, 0);
        const quantities = productsInCart.map(product => product.quantity);

        res.render('carts', { title: 'Carrito', productsInCart, totalPrice, quantities });
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /carts/current', error.message);
        res.status(400).send({ error: error.message });
    }
})

router.get('/login', async (req, res) => {
    res.render('login', { title: 'Login' });
})

router.get('/users/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    try {
        if (!req.user) {
            logger.warn('Unregistered user')
            return res.redirect('/login')
        }
        if (req.user.role === "admin") {
            req.user = admin;
        }
        if (req.user.role === "user") {
            req.user = req.user.toJSON();
        }
        res.render('profile', { title: 'Perfil de usuario', user: req.user });
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /users/current', error.message);
        res.status(400).send({ error: error.message });        
    }
})

router.get('/users/current/orders', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = req.user;
        const userDTO = createUserDTO(user);
        const userWithOrders = await user.populate('orders')
        const orders = userWithOrders.orders.map(order => order.toJSON());
        const ordersCompleted = orders.filter(order => order.status === 'completed')
        res.render('orders', { title: 'Lista de ordenes', userDTO, ordersCompleted });
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /users/current/orders', error.message);
        res.status(400).send({ error: error.message });       
    }
})

router.get('/carts/current/order', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = req.user;
        const userOrders = await OrdersController.getAll({ user });
        const currentOrder = userOrders[userOrders.length - 1];
        const populatedOrder = (await currentOrder.populate('products.product')).toJSON();
        const productsInOrder = populatedOrder.products;
        res.render('confirmOrder', { title: 'Confirmacin de orden', populatedOrder, productsInOrder });
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /carts/current/order', error.message);
        res.status(400).send({ error: error.message });       
    }
})

router.get('/current/confirmed-purchase', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = req.user;
        const userDTO = createUserDTO(user);
        res.render('confirmed-purchase', { title: 'Pedido confirmado', userDTO })
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /current/confirmed-purchase', error.message);
        res.status(400).send({ error: error.message });       
    }
})

router.get('/users/current/orders/:oid', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { oid } = req.params;
        const order = await OrdersController.getById(oid);
        const productsPopulated = (await order.populate('products.product')).toJSON();
        res.render('orderDetail', { title: 'Detalle de orden', productsPopulated });
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /users/current/orders/:oid', error.message);
        res.status(400).send({ error: error.message });       
    }
})


router.get('/register', (req, res) => {
    res.render('register', { title: 'Registro de nuevo usuario' });
})

router.get('/new-password', (req, res) => {
    const { token } = req.query;
    res.render('new-password', { title: 'Nueva contraseña', token });
})

router.get('/recovery-password', (req, res) => {
    res.render('recovery-password', { title: 'Recuperacion de contraseña' });
})

router.get('/recovery-password-mail-confirmation', (req, res) => {
    res.render('recovery-password-mail-confirmation')
})

router.get('/send-otp', async (req, res) => {
    try {
        const twilioService = TwilioService.getInstance();
        const response = await twilioService.sendSMS('+59899909068', `Su codigo de verificacion es hola`)
        res.status(200).json(response);
    } catch (error) {
        logger.error('Index Router Error. Method: GET. Path: /send-opt', error.message);
        res.status(400).send({ error: error.message });       
    }
})

router.get('/mockingproducts', async (req, res) => {
    const products = [];
    for (let index = 0; index < 50; index++) {
        products.push(generateProduct());
    }
    res.status(200).json(products);
})




export default router;