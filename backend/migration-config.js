const environment = process.env.NODE_ENV || 'development';

module.exports = {
    [environment]: {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "host": process.env.DB_HOST,
        "dialect": process.env.DB_DIALECT
    }
};
