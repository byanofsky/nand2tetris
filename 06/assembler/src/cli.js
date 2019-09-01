const main = require('./main');

const cli = args => {
  const filePath = args[2];
  main(filePath);
};

module.exports = cli;
