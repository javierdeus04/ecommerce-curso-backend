const { Router } = require('express');
const cartManager = require('../../carts.app');

const router = Router();
const carts = new cartManager();

router.get('/carts', async (req, res) => {
    try {
        const cartList = await carts.getCarts();        
        res.json(cartList)
    } catch {
        res.status(500).send({ error: 'Error al obtener productos' });       
    }
})

router.post('/carts', async (req, res) => {
    try {
        const newCart = await carts.addCart();
        res.status(201).send(newCart)    
    } catch (error) {
        res.status(500).send({ error: 'Error al agregar carrito' });      
    }
        
});

router.get('/carts/:cid', async (req, res) => {    
    try {
        const id = req.params.cid
        const cart = await carts.getCartsById(id)
        const { productsArray } = cart   
        if (!cart) {
            res.json({error: 'Carrito no encontrado'})
        } else {            
            res.json(productsArray) 
        }            
    } catch (error) {
        res.status(500).send({ error: 'Error al obtener carrito' });
    }  
});

router.post('/carts/:cid/product/:pid', async  (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await carts.addProductToCart(cid, pid)
        res.status(200).json(updatedCart)        
    } catch (error) {
        res.status(500).send({ error: 'Error al agregar producto' });        
    }    
});

module.exports = router;