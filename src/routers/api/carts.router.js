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
        const cart = await CartsManager.getById(cid).populate('products.product');
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
        console.log(newUpdatedCart);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.put('/carts/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const updatedQuantityProduct = await CartsManager.updateProductQuantity(cid, pid, quantity);
        res.status(200).json(updatedQuantityProduct);
    } catch (error) {
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


export default router;