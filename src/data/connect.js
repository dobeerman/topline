const connection = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
};

module.exports.connection = connection;

module.exports.knex = require('knex')({
  client: 'mysql',
  connection,
});
