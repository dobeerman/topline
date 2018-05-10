const Koa = require('koa2');
const Router = require('koa-router');

require('dotenv').config();
const app = new Koa();

let crud;

if (process.env.MODE && process.env.MODE === 'SQL') {
  require('./data/initdb_sql')();
  // Routes SQL
  crud = require('./routes/crud_sql');
} else {
  require('./data/initdb')();
  // Routes
  crud = require('./routes/crud');
}

app
  .use(require('koa-body')())
  .use(crud.routes())
  .use(crud.allowedMethods());

app.listen(3000);
