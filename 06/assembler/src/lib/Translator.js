const { lineTypes, isEmpty, isLabel, isInstruction } = require('./Parser');

const translateComp = comp => {
  switch (comp) {
    case '0':
      return '0101010';
    case '1':
      return '0111111';
    case '-1':
      return '0111010';
    case 'D':
      return '0001100';
    case 'A':
      return '0110000';
    case 'M':
      return '1110000';
    case '!D':
      return '0001101';
    case '!A':
      return '0110001';
    case '!M':
      return '1110001';
    case '-D':
      return '0001111';
    case '-A':
      return '0110011';
    case '-M':
      return '1110011';
    case 'D+1':
      return '0011111';
    case 'A+1':
      return '0110111';
    case 'M+1':
      return '1110111';
    case 'D-1':
      return '0001110';
    case 'A-1':
      return '0110010';
    case 'M-1':
      return '1110010';
    case 'D+A':
      return '0000010';
    case 'D+M':
      return '1000010';
    case 'D-A':
      return '0010011';
    case 'D-M':
      return '1010011';
    case 'A-D':
      return '0000111';
    case 'M-D':
      return '1000111';
    case 'D&A':
      return '0000000';
    case 'D&M':
      return '1000000';
    case 'D|A':
      return '0010101';
    case 'D|M':
      return '1010101';
    default:
      throw new Error('Illegal comp code: ' + comp);
  }
};
const translateDest = dest => {
  switch (dest) {
    case null:
      return '000';
    case 'M':
      return '001';
    case 'D':
      return '010';
    case 'MD':
      return '011';
    case 'A':
      return '100';
    case 'AM':
      return '101';
    case 'AD':
      return '110';
    case 'AMD':
      return '111';
    default:
      throw new Error('Illegal dest code: ' + dest);
  }
};
const translateJump = jump => {
  switch (jump) {
    case null:
      return '000';
    case 'JGT':
      return '001';
    case 'JEQ':
      return '010';
    case 'JGE':
      return '011';
    case 'JLT':
      return '100';
    case 'JNE':
      return '101';
    case 'JLE':
      return '110';
    case 'JMP':
      return '111';
    default:
      throw new Error('Illegal jump code: ' + jump);
  }
};

const createTranslator = writeStream => {
  const translate = (symbols, symbolTable) => {
    symbols.filter(isInstruction).forEach(symbol => {
      const translated = translateSymbol(symbol, symbolTable);
      writeStream.write(translated + '\n');
    });
  };

  return {
    translate
  };
};

const translateSymbol = (symbol, symbolTable) => {
  switch (symbol.type) {
    case lineTypes.whitespace:
    case lineTypes.comment:
      return null;
    case lineTypes.aCommand:
      return translateACommand(symbol, symbolTable);
    case lineTypes.cCommand:
      return translateCCommand(symbol);
    default:
      throw new Error('unrecognized symbol: ' + symbol.type);
  }
};

const translateACommand = (symbol, symbolTable) => {
  const { value } = symbol;
  if (!value) {
    throw new Error('A Command value cannot be null');
  }
  let output;
  const asNumber = Number(value);
  if (Number.isInteger(asNumber) && asNumber >= 0) {
    output = asNumber;
  } else if (symbolTable.has(value)) {
    output = symbolTable.get(value);
  } else {
    symbolTable.assignVar(value);
    output = symbolTable.get(value);
  }
  return '0' + `${output.toString(2).padStart(15, '0')}`;
};

const translateCCommand = symbol => {
  const { dest, comp, jump } = symbol.value;
  const compCode = translateComp(comp);
  const destCode = translateDest(dest);
  const jumpCode = translateJump(jump);
  return '111' + `${compCode}${destCode}${jumpCode}`;
};

module.exports = {
  createTranslator
};
