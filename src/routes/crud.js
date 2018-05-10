const debug = require('debug')('crud:crud');
const Router = require('koa-router');
const faker = require('faker');
const crud = new Router({
  prefix: '/api',
});
const paginator = require('../data/knex-paginator');

const { knex } = require('../data/connect');

crud
  .get('/', async (ctx, next) => {
    const { limit: perPage, offset: page, where } = ctx.request.query;

    const booksQuery = knex('books')
      .join('users', 'books.user_id', '=', 'users.id')
      .select(
        'books.id',
        'books.title',
        'books.description',
        'books.date',
        'books.imageUrl',
        'users.user_name',
        'users.id as user_id',
        'users.avatar',
      )
      .where(function() {
        this.where('users.user_name', 'LIKE', `%${where}%`)
          .orWhere('books.title', 'LIKE', `%${where}%`)
          .orWhere('books.description', 'LIKE', `%${where}%`);
      })
      .orderBy('title', 'ASC');

    ctx.body = await paginator(knex)(booksQuery, { perPage, page })
      .then(result => result)
      .catch(err => {
        debug(err);
      });

    await next();
  })
  .get('/:id', async (ctx, next) => {
    ctx.body = await knex('books')
      .select()
      .where('user_id', ctx.params.id)
      .join('users', 'books.user_id', '=', 'users.id');
    await next();
  })
  .get('/authors', async (ctx, next) => {
    ctx.body = await knex('users')
      .select()
      .orderBy('user_name', 'asc')
      .then(response => response);
    ctx.body;
    await next();
  })
  .get('/getbook', async (ctx, next) => {
    const { id } = ctx.request.query;
    ctx.body = await knex('books')
      .select()
      .where('id', '=', id)
      .then(response => response[0]);
    ctx.body;
    await next();
  })
  .get('/users', async (ctx, next) => {
    ctx.body = await knex('users').select('id');
    await next();
  })
  .post('/create', async (ctx, next) => {
    const { book } = ctx.request.body.query;
    debug(book);

    const userId = await knex('users')
      .select('id')
      .where('user_name', '=', book.user_name)
      .then(async userId => {
        const [id] = userId;

        if (id) return id.id;

        const newUser = await knex('users').insert(
          {
            user_name: book.user_name,
            avatar: faker.image.avatar(),
          },
          'id',
        );

        debug('User not found. It was created with id:%d', newUser[0]);

        return newUser[0];
      })
      .then(async userId => {
        const { user_name, date, ...newBook } = book;

        Object.assign(newBook, { user_id: userId });

        const [day, month, year] = parseDate(date);

        Object.assign(newBook, {
          date: new Date(year, month, day).toLocaleString(),
        });

        ctx.body = await knex('books').insert(newBook, 'id');
        await next();
      });
  })
  .post('/update/:id', async (ctx, next) => {
    const { id, date, ...book } = ctx.request.body.query.book;

    const [day, month, year] = parseDate(date);

    Object.assign(book, { date: new Date(year, month, day).toLocaleString() });

    ctx.body = await knex('books')
      .where({ id: ctx.params.id })
      .update(book);

    await next();
  });

const parseDate = dateString => {
  return [
    dateString.substr(0, 2),
    parseInt(dateString.substr(2, 2), 10) - 1,
    dateString.substr(4, 4),
  ];
};

module.exports = crud;
