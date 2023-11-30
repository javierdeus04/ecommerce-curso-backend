import CartModel from './models/cart.model.js'

export default class CartsManager {

    static async getById(cid) {
        try {
            const cart = await CartModel.findById(cid).populate('products.product');
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart;
        } catch (error) {
            throw new Error('Error al intenar buscar el carrito: ' + error.message);
        }
    };

    static create(data) {
        return CartModel.create(data);
    };

    static async addProductToCart(cid, pid) {
        try {
            const existingCart = await CartModel.findById(cid).populate('products.product');

            if (!existingCart) {
                const newCartData = { products: [{ product: pid }] };
                return CartModel.create(newCartData);
            }
            const updatedCart = await CartModel.findOneAndUpdate(
                { _id: cid },
                { $push: { products: { product: pid } } },
                { new: true }
            ).populate('products.product');
            return updatedCart;
        } catch (error) {
            throw new Error('Error al agregar producto al carrito: ' + error.message);
        }
    }

    static async deleteProductFromCart(cid, product) {
        return CartModel.findByIdAndUpdate(
            cid,
            { $pull: { products: product } },
            { new: true }
        );
    };

    static async updateOneProductQuantity(cid, productId, quantity) {
        try {
            const filter = { _id: cid, "products.productId": productId };
            const update = { $set: { "products.$.quantity": quantity } };
            const options = { new: true };

            const updatedCart = await CartModel.findOneAndUpdate(filter, update, options);

            if (!updatedCart) {
                throw new Error('Carrito o producto no encontrado');
            }

            return updatedCart;
        } catch (error) {
            throw new Error('Error al actualizar la cantidad del producto en el carrito: ' + error.message);
        }
    }

    static async updateCart(cid, products) {
        try {
            const updatedCart = await CartModel.findOneAndUpdate(
                { _id: cid },
                { $push: { products: products } },
                { new: true }
            );
            console.log(updatedCart);
            return updatedCart;

        } catch (error) {
            throw new Error('Error al actualizar el carrito: ' + error.message);
        }
    }

    static async deleteAllProductsFromCart(cid) {
        return CartModel.findByIdAndUpdate(
            cid,
            { $set: { products: [] } },
            { new: true }
        );
    }
}

