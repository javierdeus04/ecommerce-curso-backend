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

const approveDocuments = document.getElementById('approve-documents-button');

approveDocuments.addEventListener('click', async () => {

  const userId = window.location.pathname.split('/').pop();

  try {
    const response = await fetch(`/users/admin/approve-documents/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      Swal.fire('Error al intentar aprobar los documentos');
      throw new Error('Error al intentar ejecutar "/users/admin/approve-documents/:userId"');
    } else {
      Swal.fire('Documentos aprobados');
    }
  } catch (error) {
    console.error(error.message);
  }
})
