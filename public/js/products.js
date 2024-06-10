document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const productId = button.getAttribute('data-product-id');
        const cartId = button.getAttribute('data-cart-id');

        if (!cartId) {
            alert('Carrito no disponible.');
            return;
        }

        try {
            const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
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

document.getElementById('logout-btn').addEventListener('click', async () => {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        location.href = '/login';
    } else {
        alert('Error al cerrar sesión.');
    }
});
