const submitButton = document.getElementById('submit-button');

submitButton.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email-input').value;
        Swal.fire({
            position: "center",
            icon: "success",
            title: `Email envaido con éxito a ${email}`,
            showConfirmButton: false,
            timer: 1500
        });
});
