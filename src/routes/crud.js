const debug = require('debug')('app:crud');
const Router = require('koa-router');
const faker = require('faker/locale/ru');
const { getDate } = require('../helpers/parse-date');
const R = require('../helpers/ramda/crud');

const root = require('./root');
const getbook = require('./getbook');
const authors = require('./authors');
const create = require('./create');
const update = require('./update');

const db = require('../data/connect');

const crud = new Router({
  prefix: '/api',
});

const paginator = require('../data/paginator');

crud
  .get('/', root)
  .get('/getbook', getbook)
  .get('/authors', authors)
  .post('/create', create)
  .post('/update/:id', update);

module.exports = crud;
