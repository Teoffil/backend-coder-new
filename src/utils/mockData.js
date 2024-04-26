const { faker } = require('@faker-js/faker');

function generateProducts(num) {
    const products = [];
    for (let i = 0; i < num; i++) {
        products.push({
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        thumbnail: faker.image.imageUrl(),
        code: `PRD-${i}`,
        stock: faker.random.number({ min: 10, max: 100 })
        });
    }
    return products;
}

module.exports = { generateProducts };
