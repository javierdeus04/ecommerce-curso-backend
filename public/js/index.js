
const socket = io();

const formNewProduct = document.getElementById('form-newproduct');

formNewProduct.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputTitle = document.getElementById('title-input');
    const inputCategory = document.getElementById('category-input');
    const inputDescription = document.getElementById('descrption-input');
    const inputPrice = document.getElementById('price-input');
    const inputCode = document.getElementById('code-input');
    const inputStock = document.getElementById('stock-input');

    const newProduct = {
        title: inputTitle.value,
        category: inputCategory.value,
        description: inputDescription.value,
        price: inputPrice.value,
        code: inputCode.value,
        stock: inputStock.value,
    }

    socket.emit('newProduct', newProduct);
    formNewProduct.reset();
});

socket.on('productsList', ({ productsList }) => {
    const productListUl = document.getElementById('list-products');
    productListUl.innerText = '';
    productsList.forEach(product => {
        const li = document.createElement('li');
        li.innerText = 
        `   Título: ${product.title},
            Categoría: ${product.category},
            Descripción: ${product.description},
            Precio: ${product.price},
            Código: ${product.code},
            Stock: ${product.stock},`;
        productListUl.appendChild(li);
    });
});

socket.on('newProduct', ({ newProduct }) => {
    const productListUl = document.getElementById('list-products');
    productListUl.innerText = '';
    const li = document.createElement('li');
    li.innerText =
     `  Título: ${newProduct.title},
        Categoría: ${newProduct.category},
        Descripción: ${newProduct.description},
        Precio: ${newProduct.price},
        Código: ${newProduct.code},
        Stock: ${newProduct.stock}`;
    productListUl.appendChild(li);
});

