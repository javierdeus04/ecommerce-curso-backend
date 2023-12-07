const homeButton = document.getElementById('home-button');

homeButton.addEventListener('click', () => {
    window.location.href = '/products';
});

const deleteButtons = document.querySelectorAll('.delete-button');

deleteButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const cid = '6568dcaae14f72845e268026';
        const pid = button.dataset.productId;
        Swal.fire({
            title: `¿Está seguro de que quiere eliminar el producto seleccionado?`,
            showDenyButton: true,
            confirmButtonText: "Eliminar",
            denyButtonText: `Cerrar`
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/carts/${cid}/product/${pid}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Error al eliminar el producto del carrito: ' + response.statusText);
                    }
                    const data = await response.json();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Producto eliminado correctamente",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    window.location.href = `/carts/${cid}`
                    return data;
                } catch (error) {
                    console.error(error.message);
                }
            }
        })
    });
});

const emptyCart = document.getElementById('empty-cart-button');

emptyCart.addEventListener('click', () => {

    const cid = '6568dcaae14f72845e268026';

    Swal.fire({
        title: `Esta seguro que quiere vaciar el carrito?`,
        showDenyButton: true,
        confirmButtonText: "Vaciar",
        denyButtonText: `Cerrar`
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/carts/${cid}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al vaciar el carrito');
                }

                console.log(`El carrito ${cid} ha sido vaciado correctamente`);

                window.location.href = `/carts/${cid}`;
            } catch (error) {
                console.error('Error:', error.message);
            };
        }
    });
})

const decreaseProductQuantityButtons = document.querySelectorAll('.decrease-product');

decreaseProductQuantityButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const cid = '6568dcaae14f72845e268026';
        const pid = button.dataset.productId;
        try {
            const response = await fetch(`/carts/${cid}/product/${pid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto del carrito: ' + response.statusText);
            }
            const data = await response.json();
            window.location.href = `/carts/${cid}`
            return data;
        } catch (error) {
            console.error(error.message);
        }
    });
});

const increaseProductQuantityButtons = document.querySelectorAll('.increase-product');

increaseProductQuantityButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const cid = '6568dcaae14f72845e268026';
        const pid = button.dataset.pid;

        try {
            const response = await fetch(`/carts/${cid}/product/${pid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al agregar el producto al carrito: ' + response.statusText);
            }
            const data = await response.json();
            window.location.href = `/carts/${cid}`;
            return data;
        } catch (error) {
            console.error(error.message);
        }
    });
});

