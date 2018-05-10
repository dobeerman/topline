const parseDate = dateString => {
  return [
    dateString.substr(0, 2),
    parseInt(dateString.substr(2, 2), 10) - 1,
    dateString.substr(4, 4),
  ];
};

const getDate = dateString => {
  const [day, month, year] = parseDate(dateString);
  return new Date(year, month, day).toLocaleString();
};

module.exports.parseDate = parseDate;

module.exports.getDate = getDate;
