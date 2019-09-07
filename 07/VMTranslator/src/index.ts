import * as readline from 'readline';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import Parser from './lib/Parser';
import CodeWriter from './lib/CodeWriter';

export default (filePath: string) => {
  const parser = new Parser();
  const outFilePath = path.basename(filePath, '.vm') + '.asm';
  const writeStream = createWriteStream(outFilePath);
  const codeWriter = new CodeWriter(writeStream);
  const rl = readline.createInterface({
    input: createReadStream(filePath)
  });

  let lineNum = 0;
  rl.on('line', line => {
    const token = parser.parseLine(line, ++lineNum);
    codeWriter.translate(token);
  });
};
