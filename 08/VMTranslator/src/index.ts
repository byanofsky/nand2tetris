import * as readline from 'readline';
import * as path from 'path';
import { createReadStream, createWriteStream, readdirSync, statSync } from 'fs';
import Parser from './lib/Parser';
import CodeWriter from './lib/CodeWriter';

const INPUT_EXT = '.vm';

const isVmFile = (filePath: string) => path.extname(filePath) === INPUT_EXT;

const getAllFiles = (inputPath: string): string[] => {
  if (statSync(inputPath).isFile()) {
    if (isVmFile(inputPath)) {
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
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath, INPUT_EXT);
  const base = `${basename}.asm`;
  if (statSync(filePath).isDirectory()) {
    return path.join(dir, basename, base);
  }
  return path.join(dir, base);
};

export default (inputPath: string) => {
  const parser = new Parser();
  const filePaths = getAllFiles(inputPath);
  const outFilePath = getOutFilePath(inputPath);
  const writeStream = createWriteStream(outFilePath);
  const codeWriter = new CodeWriter(writeStream);

  filePaths.forEach(filePath => {
    const baseName = path.basename(filePath, INPUT_EXT);
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
