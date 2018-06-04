const R = require('../helpers/ramda/crud');
const { getDate } = require('../helpers/parse-date');

const db = require('../data/connect');

module.exports = async (ctx, next) => {
  const { id, date, ...book } = ctx.request.body.query.book;

  const bookObject = R.merge(book, { date: getDate(date) });

  const values = R.append(id, R.props(['title', 'description', 'imageUrl', 'date'], bookObject));

  const sql = `UPDATE books SET title = ?, description = ?, imageUrl = ?, date = ? WHERE books.id = ?`;

  const bookUpdated = await db.queryRow(sql, values);

  ctx.body = R.head(bookUpdated);
};
