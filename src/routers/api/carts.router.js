import { Router } from 'express';

import CartsManager from '../../dao/Carts.manager.js';
import CartModel from '../../dao/models/cart.model.js';

const router = Router();

router.post('/carts', async (req, res) => {
    const { body } = req;
    const cart = await CartsManager.create(body);
    console.log(cart);
    res.status(201).json(cart);
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await CartsManager.getById(cid);
        if (!cart) {
            res.json({ error: 'Carrito no encontrado' })
        } else {
            res.status(200).json(cart)
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/carts/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await CartsManager.addProductToCart(cid, pid)
        res.status(200).json(updatedCart)
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/carts/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const newUpdatedCart = await CartsManager.deleteOneProductFromCart(cid, pid)
        res.status(200).json(newUpdatedCart)
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: error.message });
    }
});

router.put('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const updatedCart = await CartsManager.updateCart(cid, products)
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

router.delete('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const emptyCart = await CartsManager.deleteAllProductsFromCart(cid)
        console.log(emptyCart);
        res.status(200).json(emptyCart);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

router.put('/carts/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await CartsManager.getById(cid);
        const quantity = cart.products.find(item => item.product._id.toString() === pid.toString()).quantity;
        const decreaseQuantity = quantity - 1;
        await CartsManager.updateOneProductQuantity(cid, pid, decreaseQuantity);
        const updatedCart = CartsManager.getById(cid);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})


export default router;