document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);

                if (data.userId === 'admin') {
                    location.href = '/products';
                } else {
                    fetch('/api/carts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.token}`
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text) });
                        }
                        return response.json();
                    })
                    .then(cartData => {
                        localStorage.setItem('cartId', cartData._id);
                        location.href = '/products';
                    })
                    .catch(error => {
                        console.error('Error creating cart:', error.message);
                        location.href = '/products'; // Redirigir incluso si hay un error en la creación del carrito
                    });
                }
            } else {
                console.error('Login failed');
                location.href = '/login'; // Redirigir al login si el login falla
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            location.href = '/login'; // Redirigir al login si hay un error
        });
    });
});
