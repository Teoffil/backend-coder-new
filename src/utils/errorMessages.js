module.exports = {
    // Errores relacionados con productos
    PRODUCT_NOT_FOUND: {
        statusCode: 404,
        message: "Product not found."
    },
    INVALID_PRODUCT_DATA: {
        statusCode: 400,
        message: "Invalid product data provided."
    },
    PRODUCT_OUT_OF_STOCK: {
        statusCode: 400,
        message: "Product is out of stock."
    },

    // Errores relacionados con carritos
    CART_NOT_FOUND: {
        statusCode: 404,
        message: "Cart not found."
    },
    CART_EMPTY: {
        statusCode: 400,
        message: "Cart is empty."
    },

    // Errores relacionados con autenticación y usuarios
    USER_NOT_FOUND: {
        statusCode: 404,
        message: "User not found."
    },
    DUPLICATE_USER: {
        statusCode: 409,
        message: "User already exists."
    },
    INVALID_LOGIN: {
        statusCode: 401,
        message: "Invalid username or password."
    },
    UNAUTHORIZED: {
        statusCode: 403,
        message: "Unauthorized access."
    },

    // Errores relacionados con mensajes
    MESSAGE_NOT_FOUND: {
        statusCode: 404,
        message: "Message not found."
    },

    // Errores generales de servidor
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: "Internal server error."
    },

    // Errores de validación
    VALIDATION_ERROR: {
        statusCode: 400,
        message: "Validation errors occurred."
    },

    // Errores de acceso a recursos
    RESOURCE_NOT_FOUND: {
        statusCode: 404,
        message: "Requested resource not found."
    },

    // Errores específicos de operación
    OPERATION_NOT_PERMITTED: {
        statusCode: 403,
        message: "Operation not permitted."
    }
};

