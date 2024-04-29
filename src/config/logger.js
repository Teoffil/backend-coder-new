const { createLogger, format, transports, addColors } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;

// Definición de niveles personalizados y colores asociados
const myCustomLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue'
    }
};

// Agregar colores a winston
addColors(myCustomLevels.colors);

const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
    levels: myCustomLevels.levels,
    level: 'info',  // Nivel mínimo para producción
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: 'errors.log', level: 'error' }),  // Registra 'error' y 'fatal'
    ],
    });

    if (process.env.NODE_ENV !== 'production') {
    logger.level = 'debug'; // Nivel mínimo para desarrollo
    logger.add(new transports.Console({
        format: combine(
        colorize(),
        timestamp(),
        customFormat
        )
    }));
}

module.exports = logger;
