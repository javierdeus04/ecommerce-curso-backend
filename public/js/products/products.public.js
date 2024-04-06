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
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Debe estar logueado",
      showConfirmButton: false,
      timer: 1500
    });
  });
});