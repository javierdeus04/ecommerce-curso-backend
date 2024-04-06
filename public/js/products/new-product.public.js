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

const addProduct = document.getElementById('new-product-button');

addProduct.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo crear el producto",
              });
            throw new Error('Error al crear producto');
        } else {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Producto creado correctamente",
                showConfirmButton: false,
                timer: 1500
              });
              window.location.href = `/products`;
        }        
    } catch (error) {
        console.error('Error:', error.message);
    };
})