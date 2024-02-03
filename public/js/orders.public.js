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
    const oid = this.dataset.oid;
    window.location.href = `/users/current/orders/${oid}`;
  });
});

const deleteButtons = document.querySelectorAll('.delete-button');

deleteButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const oid = button.dataset.oid;

    Swal.fire({
      title: 'Esta seguro que quiere eliminar la orden seleccionada?',
      showDenyButton: true,
      confirmButtonText: 'Eliminar',
      denyButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/orders/current/${oid}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Error al intentar eliminar la orden');
          }

          Swal.fire({
            position: "center",
            icon: "success",
            title: "Orden eliminada correctamente",
            showConfirmButton: false,
            timer: 1500
          });

          console.log(`Orden ${oid} eliminada correctamente`);

          window.location.href = '/users/current/orders'
        } catch (error) {
          console.error(error.message);
        }
      }
    });
  });
});