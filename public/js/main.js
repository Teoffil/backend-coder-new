document.addEventListener('DOMContentLoaded', function() {
    const cartId = localStorage.getItem('cartId');

    // Configurar el cartId en todos los botones de "Agregar al Carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        // Verificar si el evento ya ha sido añadido
        if (!button.dataset.eventAdded) {
            button.setAttribute('data-cart-id', cartId);

            button.addEventListener('click', async () => {
                const productId = button.getAttribute('data-product-id');

                if (!cartId) {
                    alert('Carrito no disponible.');
                    return;
                }

                try {
                    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ quantity: 1 })
                    });

                    if (response.ok) {
                        alert('Producto agregado al carrito');
                    } else {
                        const error = await response.json();
                        alert(`Error: ${error.message}`);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al agregar el producto al carrito.');
                }
            });

            // Marcar que el evento ha sido añadido
            button.dataset.eventAdded = true;
        }
    });

    // Manejar el logout
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        // Verificar si el evento ya ha sido añadido
        if (!logoutButton.dataset.eventAdded) {
            logoutButton.addEventListener('click', function() {
                const token = localStorage.getItem('token');
                fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Logged out') {
                        alert('Sesión cerrada exitosamente');
                        localStorage.removeItem('token');
                        localStorage.removeItem('cartId');
                        location.href = '/login';
                    } else {
                        alert('Error al cerrar sesión');
                    }
                })
                .catch(error => console.error('Error:', error));
            });

            // Marcar que el evento ha sido añadido
            logoutButton.dataset.eventAdded = true;
        }
    }

    // Configurar el botón "Ver Carrito" en la página de productos
    const viewCartButton = document.getElementById('view-cart-btn');
    if (viewCartButton) {
        viewCartButton.addEventListener('click', function() {
            location.href = `/api/carts/${cartId}`;
        });
    }

    // Configurar el botón "Ver Carrito" en el header
    const headerViewCartButton = document.getElementById('header-view-cart-btn');
    if (headerViewCartButton) {
        headerViewCartButton.addEventListener('click', function() {
            location.href = `/api/carts/${cartId}`;
        });
    }
});
