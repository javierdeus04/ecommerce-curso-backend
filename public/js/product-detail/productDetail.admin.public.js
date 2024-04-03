const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', async () => {

    try {
        const response = await fetch(`/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al intentar cerrar sesión');
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error(error.message);
    }
})

const updateButton = document.getElementById('update-button');

updateButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const productId = event.target.dataset.productId;

    const productTitle = document.getElementById('title').innerText.trim();
    const productCategory = document.getElementById('category').innerText.trim();
    const productDescription = document.getElementById('description').innerText.trim();
    const productPrice = document.getElementById('price').innerText.split(":");
    const productThumbnail = document.getElementById('thumbnail').getAttribute('src');
    const productStock = document.getElementById('stock').innerText.split(":")[1].trim();
    const productCode = document.getElementById('code').innerText.split(":")[1].trim();

    let formValues;

    async function runSweetAlert(productTitle, productCategory, productDescription, productPrice, productThumbnail, productStock, productCode) {

        const result = await Swal.fire({
            title: "Actualizar producto",
            html:
                `<input value="${productTitle}" id="swal-input1" placeholder="Titulo" class="swal2-input">` +
                `<input value="${productCategory}" id="swal-input2" placeholder="Categoria" class="swal2-input">` +
                `<input value="${productDescription}" id="swal-input3" placeholder="Descripcion" class="swal2-input">` +
                `<input value="${productPrice}" id="swal-input4" placeholder="Precio" class="swal2-input">` +
                `<input value="${productThumbnail}" id="swal-input5" placeholder="Thumbnail" class="swal2-input">` +
                `<input value="${productCode}" id="swal-input6" placeholder="Codigo" class="swal2-input">` +
                `<input value="${productStock}" id="swal-input7" placeholder="Stock" class="swal2-input">`,
            focusConfirm: false,
            confirmButtonText: "Actualizar",
            preConfirm: () => {
                return [
                    document.getElementById("swal-input1").value,
                    document.getElementById("swal-input2").value,
                    document.getElementById("swal-input3").value,
                    document.getElementById("swal-input4").value,
                    document.getElementById("swal-input5").value,
                    document.getElementById("swal-input6").value,
                    document.getElementById("swal-input7").value
                ];
            }
        });

        if (result.value) {
            formValues = result.value;
        }
    };

    await runSweetAlert(productTitle, productCategory, productDescription, productPrice, productThumbnail, productStock, productCode);

    if (formValues) {

        const [title, category, description, price, thumbnail, code, stock] = formValues;

        const atLeastOneFieldModified = formValues.some(value => value !== '');

        if (!atLeastOneFieldModified) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Todos los campos son obligatorios',
            });
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    category,
                    description,
                    price,
                    thumbnail,
                    code,
                    stock,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el producto');
            }
            console.log('Producto actualizado correctamente');
            window.location.href = `/products/${productId}`;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
})

const deleteButton = document.getElementById('delete-button');

deleteButton.addEventListener('click', (event) => {
    const productId = event.target.dataset.productId;

    Swal.fire({
        title: `Esta seguro que quiere eliminar el producto seleccionado?`,
        showDenyButton: true,
        confirmButtonText: "Eliminar",
        denyButtonText: `Cerrar`
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar el producto');
                }

                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Producto eliminado correctamente",
                    showConfirmButton: false,
                    timer: 3000
                  });

                console.log(`El producto ${productId} ha sido eliminado correctamente`);

                setTimeout(function() {
                    window.location.href = '/products';
                }, 2500);
            } catch (error) {
                console.error('Error:', error.message);
            };
        }
    });
});


