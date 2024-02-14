export const generatorProductError = (data) => {
    return `Todos los campos son requeridos y deben ser validos.
    Lista de campos recibidos en la solicitud:
        -title: ${data.title}
        -category: ${data.category} 
        -description: ${data.description}
        -price: ${data.price}
        -thumbnail: ${data.thumbnail}
        -code: ${data.code}
        -stock: ${data.stock}
        `;
}

export const generatorProductIdError = (id) => {
    return `Identificador de producto no valido.
    ID recibido: ${id}
    `;
}

export const generatorUserError = (data) => {
    return `Todos los campos son requeridos y deben ser validos.
    Lista de campos recibidos en la solicitud:
        -first_name: ${data.first_name}
        -last_name: ${data.last_name} 
        -email: ${data.email}
        -password: ${data.password}
        -age: ${data.age}
        `;
}

export const generatorUserIdError = (id) => {
    return `Identificador de usuario no valido.
    ID recibido: ${id}
    `;
}

export const generatorTicketError = (data) => {
    return `Todos los campos son requeridos y deben ser validos.
    Lista de campos recibidos en la solicitud:
        -code: ${data.code}
        -amount: ${data.amount} 
        -purchaser: ${data.email}
        `;
}

export const generatorTicketIdError = (id) => {
    return `Identificador de ticket no valido.
    ID recibido: ${id}
    `;
}

export const generatorOrderError = (data) => {
    return `Todos los campos son requeridos y deben ser validos.
    Lista de campos recibidos en la solicitud:
        -code: ${data.code}
        -user: ${data.amount} 
        -products: ${data.email}
        -total: ${data.total}
        -status: ${data.status}
        `;
}

export const generatorOrderIdError = (id) => {
    return `Identificador de orden no valido.
    ID recibido: ${id}
    `;
}

export const generatorCartIdError = (id) => {
    return `Identificador de carrito no valido.
    ID recibido: ${id}
    `;
}



