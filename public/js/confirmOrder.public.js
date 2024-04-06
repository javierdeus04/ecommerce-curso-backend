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

const purchase = document.getElementById('purchase');

purchase.addEventListener('click', async () => {

    try {
      const response = await fetch(`/carts/current/purchase`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

console.log(response);  
      if (!response.ok) {
        throw new Error('Error al intentar procesar compra');
      } else {
        window.location.href = '/current/confirmed-purchase';
      }
    } catch (error) {
      console.error(error.message);
    }
  })