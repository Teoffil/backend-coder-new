document.addEventListener('DOMContentLoaded', function() {
    const cartId = localStorage.getItem('cartId');

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.setAttribute('data-cart-id', cartId); // Establecer el cartId en el botón

        button.addEventListener('click', function() {
            const productId = this.dataset.productId;

            if (!cartId) {
                alert('Carrito no disponible');
                return;
            }

            fetch(`/api/carts/${cartId}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ quantity: 1 })
            })
            .then(response => {
                if (response.ok) {
                    alert('Producto agregado al carrito');
                } else {
                    alert('Error al agregar el producto');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });

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
                location.href = '/login';
            } else {
                alert('Error al cerrar sesión');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
