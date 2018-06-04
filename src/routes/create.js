const db = require('../data/connect');
const uid = require('../helpers/uid');
const R = require('../helpers/ramda/crud');
const { getDate } = require('../helpers/parse-date');

module.exports = async (ctx, next) => {
  const { book } = ctx.request.body.query;

  let newBook,
    sql = `SELECT id FROM users WHERE user_name = ?`,
    userId = await db.query(sql, [book.user_name]);

  sql = `INSERT INTO books SET ?`;

  bookObject = R.merge(book, { date: getDate(R.prop('date')(book)) });

  const values = R.pick(['title', 'description', 'imageUrl', 'date'], bookObject);

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
};
