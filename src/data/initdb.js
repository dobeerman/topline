const debug = require('debug')('initdb');
const faker = require('faker');
const knex = require('./connect');

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

      const users = await [...Array(MAX_USERS).keys()].map(idx => ({
        user_name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        avatar: faker.image.avatar(),
      }));

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

      const imagesTypes = ['animals', 'arch', 'nature', 'people', 'tech'];
      await knex('users')
        .select('id')
        .then(result => result.map(el => el.id))
        .then(uids => {
          // title, date, author, description, image;
          return [...Array(MAX_ROWS).keys()].map(idx => ({
            title: faker.lorem.sentence(),
            date: faker.date.past(10),
            user_id: faker.random.arrayElement(uids), // author
            description: faker.lorem.sentences(3, 3),
            imageUrl: `https://placeimg.com/320/240/${faker.random.arrayElement(
              imagesTypes,
            )}`,
          }));
        })
        .then(books => knex('books').insert(books))
        .then(() => debug('DB %o %s', 'books', 'filled by fake rows'));
    }
  });
};

module.exports = initdb;
