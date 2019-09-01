const { createSymbol, symbolTypes } = require('./Symbol');

const removeWhiteSpaceAndComments = line => {
  const noWhiteSpace = removeWhiteSpace(line);
  return removeComments(noWhiteSpace);
};

const removeWhiteSpace = line => {
  return line.replace(/ /g, '');
};

const removeComments = line => {
  return line.split('//')[0];
};

const parseLine = _line => {
  let value;
  let type;
  const line = removeWhiteSpaceAndComments(_line);
  if (!line.length) {
    return null;
  } else if (line[0] === '@') {
    value = line.slice(1);
    type = symbolTypes.A_COMMAND;
  } else if (line[0] === '(') {
    value = line.slice(1, line.length - 1);
    type = symbolTypes.L_COMMAND;
  } else {
    value = parseCValues(line);
    type = symbolTypes.C_COMMAND;
  }
  return createSymbol(value, type);
};

const parseCValues = line => {
  let dest;
  let comp;
  let jump;
  if (line.includes('=')) {
    [dest, comp] = line.split('=');
  }
  if (line.includes(';')) {
    [comp, jump] = line.split(';');
  }
  return {
    dest: dest || null,
    comp,
    jump: jump || null
  };
};

module.exports = {
  parseLine
};
