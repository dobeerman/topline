const debug = require('debug')('app:fake');
const faker = require('faker/locale/ru');
const R = require('../helpers/ramda/faker');

const MAX_USERS = 5;
const MAX_ROWS = 15; // change to 1e5

const makeUser = user => [`${faker.name.findName()}`, faker.image.avatar()];

function Book() {
  this.elements = ['animals', 'arch', 'nature', 'people', 'tech'];
}

Book.prototype.details = function() {
  return [
    faker.lorem.sentence(),
    faker.date.past(10),
    faker.random.arrayElement(R.range(1, MAX_USERS + 1)),
    faker.lorem.sentences(3, 3),
    `https://placeimg.com/320/240/${faker.random.arrayElement(this.elements)}`,
  ];
};

const books = () => {
  const BookConstructor = R.construct(Book);
  const bookDetails = R.invoker(0, 'details');
  const detailedNewBook = R.compose(bookDetails, BookConstructor);

  return R.map(detailedNewBook, R.range(1, MAX_ROWS + 1));
};

// Exports
module.exports.users = R.map(makeUser, R.range(1, MAX_USERS + 1));

module.exports.books = books;
