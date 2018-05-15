const debug = require('debug')('app:crud');
const Router = require('koa-router');
const faker = require('faker/locale/ru');
const { getDate } = require('../helpers/parse-date');
const R = require('../helpers/ramda/crud');

const db = require('../data/connect');

const crud = new Router({
  prefix: '/api',
});

const paginator = require('../data/paginator');

crud
  .get('/', async (ctx, next) => {
    const { limit: perPage, offset: page, where = '' } = ctx.request.query;

    const whereEscaped = db.escape(`%${where}%`);

    const booksQuery = `
      SELECT
        books.id, books.title, books.description, books.date, books.imageUrl,
        users.user_name, users.id AS user_id, users.avatar
      FROM books
      LEFT JOIN users
      ON books.user_id = users.id
      WHERE
        users.user_name LIKE ${whereEscaped}
        OR
        books.title LIKE ${whereEscaped}
        OR
        books.description LIKE ${whereEscaped}
      ORDER BY title ASC`;

    ctx.body = await paginator(booksQuery, page, perPage);
  })
  .get('/getbook', async (ctx, next) => {
    const { id } = ctx.request.query;

    const bookQuery = `
      SELECT
        books.id, books.title, books.description, books.date, books.imageUrl,
        users.user_name, users.id AS user_id, users.avatar
      FROM books
      JOIN users ON books.user_id = users.id
      WHERE books.id = ?`;

    try {
      const book = await db.queryRow(bookQuery, id);

      ctx.body = R.head(book);
    } catch (e) {
      debug(e);
    }
  })
  .get('/authors', async (ctx, next) => {
    ctx.body = await db.queryRow(`SELECT * FROM users ORDER BY user_name ASC`);
  })
  .post('/create', async (ctx, next) => {
    const { book } = ctx.request.body.query;

    let newBook,
      sql = `SELECT id FROM users WHERE user_name = ?`,
      userId = await db.query(sql, [book.user_name]);

    sql = `INSERT INTO books SET ?`;

    bookObject = R.merge(book, { date: getDate(R.prop('date')(book)) });

    const values = R.pick(
      ['title', 'description', 'imageUrl', 'date'],
      bookObject,
    );

    if (userId.length) {
      bookObject = R.merge(values, { user_id: uid(userId) });

      newBook = await db.queryRow(sql, bookObject);
    } else {
      const newUser = await db.queryRow(`INSERT INTO users SET ?`, {
        user_name: book.user_name,
        avatar: faker.image.avatar(),
      });

      bookObject = R.merge(values, { user_id: R.prop('insertId', newUser) });

      newBook = await db.queryRow(sql, bookObject);
    }

    ctx.body = R.prop('insertId', newBook);
  })
  .post('/update/:id', async (ctx, next) => {
    const { id, date, ...book } = ctx.request.body.query.book;

    const bookObject = R.merge(book, { date: getDate(date) });

    const values = R.append(
      id,
      R.props(['title', 'description', 'imageUrl', 'date'], bookObject),
    );

    const sql = `UPDATE books SET title = ?, description = ?, imageUrl = ?, date = ? WHERE books.id = ?`;

    const bookUpdated = await db.queryRow(sql, values);

    ctx.body = R.head(bookUpdated);
  });

function uid(userId) {
  return R.prop('id', R.head(userId));
}

module.exports = crud;
