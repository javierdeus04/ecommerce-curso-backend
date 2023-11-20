const addButton = document.getElementById('add-button');

addButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const { value: formValues } = await Swal.fire({
        title: "Nuevo producto",
        html:
                '<input id="swal-input1" placeholder="Titulo" class="swal2-input">' +
                '<input id="swal-input2" placeholder="Categoria" class="swal2-input">' +
                '<input id="swal-input3" placeholder="Descripcion" class="swal2-input">' +
                '<input id="swal-input4" placeholder="Precio" class="swal2-input">' +
                '<input id="swal-input5" placeholder="Thumbnail" class="swal2-input">' +
                '<input id="swal-input6" placeholder="Codigo" class="swal2-input">' +
                '<input id="swal-input7" placeholder="Stock" class="swal2-input">',
        focusConfirm: false,
        confirmButtonText: "Agregar",
        preConfirm: () => {
          return [
            document.getElementById("swal-input1").value,
            document.getElementById("swal-input2").value,
            document.getElementById("swal-input3").value,
            document.getElementById("swal-input4").value,
            document.getElementById("swal-input5").value,
            document.getElementById("swal-input6").value,
            document.getElementById("swal-input7").value
          ];
        }
      });
      if (formValues) {

        

        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: formValues[0],
              category: formValues[1],
              description: formValues[2],
              price: formValues[3],
              thumbnail: formValues[4],
              code: formValues[5],
              stock: formValues[6],
            }),
          });

          if (!response.ok) {
            throw new Error('Error al agregar el producto');
          }
          console.log('Producto agregado correctamente');
          window.location.href = '/products';          
        } catch (error) {
          console.error('Error:', error.message);
        }
      }
})

const detailButtons = document.querySelectorAll('.detail-button');

detailButtons.forEach(button => {
    button.addEventListener('click', function() {
        const pid = this.getAttribute('data-pid');
        window.location.href = `/products/${pid}`;
    });
});




