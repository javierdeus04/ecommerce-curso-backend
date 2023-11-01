const socket = io();

const searchProduct = document.getElementById('search-button');

searchProduct.addEventListener('click', (event) => {
    event.preventDefault();
    const inputSearch = document.getElementById('search-input');
    const productSearchId = inputSearch.value;
    console.log('Enviando solicitud de búsqueda para el ID:', productSearchId);
    socket.emit('searchProduct', productSearchId);
    inputSearch.value = '';
})

socket.on('result', ({ response }) => {
    const productListUl = document.getElementById('list-products');
    productListUl.innerHTML = '';
    if (response.error) {
        console.error(response.error);
    } else {
        Swal.fire({
            title: `<strong><u>Producto: ${response.title}</u></strong>`,
            html:
                `<li>Categoria: ${response.category}</li><br>` +
                `<li>Descripcion: ${response.description}</li><br>` +
                `<li>Precio: ${response.price}</li><br>` +
                `<li>Codigo: ${response.code}</li><br>` +
                `<li>Stock: ${response.stock}</li>`,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Eliminar',
            focusConfirm: false,
            customClass: {
                cancelButton: 'custom-delete-button-class',
                confirmButton: 'custom-update-button-class'
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const productId = response.id; 
                const productTitle = response.title;
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                const productId = response.id;
                deleteProduct(productId);
            }
        });
    }
});


const formNewProduct = document.getElementById('form-newproduct');

formNewProduct.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputTitle = document.getElementById('title-input');
    const inputCategory = document.getElementById('category-input');
    const inputDescription = document.getElementById('description-input');
    const inputPrice = document.getElementById('price-input');
    const inputThumbnail = document.getElementById('thumbnail-input');
    const inputCode = document.getElementById('code-input');
    const inputStock = document.getElementById('stock-input');

    const newProduct = {
        title: inputTitle.value,
        category: inputCategory.value,
        description: inputDescription.value,
        price: inputPrice.value,
        thumbnail: inputThumbnail.value,
        code: inputCode.value,
        stock: inputStock.value,
    }

    socket.emit('addProduct', newProduct);
    formNewProduct.reset();
});

socket.on('productsList', ({ productsList }) => {
    const productListUl = document.getElementById('list-products');
    productListUl.innerText = '';
    productsList.forEach(product => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        const deleteButton = document.createElement('button');
        const updateButton = document.createElement('button');
        img.src = product.thumbnail;
        updateButton.innerText = "Actualizar producto";
        updateButton.id = `update-button${product.id}`;
        deleteButton.innerText = "Eliminar producto";
        deleteButton.id = `delete-button${product.id}`;
        li.innerText =
            `   Título: ${product.title}
                Categoría: ${product.category}
                Descripción: ${product.description}
                Precio: ${product.price}
                Código: ${product.code}
                Stock: ${product.stock}`;
        li.appendChild(img);
        li.appendChild(updateButton);
        li.appendChild(deleteButton);
        productListUl.appendChild(li);
        assignUpdateButtonHandler(product.id, product.title);
        assignDeleteButtonHandler(product.id);
    });
});

socket.on('addProductResponse', ({ product, error }) => {
    if (error) {
        console.error(error);
    } else {
        const productListUl = document.getElementById('list-products');
        const li = document.createElement('li');
        const img = document.createElement('img');
        const deleteButton = document.createElement('button');
        img.src = product.thumbnail;
        deleteButton.innerText = "Eliminar producto"
        deleteButton.id = `delete-button${product.id}`;
        li.innerText =
            `   Título: ${product.title}
                Categoría: ${product.category}
                Descripción: ${product.description}
                Precio: ${product.price}
                Código: ${product.code}
                Stock: ${product.stock}`;
        li.appendChild(img);
        li.appendChild(deleteButton);
        productListUl.appendChild(li);
    }
});

socket.on('updateProductResponse', ({ response }) => {
    if (response.error) {
        console.error(response.error);
    } else {
        console.log(response.message);
    }
});

function assignUpdateButtonHandler(productId, productTitle) {
    const updateProduct = document.getElementById(`update-button${productId}`);
    updateProduct.addEventListener('click', async () => {
        const { value: formValues } = await Swal.fire({
            title: `Actualizar producto: ${productTitle}`,
            html:
                '<input id="swal-input1" placeholder="Titulo" class="swal2-input">' +
                '<input id="swal-input2" placeholder="Categoria" class="swal2-input">' +
                '<input id="swal-input3" placeholder="Descripcion" class="swal2-input">' +
                '<input id="swal-input4" placeholder="Precio" class="swal2-input">' +
                '<input id="swal-input5" placeholder="Thumbnail" class="swal2-input">' +
                '<input id="swal-input6" placeholder="Codigo" class="swal2-input">' +
                '<input id="swal-input7" placeholder="Stock" class="swal2-input">',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    title: document.getElementById('swal-input1').value,
                    category: document.getElementById('swal-input2').value,
                    description: document.getElementById('swal-input3').value,
                    price: parseFloat(document.getElementById('swal-input4').value),
                    thumbnail: document.getElementById('swal-input5').value,
                    code: document.getElementById('swal-input6').value,
                    stock: parseInt(document.getElementById('swal-input7').value),
                };
            }
        });

        console.log('acaaaa', formValues)


        if (!formValues.title && !formValues.category && !formValues.description && !formValues.price && !formValues.thumbnail && !formValues.code && !formValues.stock) {
            console.log('Mal', formValues);
        } else {
            Swal.fire('Producto actualizado correctamente');
            socket.emit('updateProduct', { productId, formValues }, (response) => {
                if (response.error) {
                    console.error(response.error);
                } else {
                    Swal.fire('Producto actualizado correctamente');
                }
            });
        }
    });
};

function assignDeleteButtonHandler(productId) {
    const deleteProduct = document.getElementById(`delete-button${productId}`);
    deleteProduct.addEventListener('click', () => {
        socket.emit('deletedProduct', { productId });
    });
};




