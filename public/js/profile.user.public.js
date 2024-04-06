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

const uploadDocuments = document.getElementById('upload-documents-button');

uploadDocuments.addEventListener('click', async (event) => {
  event.preventDefault();


  const { value: formValues } = await Swal.fire({
    title: "Documentacion requerida",
    html: `
      <label><b>- Identificacion:</b></label>
      <input id="swal-input1" type="file" accept="image/*">
      <label><b>- Comprobante de domicilio:</b></label>
      <input id="swal-input2" type="file" accept="image/*">
      <label><b>- Comprobante de estado de cuenta:</b></label>
      <input id="swal-input3" type="file" accept="image/*">
      `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("swal-input1").files[0],
        document.getElementById("swal-input2").files[0],
        document.getElementById("swal-input3").files[0]
      ];
    }
  });
  if (formValues) {
    const formData = new FormData();
    formData.append('files', formValues[0]);
    formData.append('files', formValues[1]);
    formData.append('files', formValues[2]);

    try {
      const response = await fetch('/users/current/documents', {
        method: 'POST',
        body: formData,
        headers: {
        }
      });
      if (response.ok) {
        Swal.fire('Documentos subidos correctamente');
      } else {
        Swal.fire('Error al cargar documentos');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error al cargar documentos');
    }
  }
})
