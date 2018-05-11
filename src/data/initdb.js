const debug = require('debug')('sql:initdb');
const db = require('./connect');
const { users, books } = require('../helpers/fakeData');
const { tableUsers, tableBooks, MAX_USERS, MAX_BOOKS } = require('./db');

const initdb = async () => {
  try {
    await db.query(`
      SET FOREIGN_KEY_CHECKS = 0;
      TRUNCATE \`books\`; TRUNCATE \`users\`;
      SET FOREIGN_KEY_CHECKS = 1;
    `);

    await db.query(tableUsers);

    debug('Database `users` has been created.');

    const fillUsers = await db.query(
      `INSERT INTO users (user_name, avatar) VALUES ?`,
      [users],
    );

    debug('Number of records inserted: ' + fillUsers.affectedRows);

    await db.query(tableBooks);

    debug('Database `books` has been created.');

    const userIds = await db.query(`SELECT id FROM users`);

    const values = await books(userIds.map(el => el.id));

    const fillBooks = await db.query(
      `INSERT INTO books (title, date, user_id, description, imageUrl) VALUES ?`,
      [values],
      (error, result) => {
        if (error) throw error;

        debug('Number of records inserted: ' + result.affectedRows);
      },
    );

    debug('Number of records inserted: ' + fillBooks.affectedRows);
  } catch (e) {
    debug(e);
  }
};

module.exports = initdb;
