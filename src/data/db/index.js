const tableUsers = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    avatar VARCHAR(255)
  )
`;

const tableBooks = `
  CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description LONGTEXT,
    date DATETIME,
    user_id INT,
    imageUrl VARCHAR(255)
  )
`;

module.exports.MAX_USERS = 5;

module.exports.MAX_ROWS = 100; // change to 1e5

module.exports.tableUsers = tableUsers;

module.exports.tableBooks = tableBooks;
