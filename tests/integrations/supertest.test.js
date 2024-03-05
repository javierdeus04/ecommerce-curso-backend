import { expect } from "chai";
import supertest from "supertest";

import { URL_BASE, JWT_SECRET, admin, generateToken } from '../../utils/utils.js'

const requester = supertest(URL_BASE);

async function authenticateUser(requester, email, password) {
    const { headers } = await requester.post('/auth/login').send({ email, password });
    const [key, value] = headers['set-cookie'][0].split('=');
    const cookie = { key, value };
    return cookie;
}

describe('Ecommerce testing', function () {

    describe('Auth testing', function () {

        before(function () {
            this.cookie = {};
            this.email = ''
        });

        it('Deberia registar un usuario de forma exitosa', async function () {
            this.email = `emailprueba${Date.now()/1000}@gmail.com`
            const userMock = {
                first_name: 'Nombre de prueba',
                last_name: 'Apellido de prueba',
                email: this.email,
                password: 'passworddeprueba',
                age: 20
            }

            const {
                statusCode,
                ok,
                _body
            } = await requester.post('/auth/register').send(userMock)

            expect(statusCode).to.be.equal(201)
            expect(ok).to.be.ok;
            expect(_body).to.be.an('object')
        })

        it('Deberia loguear un usuario de forma exitosa', async function () {
            const userMock = {
                email: this.email,
                password: 'passworddeprueba',
            }

            const {
                headers,
                statusCode,
                ok
            } = await requester.post('/auth/login').send(userMock)

            expect(statusCode).to.be.equal(200)
            expect(ok).to.be.ok;
            const [key, value] = headers['set-cookie'][0].split('=');
            this.cookie.key = key;
            this.cookie.value = value;
        })

        it('Deberia cerrar la sesion del usuario de forma exitosa', async function () {
            const { statusCode, headers } = await requester.post('/auth/logout');
            expect(statusCode).to.be.equal(200);
            expect(headers['set-cookie']).to.not.include('access_token');
        })
    })

    describe('Products testing', function () {
        let userCookie;
        before(async function () {
            const userMock = {
                email: 'jacintodecaurnex@gmail.com',
                password: 'aaabbb',
            }
            userCookie = await authenticateUser(requester, userMock.email, userMock.password);
        });

        it('Deberia mostrar una lista de productos de forma exitosa', async function () {
            const { statusCode, ok, _body } = await requester
                .get('/products')

            expect(statusCode).to.be.equal(200);
            expect(ok).to.be.ok;
            expect(Array.isArray(_body)).to.be.ok;
        })

        it('Deberia mostrar un producto en detalle de forma exitosa', async function () {
            const productMockId = "65e730dd4c522219c783d059";

            const { statusCode, ok, _body } = await requester
                .get(`/products/${productMockId}`)

            expect(statusCode).to.be.equal(200);
            expect(ok).to.be.ok;
            expect(_body).to.be.an('object');
            expect(_body).to.be.has.property('_id');
        })

        it('Deberia crear un producto de forma exitosa', async function () {
            const productMock = {
                title: 'Titulo de prueba',
                category: 'Categoria de prueba',
                description: 'Descripcion de prueba',
                price: 100,
                thumbnail: 'urldeprueba',
                code: `${Date.now() / 1000}`,
                stock: 100
            };

            const {
                statusCode,
                ok,
                _body
            } = await requester
                .post('/products')
                .set('Cookie', [`${userCookie.key}=${userCookie.value}`])
                .send(productMock)

            expect(statusCode).to.be.equal(201);
            expect(ok).to.be.ok;
            expect(_body).to.be.an('object');
            expect(_body).to.be.has.property('_id');
        });
    });

    describe('Carts testing', function () {
        let userCookie;
        before(async function () {
            const userMock = {
                email: 'jacintodecaurnex@gmail.com',
                password: 'aaabbb',
            }
            userCookie = await authenticateUser(requester, userMock.email, userMock.password);
        });

        it('Deberia mostar el carrito del usuario logueado de forma exitosa', async function () {
            const {
                statusCode,
                ok,
                _body
            } = await requester
                .get('/carts/current')
                .set('Cookie', [`${userCookie.key}=${userCookie.value}`])

            expect(statusCode).to.be.equal(200);
            expect(ok).to.be.ok;
            expect(_body).to.be.an('object');
            expect(_body).to.be.has.property('_id');
            expect(_body).to.be.has.property('products');
        });

        it('Deberia agregar un producto al carrito del usuario logueado de forma exitosa', async function () {
            const productMockId = "65e730dd4c522219c783d059";

            const {
                statusCode,
                ok,
                _body
            } = await requester
                .post(`/carts/current/${productMockId}`)
                .set('Cookie', [`${userCookie.key}=${userCookie.value}`])
                .send(productMockId)

            expect(statusCode).to.be.equal(200);
            expect(ok).to.be.ok;
            expect(_body).to.be.an('object');
            expect(_body).to.be.has.property('_id');
            expect(_body).to.be.has.property('products');
        });

        it('Deberia eliminar un producto del carrito del usuario logueado de forma exitosa', async function () {
            const productMockId = "65e730dd4c522219c783d059";

            const {
                statusCode,
                ok,
                _body
            } = await requester
                .delete(`/carts/current/${productMockId}`)
                .set('Cookie', [`${userCookie.key}=${userCookie.value}`])

            expect(statusCode).to.be.equal(200);
            expect(ok).to.be.ok;
            expect(_body).to.be.an('object');
            expect(_body).to.be.has.property('acknowledged');
            expect(_body.acknowledged).to.be.equal(true)
        });
    });
});

