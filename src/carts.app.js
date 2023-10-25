const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path')
const productManager = require('./products.app');

const products = new productManager();

class CartManager {
    constructor() {
        this.carts = []
        this.id = uuidv4();
        this.productsArray = []
        this.path = path.join(__dirname, 'carts.db.json');
    }

    getCarts = async (silent = false) => {
        try {
            const fileExists = fs.existsSync(this.path);
            if (fileExists) {
                const cartsList = await fs.promises.readFile(this.path, 'utf-8');
                this.carts = JSON.parse(cartsList)
                this.id = Math.max(...this.carts.map(cart => cart.id));
                if (!silent) {
                    console.log(this.carts);
                }
                return this.carts;
            } else {
                this.carts = [];
                if (!silent) {
                    console.log("Archivo de carritos no encontrado. Carritos vacíos:", this.carts);
                }
                return this.carts;
            }
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            throw error;
        }
    }

    async addCart() {
        try {
            await this.getCarts(true);
            const newCartId = uuidv4();
            const newCart = {
                id: newCartId,
                productsArray: this.productsArray,
            }
            this.carts.push(newCart);
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts), 'utf-8');
            return newCart;
        } catch (error) {
            console.log(`Ha ocurrido un error: ${error.message}`);
            return { error: 'Error al agregar carrito' };
        }
    }

    getCartsById = async (id) => {
        try {
            await this.getCarts(true);
            const cart = this.carts.find(cart => cart.id === id)
            if (cart) {
                return cart
            } else {
                console.log('ERROR: carrito no encontrado')
            }
        } catch (error) {
            console.log(`Ha ocurrido un error: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            await this.getCarts(true);
            const cart = this.carts.find(cart => cart.id === cartId);

            if (!cart) {
                throw new Error('Carrito no encontrado');
            };
            const productToAdd = await products.getProductsById(productId);
            if (!productToAdd) {
                throw new Error('Producto no encontrado');
            };

            const productCart = {
                product: productToAdd.id,
                quantity: 1
            }

            let productExists = false;
            for (let i = 0; i < cart.productsArray.length; i++) {
                if (cart.productsArray[i].product === productToAdd.id) {
                    productExists = true;
                    cart.productsArray[i].quantity += 1;
                    await fs.promises.writeFile(this.path, JSON.stringify(this.carts), 'utf-8');
                    return { cart };
                }
            }

            if (!productExists) {
                cart.productsArray.push(productCart);
                await fs.promises.writeFile(this.path, JSON.stringify(this.carts), 'utf-8');
                return { productCart };
            }

        } catch (error) {
            console.log(`Ha ocurrido un error: ${error.message}`);
        }
    }
}

module.exports = CartManager;

