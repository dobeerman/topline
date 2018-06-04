const R = require('./ramda/crud');

module.exports = userId => R.prop('id', R.head(userId));
