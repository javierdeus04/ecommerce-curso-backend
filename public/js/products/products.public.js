const detailButtons = document.querySelectorAll('.detail-button');

detailButtons.forEach(button => {
  button.addEventListener('click', function () {
    const pid = this.getAttribute('data-pid');
    window.location.href = `/products/${pid}`;
  });
});