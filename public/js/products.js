document.addEventListener('DOMContentLoaded', function() {
    const cartId = localStorage.getItem('cartId');

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.setAttribute('data-cart-id', cartId); // Establecer el cartId en el botón

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
});
