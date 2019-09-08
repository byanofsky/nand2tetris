import * as readline from 'readline';
import * as path from 'path';
import { createReadStream, createWriteStream, readdirSync, statSync } from 'fs';
import Parser from './lib/Parser';
import CodeWriter from './lib/CodeWriter';

const INPUT_EXT = '.vm';

const getAllFiles = (inputPath: string): string[] => {
  if (statSync(inputPath).isFile()) {
    if (path.extname(inputPath) === INPUT_EXT) {
      return [inputPath];
    }
    return [];
  }
  return readdirSync(inputPath).reduce<string[]>((acc, cur) => {
    const curPath = path.join(inputPath, cur);
    return acc.concat(getAllFiles(curPath));
  }, []);
};

const getOutFilePath = (filePath: string) => {
  return path.format({
    dir: path.dirname(filePath),
    base: `${path.basename(filePath, INPUT_EXT)}.asm`
  });
};

export default (inputPath: string) => {
  const parser = new Parser();
  const filePaths = getAllFiles(inputPath);

  filePaths.forEach(filePath => {
    const baseName = path.basename(filePath, INPUT_EXT);
    const outFilePath = getOutFilePath(filePath);
    const writeStream = createWriteStream(outFilePath);
    const codeWriter = new CodeWriter(writeStream);
    const rl = readline.createInterface({
      input: createReadStream(filePath)
    });

    let lineNum = 1;
    rl.on('line', line => {
      const token = parser.parseLine(baseName, line, lineNum++);
      codeWriter.translate(token);
    });
  });
};
