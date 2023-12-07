const submitButton = document.getElementById('submit-button');

submitButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;


    if (!email || !password) {
        Swal.fire({
            position: "center",
            icon: "error",
            title: 'Todos los campos requeridos',
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    try {
        const response = await fetch('/api/sessions/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        if (!response.ok) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: 'Email o contraseña incorrectos',
                showConfirmButton: false,
                timer: 1500
            });
            return;           
        } else {
            Swal.fire({
                position: "center",
                icon: "success",
                title: `Bienvenido`,
                showConfirmButton: false,
                timer: 1500
            });
            console.log('Sesion iniciada correctamente');
            window.location.href = '/products'
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
})


