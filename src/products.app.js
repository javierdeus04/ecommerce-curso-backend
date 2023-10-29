import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { __dirname } from './utils.js';

export class ProductManager {

    constructor() {
        this.products = [];
        this.lastId = 0;
        this.path = path.join(__dirname, 'products.db.json');
    }

    getProducts = async (silent = false) => {
        try {
            const fileExists = fs.existsSync(this.path);
            if (fileExists) {                
                const listProducts = await fs.promises.readFile(this.path, 'utf-8');
                this.products = JSON.parse(listProducts)
                this.lastId = Math.max(...this.products.map(product => product.id));
                if (!silent) {
                    console.log(this.products);
                }
                return this.products;
            } else {
                this.products = [];
                if (!silent) {
                    console.log(this.products);
                }
                return this.products; 
            }
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            throw error; 
        }
    }

    async addProduct(title, category, description, price, thumbnail, code, stock) {
        try {
            await this.getProducts(true);
            if (this.products.length === 0) {
                this.lastId = 0;
            }
            const id = uuidv4();
            const status = true;
            const product = {
                id,
                title,
                category,
                description,
                price,
                thumbnail,
                code,
                status,
                stock,
            };
            if (!title || !category || !description || !price || !code || !stock) {
               return { error: "ERROR: Todos los campos son obligatorios"};
            }
            const codeExists = this.products.some(p => p.code === code);
            if (codeExists) {
                return { error: `ERROR: El código '${code}' ya existe.`};
            }
            this.products.push(product);
            await fs.promises.writeFile(this.path, JSON.stringify(this.products), 'utf-8');
            this.lastId = id;
            console.log('Producto agregado correctamente');
            return product;
        } catch (error) {
            console.log(`Ha ocurrido un error: ${error.message}`);
            return { error: 'Error al agregar producto' };
        }
    }

    getProductsById = async (id) => {
        try {
            await this.getProducts(true);
            const product = this.products.find(product => product.id === id)
            if (product) {
                return product
            } else {
                console.log('ERROR: Producto no encontrado')
            }
        } catch (error) {
            console.log(`Ha ocurrido un error: ${error.message}`);
        }
    }

    deleteProduct = async (id) => {
        try {
            await this.getProducts(true);
            const productToDelete = this.products.findIndex(product => product.id === id)
            if (productToDelete !== -1) {
                this.products.splice(productToDelete, 1);
                await fs.promises.writeFile(this.path, JSON.stringify(this.products), 'utf-8');
                return { message: `El producto ${id} ha sido eliminado correctamente`};
            } else {
                console.log('ERROR: Producto no encontrado');
                return this.products;
            }
            
        } catch (error) {
            console.log(`Ha ocurrido un error: ${error.message}`);
            return this.products;
        }
    }

    updateProduct = async (id, updatedFields) => {
        try {
            await this.getProducts(true);
            const productToUpdate = this.products.findIndex(product => product.id === id)
            if (productToUpdate === -1) {
                return { error: 'Producto no encontrado' };
            }
            const existingProduct = this.products[productToUpdate]
            for (const field in updatedFields) {
                if (existingProduct.hasOwnProperty(field)) {
                    existingProduct[field] = updatedFields[field]
                } else {
                    return { error: 'Campo que está intentando modificar no existe' };
                }
            }
            this.products[productToUpdate] = existingProduct;
            await fs.promises.writeFile(this.path, JSON.stringify(this.products), 'utf-8');
            return { message: `El producto ${id} ha sido actualizado correctamente` };
        } catch (error) {
            return { error: 'Ha ocurrido un error: ' + error.message };
        }
    }
}

