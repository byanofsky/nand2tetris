const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { parseLine } = require('./lib/Parser');
const { translate } = require('./lib/Translator');
const { createSymbolTable } = require('./lib/SymbolTable');
const { isLabel } = require('./lib/Symbol');

const createOutputFilePath = filePath =>
  path.join(path.dirname(filePath), path.basename(filePath, '.asm') + '.hack');

const buildSymbolTable = symbols => {
  const symbolTable = createSymbolTable();
  let curLine = 0;
  symbols.forEach(symbol => {
    if (isLabel(symbol)) {
      symbolTable.addSymbol(symbol.value, curLine);
    } else {
      curLine++;
    }
  });
  return symbolTable;
};

module.exports = filePath => {
  const symbols = [];
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filePath)
  });

  readInterface.on('line', line => {
    const symbol = parseLine(line);
    if (symbol) {
      symbols.push(symbol);
    }
  });

  readInterface.on('close', () => {
    const symbolTable = buildSymbolTable(symbols);
    translate(createOutputFilePath(filePath), symbolTable, symbols);
  });
};
