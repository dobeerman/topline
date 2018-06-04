const debug = require('debug')('app:crud');
const db = require('../data/connect');
const R = require('../helpers/ramda/crud');

module.exports = async (ctx, next) => {
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
};
