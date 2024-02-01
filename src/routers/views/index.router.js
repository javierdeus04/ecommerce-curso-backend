import { Router } from 'express';
import path from 'path';
import passport from 'passport';

import { admin, buildResponsePaginated } from '../../../utils/utils.js'
import ProductModel from '../../dao/models/product.model.js'
import ProductsController from '../../controllers/products.controller.js';
import CartsController from '../../controllers/carts.controller.js';
//import CartsManager from '../../dao/Carts.manager.js';
import EmailService from '../../services/email.service.js';
import { __dirname } from '../../../utils/utils.js';
import TwilioService from '../../services/twilio.service.js';
import { generateProduct, authenticateJWT } from '../../../utils/utils.js';
import { createUserDTO } from '../../dao/dto/user.dto.js';


const router = Router();

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
            res.render('error', { title: 'Error', errorMessage, cid });
        }

        const baseUrl = 'http://localhost:8080';
        const data = buildResponsePaginated({ ...products, sort, search, stock }, baseUrl);

        if(req.user) {
            if(req.user.role === "admin") {
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
        console.error(error.message);
        res.status(400).send({ error: error.message });
    }
});

router.get('/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await ProductsManager.getById(pid);
    const productObject = product.toObject();
    res.render('productDetail', { title: 'Productos', productObject });
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
        res.status(500).send({ error: error.message });
    }
})

router.get('/carts/current/purchase', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = req.user;
        const ticket = req.finalizedPurchase;
        res.render('purchase', {title: 'Pedido confirmado', ticket})
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

router.get('/login', async (req, res) => {
    res.render('login', { title: 'Login' });
})

router.get('/users/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    if(!req.user) {
        return res.redirect('/login')
    }
    if(req.user.role === "admin") {
        req.user = admin;
    } 
    if(req.user.role === "user") {
        req.user = req.user.toJSON();
    }
    res.render('profile', { title: 'Perfil de usuario', user: req.user });
})

router.get('/register', (req, res) => {
    res.render('register', { title: 'Registro de nuevo usuario' });
})

router.get('/recovery-password', (req, res) => {
    res.render('recovery-password', { title: 'Recuperacion de contraseña' });

})

router.get('/mail', async (req, res) => {
    const emailService = EmailService.getInstance();
    const result = await emailService.sendEmail(
        'javidiuf@hotmail.com',
        'Mail desde el servidor',
        `<div> 
            <h1>Hola</h1> 
            <img src="cid:tori" alt="Hello">
        </div>`,
        [
            {
                filename: 'tori.jpg',
                path: path.join(__dirname, './images/tori.jpg'),
                cid: 'tori'
            }
        ]
    )
    res.status(200).json(result);
})

router.get('/send-otp', async (req, res) => {
    const twilioService = TwilioService.getInstance();
    const response = await twilioService.sendSMS('+59899909068', `Su codigo de verificacion es hola`)
    res.status(200).json(response);
})

router.get('/mockingproducts', async (req, res) => {
    const products = [];
    for (let index = 0; index < 50; index++) {
        products.push(generateProduct());
    }
    res.status(200).json(products);
})


export default router;