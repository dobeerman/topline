const debug = require('debug')('sql:paginator');
const mysql = require('mysql');
const { connection } = require('./connect');

Object.assign(connection, { multipleStatements: true });

const db = mysql.createConnection(connection);

module.exports = (query, page = 1, limit = 10) => {
  if (page < 1) page = 1;
  limit = parseInt(limit, 10);
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;

    const sql = `SELECT COUNT(*) AS total FROM (${query}) AS total; ${query} LIMIT ?, ?`;

    db.query(sql, [offset, limit], (error, results) => {
      if (error) reject(error);

      const result = {
        pagination: {
          total: results[0][0].total,
          limit,
          currentPage: page,
          lastPage: Math.ceil(results[0][0].total / limit),
          from: offset,
          to: offset + results[1].length,
        },
        data: results[1],
      };

      resolve(result);
    });
  });
};
