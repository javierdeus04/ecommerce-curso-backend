const purchase = document.getElementById('purchase');

purchase.addEventListener('click', async () => {

    try {
      const response = await fetch(`/carts/current/purchase`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error al intentar procesar compra');
      } else {
        window.location.href = '/current/confirmed-purchase';
      }
    } catch (error) {
      console.error(error.message);
    }
  })