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
    const uid = this.getAttribute('data-uid');
    window.location.href = `/users/${uid}`;
  });
});

const changeRoleButtons = document.querySelectorAll('.change-role-button');

changeRoleButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const uid = button.getAttribute('data-uid');
    Swal.fire({
      title: `¿Está seguro de que quiere cambiar el rol del usuario seleccionado?`,
      showDenyButton: true,
      confirmButtonText: "Cambiar",
      denyButtonText: `Cerrar`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/users/premium/${uid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "Error",
              text: "No se pudo modificar el rol del usuario",
            });
            throw new Error('Error al intentar modificar el rol del usuario');
          } else {
            const data = await response.json();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Rol modificado correctamente",
              showConfirmButton: false,
              timer: 3000
            });
            setTimeout(function () {
              window.location.href = '/users';
            }, 2500);
            return data;
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    })
  });
});

const deleteButtons = document.querySelectorAll('.delete-button');

deleteButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const uid = button.getAttribute('data-uid');
    Swal.fire({
      title: `¿Está seguro de que quiere eliminar al usuario seleccionado?`,
      showDenyButton: true,
      confirmButtonText: "Eliminar",
      denyButtonText: `Cerrar`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/users/${uid}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "Error",
              text: "No se pudo eliminar al usuario",
            });
            throw new Error('Error al eliminar al usario');
          }
          const data = await response.json();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Usuario eliminado correctamente",
            showConfirmButton: false,
            timer: 3000
          });
          setTimeout(function () {
            window.location.href = '/users';
          }, 2500);
          return data;
        } catch (error) {
          console.error(error.message);
        }
      }
    })
  });
});

const deleteInactiveUsers = document.getElementById('delete-inactive-users-button');

deleteInactiveUsers.addEventListener('click', async () => {

  Swal.fire({
    title: `¿Está seguro de que quiere eliminar a los usuarios inactivos?`,
    showDenyButton: true,
    confirmButtonText: "Eliminar",
    denyButtonText: `Cerrar`
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/users`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al eliminar a los usuarios');
        }
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Usuarios eliminados correctamente",
          showConfirmButton: false,
          timer: 3000
        });
        setTimeout(function () {
          window.location.href = '/users';
        }, 2500);
      } catch (error) {
        console.error(error.message);
      }
    }
  })
})


