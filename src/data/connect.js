const debug = require('debug')('app:connect');
const mysql = require('mysql');
const util = require('util');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  multipleStatements: true,
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      debug('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      debug('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      debug('Database connection was refused.');
    }
    if (connection) connection.release();
    return;
  }
});

pool.query = util.promisify(pool.query); // Magic happens here.

module.exports = pool;
