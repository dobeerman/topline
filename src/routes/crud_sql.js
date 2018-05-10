const debug = require('debug')('sql:crud');
const Router = require('koa-router');
const faker = require('faker');
const mysql = require('mysql');
const { connection } = require('../data/connect');
const { getDate } = require('../helpers/parse-date');

const db = mysql.createConnection(connection);

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
        books.id,
        books.title,
        books.description,
        books.date,
        books.imageUrl,
        users.user_name,
        users.id AS user_id,
        users.avatar
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

    const bookQuery = `SELECT
      books.id,
      books.title,
      books.description,
      books.date,
      books.imageUrl,
      users.user_name,
      users.id AS user_id,
      users.avatar
      FROM books JOIN users ON books.user_id = users.id WHERE books.id = ?`;

    ctx.body = await new Promise((resolve, reject) => {
      return db.query(bookQuery, id, (error, result) => {
        if (error) reject(error);

        resolve(result[0]);
      });
    });
  })
  .get('/authors', async (ctx, next) => {
    ctx.body = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users ORDER BY user_name ASC`;
      db.query(sql, (error, results) => {
        if (error) reject(error);

        resolve(results);
      });
    });
  })
  .post('/create', async (ctx, next) => {
    const { book } = ctx.request.body.query;

    Object.assign(book, { date: getDate(book.date) });

    let sql = `SELECT id FROM users WHERE users.user_name = ?`;

    ctx.body = await new Promise((resolve, reject) => {
      db.query(sql, book.user_name, (error, result) => {
        if (error) reject(error);

        const newBook = `
          INSERT INTO books
            (title, description, imageUrl, date, user_id)
            VALUES (?,?,?,?,?)
        `;

        if (result[0]) {
          db.query(
            newBook,
            [
              book.title,
              book.description,
              book.imageUrl,
              book.date,
              result[0].id,
            ],
            (error, result) => {
              if (error) reject(error);

              resolve([result.insertId]);
            },
          );
        } else {
          const newUser = `INSERT INTO users (user_name, avatar) VALUES(?,?)`;

          db.query(
            newUser,
            [book.user_name, faker.image.avatar()],
            (error, result) => {
              if (error) reject(error);

              const user_id = result.insertId;

              db.query(
                newBook,
                [
                  book.title,
                  book.description,
                  book.imageUrl,
                  book.date,
                  user_id,
                ],
                (error, result) => {
                  if (error) reject(error);

                  resolve([result.insertId]);
                },
              );
            },
          );
        }
      });
    });
  })
  .post('/update/:id', async (ctx, next) => {
    const { id, date, ...book } = ctx.request.body.query.book;

    Object.assign(book, { date: getDate(date) });

    debug('book', book, id, date);

    ctx.body = await new Promise((resolve, reject) => {
      const sql = `
        UPDATE books
          SET
            title = ?,
            description = ?,
            imageUrl = ?,
            date = ?
          WHERE books.id = ?
      `;
      db.query(
        sql,
        [book.title, book.description, book.imageUrl, book.date, id],
        (error, result) => {
          if (error) reject(error);

          resolve(result[0]);
        },
      );
    });
  });

module.exports = crud;
