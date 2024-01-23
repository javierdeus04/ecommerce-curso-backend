import { Router } from 'express';
import path from 'path';

import { buildResponsePaginated } from '../../utils.js'
import ProductModel from '../../dao/models/product.model.js'
import ProductsController from '../../controllers/products.controller.js';
//import CartsManager from '../../dao/Carts.manager.js';
import EmailService from '../../services/email.service.js';
import { __dirname } from '../../utils.js';
import TwilioService from '../../services/twilio.service.js';


const router = Router();

router.get('/products', async (req, res) => {
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
        const user = req.user ? req.user.toJSON() : null;
        const data = buildResponsePaginated({ ...products, sort, search, stock }, baseUrl);
        res.render('products', { title: 'Productos', sort, baseUrl, ...data, user });
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

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        //const cart = await CartsManager.getById(cid);
        const cartObject = cart.toObject();
        cartObject.products.forEach(product => {
            product.subtotal = product.product.price * product.quantity;
        });
        const totalPrice = cartObject.products.reduce((total, product) => total + product.subtotal, 0);
        const quantities = cartObject.products.map(product => product.quantity);
        res.render('carts', { title: 'Carrito', cartObject, totalPrice, quantities });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
})

router.get('/login', async (req, res) => {
    res.render('login', { title: 'Login' });
})

router.get('/profile', (req, res) => {
    const cid = '6568dcaae14f72845e268026';
    if (!req.user) {
        return res.redirect('/login')
    } 
    res.render('profile', { title: 'Perfil de usuario', user: req.user.toJSON(), cid });
   
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
                path: path.join( __dirname, './images/tori.jpg'),
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

export default router;