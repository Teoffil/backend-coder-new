class CartDTO {
    constructor(cart) {
        this.id = cart._id;
        this.userId = cart.user;
        this.products = cart.products.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));
    }
}

module.exports = CartDTO;
