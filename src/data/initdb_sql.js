const debug = require('debug')('sql:initdb');
const mysql = require('mysql');
const { connection } = require('./connect');
const { users, books } = require('../helpers/fakeData');

const db = mysql.createConnection(connection);

const MAX_USERS = 5;
const MAX_ROWS = 100; // change to 1e5

const initdb_sql = () => {
  let sql;

  sql = `
  CREATE TABLE IF NOT EXISTS users_sql (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    avatar VARCHAR(255)
  )
  `;

  db.connect(error => {
    if (error) throw error;

    db.query(sql, (error, results, fields) => {
      if (error) throw error;

      debug(
        'Database `users_sql` %s',
        results.warningCount ? 'exists.' : 'created.',
      );

      let sql = `SELECT COUNT(id) AS _rows FROM users_sql`;

      db.query(sql, (error, result, fields) => {
        if (!result[0]._rows) {
          const sql = `INSERT INTO users_sql (user_name, avatar) VALUES ?`;

          db.query(sql, [users], (error, result) => {
            if (error) throw error;
            debug('Number of records inserted: ' + result.affectedRows);
          });
        }
      });
    });

    sql = `
    CREATE TABLE IF NOT EXISTS books_sql (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      description LONGTEXT,
      date DATETIME,
      user_id INT,
      imageUrl VARCHAR(255)
    )
    `;

    db.query(sql, (error, results, fields) => {
      if (error) throw error;

      debug(
        'Database `books_sql` %s',
        results.warningCount ? 'exists.' : 'created.',
      );

      let sql = `SELECT COUNT(id) AS _rows FROM books_sql`;

      db.query(sql, (error, result, fields) => {
        if (!result[0]._rows) {
          let sql_uids = `SELECT id FROM users_sql`;

          db.query(sql_uids, (error, result) => {
            if (error) throw error;

            const values = books(result.map(el => el.id));
            const sql = `INSERT INTO books_sql (title, date, user_id, description, imageUrl) VALUES ?`;

            db.query(sql, [values], (error, result) => {
              if (error) throw error;
              debug('Number of records inserted: ' + result.affectedRows);
            });
          });
        }
      });
    });
  });
};

module.exports = initdb_sql;
