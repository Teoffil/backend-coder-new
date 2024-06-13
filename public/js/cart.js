document.addEventListener('DOMContentLoaded', () => {
    const removeButtons = document.querySelectorAll('.remove-product-btn');

    removeButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.target.getAttribute('data-product-id');
            const cartId = e.target.getAttribute('data-cart-id');

            try {
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    location.reload();
                } else {
                    console.error('Error removing product from cart');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});
