// test/api/sessions.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('../../app');  // Ajusta la ruta según dónde inicializas tu app

chai.use(chaiHttp);

describe('Sessions', () => {
    describe('POST /api/auth/login', () => {
        it('should login a user and return a token', done => {
            const userCredentials = { email: 'ffmateo98@gmail.com', password: 'ffmateo99' };  // Use valid credentials
            chai.request(server)
                .post('/api/auth/login')
                .send(userCredentials)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('token');
                    done();
                });
        });
    });

    describe('GET /api/auth/logout', () => {
        it('should logout the user', done => {
            chai.request(server)
                .get('/api/auth/logout')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
