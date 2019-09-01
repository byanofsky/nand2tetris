const { parseLine, isInstruction, isLabel } = require('./Parser');

const createAssembler = translator => {
  const assemble = (readInterface, symbolTable) => {
    const symbols = [];
    readInterface.on('line', line => symbols.push(parseLine(line)));
    readInterface.on('close', () => {
      buildSymbolTable(symbolTable, symbols);
      translator.translate(symbols, symbolTable);
    });
  };

  const buildSymbolTable = (symbolTable, symbols) => {
    let curLine = 0;
    symbols.forEach(symbol => {
      if (isInstruction(symbol)) {
        return curLine++;
      }
      if (isLabel(symbol)) {
        return symbolTable.addSymbol(symbol.value, curLine);
      }
    });
  };

  return {
    assemble
  };
};

module.exports = createAssembler;
