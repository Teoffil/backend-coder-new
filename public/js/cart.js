document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const cartId = this.dataset.cartId;

            if (!cartId) {
                alert('Carrito no disponible');
                return;
            }

            fetch(`/api/carts/${cartId}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId: productId, quantity: 1 })
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
