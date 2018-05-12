const debug = require('debug')('sql:paginator');
const db = require('./connect');

module.exports = async (query, page = 1, limit = 10) => {
  if (page < 1) page = 1;
  limit = parseInt(limit, 10);
  const offset = (page - 1) * limit;

  const sql = `SELECT COUNT(*) AS total FROM (${query}) AS total; ${query} LIMIT ?, ?`;

  try {
    const results = await db.queryRow(sql, [offset, limit]);

    const result = {
      pagination: {
        total: results[0][0].total,
        limit,
        currentPage: page,
        lastPage: Math.ceil(results[0][0].total / limit),
        from: offset,
        to: offset + results[1].length,
      },
      data: results[1],
    };

    return result;
  } catch (e) {
    debug(e);
  }
};
