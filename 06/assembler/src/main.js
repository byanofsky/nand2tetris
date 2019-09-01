const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { createTranslator } = require('./lib/Translator');
const createAssembler = require('./lib/Assembler');
const { createSymbolTable } = require('./lib/SymbolTable');

const createOutputFilePath = filePath =>
  path.join(path.dirname(filePath), path.basename(filePath, '.asm') + '.hack');

module.exports = filePath => {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filePath)
  });
  const writeStream = fs.createWriteStream(createOutputFilePath(filePath));
  const translator = createTranslator(writeStream);
  const assembler = createAssembler(translator);
  assembler.assemble(readInterface, createSymbolTable());
};
