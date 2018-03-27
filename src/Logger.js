var winston = require("winston");


const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

var logger = winston.createLogger({
    level: 'debug',
    format: combine(
        label({ label: 'Sportstats.API' }),
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console({
            colorize: true,
            prettyPrint: true
        }),
        //
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'logs/info.log', level: 'info', maxsize: 1024000 }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
    ]
});

module.exports = logger;