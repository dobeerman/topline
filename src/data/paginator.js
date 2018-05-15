const debug = require('debug')('app:paginator');
const db = require('./connect');
const R = require('../helpers/ramda/paginator');

module.exports = async (query, page = 1, limit = 10) => {
  if (page < 1) page = 1;
  limit = parseInt(limit, 10);
  const offset = (page - 1) * limit;

  const sql = `SELECT COUNT(*) AS total FROM (${query}) AS total; ${query} LIMIT ?, ?`;

  try {
    let results = await db.queryRow(sql, [offset, limit]);

    results = R.flatten(results);

    const f = R.pipe(R.head, R.props(['total']), R.head);

    const total = f(results);
    const data = R.tail(results);

    return {
      pagination: {
        total,
        limit,
        currentPage: parseInt(page, 10),
        lastPage: Math.ceil(total / limit),
        from: offset,
        to: offset + data.length,
      },
      data,
    };
  } catch (e) {
    debug(e);
  }
};
