const Koa = require('koa2');
const Router = require('koa-router');

require('dotenv').config();
require('./data/initdb')();

const app = new Koa();

// Routes
const crud = require('./routes/crud');

app
  .use(require('koa-body')())
  .use(crud.routes())
  .use(crud.allowedMethods());

app.listen(3000);
