const faker = require('faker');

const MAX_USERS = 5;
const MAX_ROWS = 10; // change to 1e5
const SQL = process.env.MODE === 'SQL';

module.exports.users = [...Array(MAX_USERS).keys()].map(idx => {
  if (SQL) {
    return [
      `${faker.name.firstName()} ${faker.name.lastName()}`,
      faker.image.avatar(),
    ];
  } else {
    return {
      user_name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      avatar: faker.image.avatar(),
    };
  }
});

const imagesTypes = ['animals', 'arch', 'nature', 'people', 'tech'];

module.exports.books = uids =>
  [...Array(MAX_ROWS).keys()].map(idx => {
    if (SQL) {
      return [
        faker.lorem.sentence(),
        faker.date.past(10),
        faker.random.arrayElement(uids), // author
        faker.lorem.sentences(3, 3),
        `https://placeimg.com/320/240/${faker.random.arrayElement(
          imagesTypes,
        )}`,
      ];
    } else {
      return {
        title: faker.lorem.sentence(),
        date: faker.date.past(10),
        user_id: faker.random.arrayElement(uids), // author
        description: faker.lorem.sentences(3, 3),
        imageUrl: `https://placeimg.com/320/240/${faker.random.arrayElement(
          imagesTypes,
        )}`,
      };
    }
  });
