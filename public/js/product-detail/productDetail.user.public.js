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

const addToCartButton = document.getElementById('add-to-cart-button');

addToCartButton.addEventListener('click', async () => {
    const pid = addToCartButton.dataset.pid;

    try {
        const response = await fetch(`/carts/current/${pid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "No puede agregar un producto propio al carrito",
            showConfirmButton: false,
            timer: 2500
          });
            throw new Error('Error al agregar el producto al carrito: ' + response.statusText);
        }
        const data = await response.json();
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Producto agregado al carrito",
            showConfirmButton: false,
            timer: 1500
          });
        return data;
    } catch (error) {
        console.error(error.message);
    }
});


