const debug = require('debug')('initdb');
const { knex } = require('./connect');
const { users, books } = require('../helpers/fakeData');

const MAX_USERS = 5;
const MAX_ROWS = 100; // change to 1e5

const initdb = async () => {
  await knex.schema.hasTable('users').then(async exists => {
    debug('DB %o %s', 'users', exists);
    if (!exists) {
      await knex.schema
        .createTable('users', table => {
          table.increments('id').primary();
          table.string('user_name');
          table.string('avatar');
        })
        .then(() => debug('DB %o %s', 'users', 'created'));

      await knex('users')
        .insert(users, 'id')
        .then(() => debug('DB %o %s', 'users', 'filled by fake rows'));
    }
  });

  await knex.schema.hasTable('books').then(async exists => {
    debug('DB %o %s', 'books', exists);
    if (!exists) {
      await knex.schema
        .createTable('books', table => {
          // title, date, author, description, image
          table.increments('id');
          table.string('title');
          table.dateTime('date');
          table.text('description');
          table.string('imageUrl');
          table
            .integer('user_id')
            .unsigned()
            .references('users.id');
        })
        .then(() => debug('DB %o %s', 'books', 'created'));

      await knex('users')
        .select('id')
        .then(result => result.map(el => el.id))
        .then(uids => {
          // title, date, author, description, image;
          return books(uids);
        })
        .then(books => knex('books').insert(books))
        .then(() => debug('DB %o %s', 'books', 'filled by fake rows'));
    }
  });
};

module.exports = initdb;
