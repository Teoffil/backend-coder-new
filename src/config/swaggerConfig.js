// src/config/swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ecommerce API',
            version: '1.0.0',
            description: 'API documentation for the ecommerce project'
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Product ID'
                        },
                        title: {
                            type: 'string',
                            description: 'Product title'
                        },
                        description: {
                            type: 'string',
                            description: 'Product description'
                        },
                        price: {
                            type: 'number',
                            description: 'Product price'
                        },
                        thumbnail: {
                            type: 'string',
                            description: 'Product thumbnail URL'
                        },
                        stock: {
                            type: 'number',
                            description: 'Product stock quantity'
                        },
                        owner: {
                            type: 'string',
                            description: 'Owner email or ID of the product'
                        }
                    }
                },
                Cart: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Cart ID'
                        },
                        products: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: {
                                        type: 'string',
                                        description: 'Product ID'
                                    },
                                    quantity: {
                                        type: 'integer',
                                        description: 'Quantity of the product'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [
        '../api/products/productsRouter.js',
        '../api/carts/cartsRouter.js'
    ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
