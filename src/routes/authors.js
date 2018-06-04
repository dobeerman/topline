const db = require('../data/connect');

module.exports = async (ctx, next) => {
  ctx.body = await db.queryRow(`SELECT * FROM users ORDER BY user_name ASC`);
};
