const debug = require('debug')('crud');
const Router = require('koa-router');
const crud = new Router({
  prefix: '/api',
});
const paginator = require('../data/knex-paginator');

const knex = require('../data/connect');

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
      .orderBy('title', 'ASC');

    ctx.body = await paginator(knex)(
      where ? booksQuery.whereRaw(where) : booksQuery,
      {
        perPage,
        page,
      },
    )
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
  .post('/update/:id', async (ctx, next) => {
    const { id, date, ...book } = ctx.request.body.query.book;

    const [day, month, year] = [
      date.substr(0, 2),
      parseInt(date.substr(2, 2), 10) - 1,
      date.substr(4, 4),
    ];

    Object.assign(book, { date: new Date(year, month, day).toLocaleString() });

    ctx.body = await knex('books')
      .where({ id: ctx.params.id })
      .update(book);

    await next();
  });

module.exports = crud;
