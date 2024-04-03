import { logger } from "../../config/logger.js"

export const createUserDTO = (users) => {

    if (!users) {
        logger.error('Invalid user data');
        throw new Error('Datos de usuario no válidos');
    };
    
    if (Array.isArray(users)) {
        return users.map(user => {
            return {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                profile_picture: user.profile_picture,
                orders: user.orders,
                tickets: user.tickets,
                role: user.role,
                last_connection: user.last_connection,
            };
        });
    } else {
        return {
            _id: users._id,
            first_name: users.first_name,
            last_name: users.last_name,
            email: users.email,
            age: users.age,
            profile_picture: users.profile_picture,
            cart: users.cart,
            orders: users.orders,
            tickets: users.tickets,
            role: users.role,
            last_connection: users.last_connection,
        };
    }
};