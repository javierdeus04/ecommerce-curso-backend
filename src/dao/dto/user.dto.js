export const createUserDTO = (users) => {
    if (!users) {
        throw new Error('Datos de usuario no válidos');
    };
    
    if (Array.isArray(users)) {
        return users.map(user => {
            return {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                orders: user.orders
            };
        });
    } else {
        return {
            first_name: users.first_name,
            last_name: users.last_name,
            email: users.email,
            age: users.age,
            orders: users.orders
        };
    }
};