const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const first_name = document.getElementById('first-name-input').value;
    const last_name = document.getElementById('last-name-input').value;
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const age = document.getElementById('age-input').value;

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name,
                last_name,
                email,
                password,
                age
            }),
        });

        if (!response.ok) {
            throw new Error('Error al crear usuario');
        }

        Swal.fire({
            position: "center",
            icon: "success",
            title: `Usuario creado con éxito`,
            showConfirmButton: false,
            timer: 1500
        });
        console.log('Usuario creado correctamente');
        window.location.href = '/login';
    } catch (error) {
        console.error('Error:', error.message);
    }
});
