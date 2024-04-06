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












