import { logger } from "../../config/logger.js"

export const createUserDTO = (users) => {

    if (!users) {
        logger.error('Invalid user data');
        throw new Error('Datos de usuario no válidos');
    };
    
    if (Array.isArray(users)) {
        return users.map(user => {
            return {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                orders: user.orders,
                role: user.role
            };
        });
    } else {
        return {
            first_name: users.first_name,
            last_name: users.last_name,
            email: users.email,
            age: users.age,
            cart: users.cart,
            orders: users.orders,
            role: users.role
        };
    }
};