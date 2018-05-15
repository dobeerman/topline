const debug = require('debug')('app:parsedate');
const Rmatch = require('ramda/src/match');

const getDate = date => {
  const [_, d, m, y] = Rmatch(/(^[\d]{2})([\d]{2})([\d].+)/, date);

  return new Date(y, m, d).toLocaleString();
};

module.exports.getDate = getDate;
