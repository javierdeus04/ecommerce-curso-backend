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
            const existingCart = await CartModel.findById(cid);

            if (!existingCart) {
                const newCartData = { products: [{ product: pid }] };
                return CartModel.create(newCartData);
            }
            const existingProduct = existingCart.products.find(
                (item) => item.product._id.toString() === pid.toString()
            );
            if (existingProduct) {
                existingProduct.quantity = (existingProduct.quantity || 1) + 1;
            } else {
                existingCart.products.push({ product: pid, quantity: 1 });
            }
            const updatedCart = await existingCart.save();

            return updatedCart.populate('products.product');
        } catch (error) {
            throw new Error('Error al agregar producto al carrito: ' + error.message);
        }
    }

    static async deleteOneProductFromCart(cid, pid) {
        return CartModel.findByIdAndUpdate(
            cid,
            { $pull: { products: { product: pid } } },
            { new: true }
        );
    };

    static async updateOneProductQuantity(cid, productId, quantity) {
        try {
            const filter = { _id: cid, "products.product": productId };
            const update = { $set: { "products.$.quantity": quantity } };
            const options = { new: true };
            await CartModel.findOneAndUpdate(filter, update, options);
            const updatedCart = await CartModel.findById(cid).populate('products.product');;
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

