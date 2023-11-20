(function () {
    let username;
    const socket = io();

  document
  .getElementById('form-message')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('input-message');
    const newMessage = {
        user: username,
        message: input.value,
    }
    socket.emit('new-message', newMessage);
    input.value = '';
    input.focus();
  })

    socket.on('messages', (messages) => {
        console.log('messages', messages);
        const logMessages = document.getElementById('messages');
        logMessages.innerText = '';
        messages.forEach((message) => {
            const p = document.createElement('p');
            p.innerText = `${message.user}: ${message.message}`;
            logMessages.appendChild(p);
        });
    });

    Swal.fire({
        title: 'Identificate por favor',
        input: 'text',
        allowOutsideClick: false,
        inputValidator: (value) => {
            if (!value) {
                return 'Ingrese su nombre'
            }
        }
    })
        .then((result) => {
            username = result.value.trim();
            console.log('Usuario:', username);
        })
        .catch((error) => {
            console.error('Ha ocuurido un error con el username:', error.message);
        })

})();
