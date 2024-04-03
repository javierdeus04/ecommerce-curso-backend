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
          const response = await fetch(`/premium/products/${pid}`, {
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
          setTimeout(function () {
            window.location.href = '/users/current';
          }, 2500);
        } catch (error) {
          console.error(error.message);
        }
      }
    })
  });
});

