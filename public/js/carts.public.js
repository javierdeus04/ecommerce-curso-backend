const deleteButtons = document.querySelectorAll('.delete-button');

deleteButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const pid = button.dataset.productId;
        Swal.fire({
            title: `¿Está seguro de que quiere eliminar el producto seleccionado?`,
            showDenyButton: true,
            confirmButtonText: "Eliminar",
            denyButtonText: `Cerrar`
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/carts/current/${pid}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Error al eliminar el producto del carrito');
                    }
                    const data = await response.json();
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Producto eliminado correctamente",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    window.location.href = `/carts/current`
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

    Swal.fire({
        title: `Esta seguro que quiere vaciar el carrito?`,
        showDenyButton: true,
        confirmButtonText: "Vaciar",
        denyButtonText: `Cerrar`
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/carts/current`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al vaciar el carrito');
                }

                console.log(`El carrito ha sido vaciado correctamente`);

                window.location.href = `/carts/current`;
            } catch (error) {
                console.error('Error:', error.message);
            };
        }
    });
})

const finalizePurchase = document.getElementById('finalize-purchase');

finalizePurchase.addEventListener('click', () => {

    Swal.fire({
        title: `Confirmar compra?`,
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: `Cancelar`
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/carts/current/purchase`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al realizar compra');
                }

                console.log(`Pedido realizado con exito`);

                window.location.href = `/carts/current`;
            } catch (error) {
                console.error('Error:', error.message);
            };
        }
    });
})
