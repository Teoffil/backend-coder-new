document.addEventListener('DOMContentLoaded', function() {
    const cartId = localStorage.getItem('cartId');

    // Configurar el cartId en todos los botones de "Agregar al Carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
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
    });

    // Manejar el logout
    document.getElementById('logout-btn').addEventListener('click', function() {
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

    // Configurar el botón "Ver Carrito"
    const viewCartButton = document.getElementById('view-cart-btn');
    if (viewCartButton) {
        viewCartButton.addEventListener('click', function() {
            location.href = `/api/carts/${cartId}`;
        });
    }
});
