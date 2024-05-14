// test/api/products.test.js
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('../../app'); 

chai.use(chaiHttp);

describe('Products API', () => {
    let token;
    let productId;  // Variable para almacenar el ID del producto

    // Obtener token de autenticación
    before(done => {
        chai.request(server)
            .post('/api/auth/login')
            .send({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD 
            })
            .end((err, res) => {
                token = res.body.token;
                done();
            });
    });

    describe('POST /api/products', () => {
        it('should create a new product with proper authorization', done => {
            const newProduct = { title: "Test Product", description: "This is a test product", price: 10.99, stock: 100 };
            chai.request(server)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send(newProduct)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.include.keys(['_id', 'title', 'description', 'price', 'stock']);
                    productId = res.body._id;  // Almacena el ID del producto creado
                    done();
                });
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product with proper authorization', done => {
            chai.request(server)
                .delete(`/api/products/${productId}`)  // Usa el ID del producto almacenado
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});

