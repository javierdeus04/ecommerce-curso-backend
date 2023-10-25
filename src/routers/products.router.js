const { Router } = require('express');
const productManager = require('../products.app');

const router = Router();
const products = new productManager();

router.get('/products', async (req, res) => {
    try {
        const productList = await products.getProducts();
        const {query} = req;
        const {limit} = query;
        if (!limit) {
            res.json(productList)
        } else {
            const result = productList.slice(0, limit)
            res.json(result)
        }        
    } catch {
        res.status(500).send({ error: 'Error al obtener productos' });       
    }
});

router.get('/products/:pid', async (req, res) => {    
    try {
        const id = req.params.pid
        const product = await products.getProductsById(id)   
        if (!product) {
            res.json({error: 'Producto no encontrado'})
        } else {            
            res.json(product) 
        }            
    } catch (error) {
        res.status(500).send({ error: 'Error al obtener productos' });
    }  
});

router.post('/products', async  (req, res) => {
    try {
        const { title, category, description, price, thumbnail, code, stock } = req.body;
        const newProduct = await products.addProduct(title, category, description, price, thumbnail, code, stock);
        res.status(201).send(newProduct)        
    } catch (error) {
        res.status(500).send({ error: 'Error al agregar producto' });        
    }    
});

router.put('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProductData = req.body;
        const updatedProduct = await products.updateProduct(productId, updatedProductData)
        res.status(201).json(updatedProduct)        
    } catch (error) {
        res.status(500).send({ error: 'Error al actualizar producto' });                
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProductList = await products.deleteProduct(productId);
        res.status(200).json(updatedProductList);
    } catch (error) {
        res.status(500).send({ error: 'Error al actualizar producto' });                 
    }
});


module.exports = router;

