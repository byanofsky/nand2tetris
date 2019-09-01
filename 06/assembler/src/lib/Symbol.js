const symbolTypes = {
  A_COMMAND: 'A_COMMAND',
  C_COMMAND: 'C_COMMAND',
  L_COMMAND: 'L_COMMAND'
};

const createSymbol = (value, type) => {
  return {
    value,
    type
  };
};

const getType = symbol => symbol.type;

const getSymbol = symbol => {
  if (symbol.type !== symbolTypes.A_COMMAND) {
    throw new Error('Cannot get symbol from symbole type: ' + symbol.type);
  }
  return symbol.value;
};

const getCValues = symbol => {
  if (symbol.type !== symbolTypes.C_COMMAND) {
    throw new Error('Cannot get c values from symbole type: ' + symbol.type);
  }
  return symbol.value;
};

const isLocation = address => {
  const asNumber = Number(address);
  return Number.isInteger(asNumber) && asNumber >= 0;
};

const isLabel = symbol => {
  return symbol.type === symbolTypes.L_COMMAND;
};

module.exports = {
  createSymbol,
  symbolTypes,
  getType,
  getSymbol,
  getCValues,
  isLabel,
  isLocation
};
