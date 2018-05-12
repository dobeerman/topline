const debug = require('debug')('sql:initdb');
const db = require('./connect');
const { users, books } = require('../helpers/fakeData');
const { tableUsers, tableBooks, MAX_USERS, MAX_BOOKS } = require('./db');

const initdb = async () => {
  try {
    await db.queryRow(`
      SET FOREIGN_KEY_CHECKS = 0;
      TRUNCATE \`books\`; TRUNCATE \`users\`;
      SET FOREIGN_KEY_CHECKS = 1;
    `);

    await db.queryRow(tableUsers);

    debug('Database `users` has been created.');

    const fillUsers = await db.queryRow(
      `INSERT INTO users (user_name, avatar) VALUES ?`,
      [users],
    );

    debug('Number of records inserted: ' + fillUsers.affectedRows);

    await db.queryRow(tableBooks);

    debug('Database `books` has been created.');

    const userIds = await db.queryRow(`SELECT id FROM users`);

    const values = await books(userIds.map(el => el.id));

    const fillBooks = await db.queryRow(
      `INSERT INTO books (title, date, user_id, description, imageUrl) VALUES ?`,
      [values],
    );

    debug('Number of records inserted: ' + fillBooks.affectedRows);
  } catch (e) {
    debug(e);
  }
};

module.exports = initdb;
