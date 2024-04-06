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

const detailButtons = document.querySelectorAll('.detail-button');

detailButtons.forEach(button => {
  button.addEventListener('click', function () {
    const pid = this.getAttribute('data-pid');
    window.location.href = `/products/${pid}`;
  });
});

const addToCartButtons = document.querySelectorAll('.add-to-cart-button');

addToCartButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const pid = button.dataset.pid;

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
          title: "Error al agregar el producto al carrito",
          showConfirmButton: false,
          timer: 1500
        });
        throw new Error('Error al agregar el producto al carrito');
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
});

const becomePremiumButton = document.getElementById('become-premium-button');

becomePremiumButton.addEventListener('click', async () => {

  try {
    const response = await fetch(`/users/premium/current`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Error al intentar cambiar el rol de usuario",
        showConfirmButton: false,
        timer: 1500
      });
      throw new Error('Error al intentar cambiar el rol de usuario');
    } else {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "El rol de usuario se ha actualizado correctamente",
        showConfirmButton: false,
        timer: 3000
      });
      setTimeout(function () {
        window.location.href = '/products';
      }, 2500);
    }
  } catch (error) {
    console.error(error.message);
  }
})












