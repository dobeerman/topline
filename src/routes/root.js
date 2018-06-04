const db = require('../data/connect');
const paginator = require('../data/paginator');

module.exports = async (ctx, next) => {
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
};
