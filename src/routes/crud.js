const debug = require('debug')('sql:crud');
const Router = require('koa-router');
const faker = require('faker');
const { getDate } = require('../helpers/parse-date');

const db = require('../data/connect');

const crud = new Router({
  prefix: '/api',
});

const paginator = require('../data/sql-paginator');

crud
  .get('/', async (ctx, next) => {
    const { limit: perPage, offset: page, where } = ctx.request.query;

    const whereEscaped = db.escape(`%${where}%`);

    const booksQuery = `
      SELECT
        books.id, books.title, books.description, books.date, books.imageUrl,
        users.user_name, users.id AS user_id, users.avatar
      FROM books
      JOIN users
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
      const book = await db.query(bookQuery, id);

      ctx.body = book[0];
    } catch (e) {
      debug(e);
    }
  })
  .get('/authors', async (ctx, next) => {
    ctx.body = await db.query(`SELECT * FROM users ORDER BY user_name ASC`);
  })
  .post('/create', async (ctx, next) => {
    const { book } = ctx.request.body.query;

    let newBook,
      sql = `SELECT id FROM users WHERE users.user_name = ?`,
      userId = await db.query(sql, book.user_name);

    sql = `INSERT INTO books (title, description, imageUrl, date, user_id) VALUES (?,?,?,?,?)`;

    Object.assign(book, { date: getDate(book.date) });

    if (userId.length) {
      newBook = await db.query(sql, [
        book.title,
        book.description,
        book.imageUrl,
        book.date,
        result[0].id,
      ]);
    } else {
      const newUser = await db.query(
        `INSERT INTO users (user_name, avatar) VALUES(?,?)`,
        [book.user_name, faker.image.avatar()],
      );

      newBook = await db.query(sql, [
        book.title,
        book.description,
        book.imageUrl,
        book.date,
        newUser.insertId,
      ]);
    }

    ctx.body = [newBook.insertId];
  })
  .post('/update/:id', async (ctx, next) => {
    const { id, date, ...book } = ctx.request.body.query.book;

    Object.assign(book, { date: getDate(date) });

    debug('book', book, id, date);

    const sql = `UPDATE books SET title = ?, description = ?, imageUrl = ?, date = ? WHERE books.id = ?`;

    const bookUpdated = await db.query(sql, [
      book.title,
      book.description,
      book.imageUrl,
      book.date,
      id,
    ]);

    ctx.body = bookUpdated[0];
  });

module.exports = crud;
