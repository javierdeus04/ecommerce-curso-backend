const updateButton = document.getElementById('update-button');

updateButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const productId = event.target.dataset.productId;

    const { value: formValues } = await Swal.fire({
        title: "Actualizar producto",
        html:
            '<input id="swal-input1" placeholder="Titulo" class="swal2-input">' +
            '<input id="swal-input2" placeholder="Categoria" class="swal2-input">' +
            '<input id="swal-input3" placeholder="Descripcion" class="swal2-input">' +
            '<input id="swal-input4" placeholder="Precio" class="swal2-input">' +
            '<input id="swal-input5" placeholder="Thumbnail" class="swal2-input">' +
            '<input id="swal-input6" placeholder="Codigo" class="swal2-input">' +
            '<input id="swal-input7" placeholder="Stock" class="swal2-input">',
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
    if (formValues) {

        const [title, category, description, price, thumbnail, code, stock] = formValues;

        if (!title || !category || !description || !price || !thumbnail || !code || !stock) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Todos los campos son obligatorios',
            });
            return;        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formValues[0],
                    category: formValues[1],
                    description: formValues[2],
                    price: formValues[3],
                    thumbnail: formValues[4],
                    code: formValues[5],
                    stock: formValues[6],
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

                console.log(`El producto ${productId} ha sido eliminado correctamente`);

                window.location.href = '/products';
            } catch (error) {
                console.error('Error:', error.message);
            };
        }
    });
});


