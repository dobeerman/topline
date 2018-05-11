const Koa = require('koa2');
const Router = require('koa-router');

const debug = require('debug')('app:index');

require('dotenv').config();

const app = new Koa();

require(`./data/initdb`)();

crud = require(`./routes/crud`);

app
  .use(require('koa-body')())
  .use(crud.routes())
  .use(crud.allowedMethods());

app.listen(3000);
