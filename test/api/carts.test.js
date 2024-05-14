// test/api/carts.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../../app');  // Asegúrate de que la ruta es correcta

chai.use(chaiHttp);

describe('Carts', () => {
    let token;

    before((done) => {
        chai.request(app)
            .post('/api/auth/login')
            .send({ email: 'coder1234@gmail.com', password: 'coder1234' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                token = res.body.token;
                cartId = res.body.cartId;  // Asumiendo que el login devuelve un cartId
                done();
            });
    });

    describe('POST /api/carts/:cartId/products/:productId', () => {
        it('should add a product to the cart', (done) => {
            const productId = '65cfe3183786e9aac4585e14'; // Asegúrate de que es un ID de producto válido
            chai.request(app)
                .post(`/api/carts/${cartId}/products/${productId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ quantity: 1 })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
    
    describe('DELETE /api/carts/:cartId/products/:productId', () => {
        it('should remove a product from the cart', (done) => {
            const productId = '65cfe3183786e9aac4585e14'; // Asegúrate de que es un ID de producto válido
            chai.request(app)
                .delete(`/api/carts/${cartId}/products/${productId}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
