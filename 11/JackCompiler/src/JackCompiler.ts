import JackTokenizer from './JackTokenizer';
import { statSync, readdirSync, createWriteStream } from 'fs';
import { extname, join } from 'path';
import CompilationEngine from './CompilationEngine';

const isDirectory = (path: string): boolean => statSync(path).isDirectory();

export default class JackCompiler {
  compile(inputPath: string) {
    let inputFilePaths: string[];
    if (isDirectory(inputPath)) {
      inputFilePaths = readdirSync(inputPath)
        .filter(filePath => extname(filePath) === '.jack')
        .map(filePath => join(inputPath, filePath));
    } else {
      inputFilePaths = [inputPath];
    }
    inputFilePaths.forEach(filePath => this.compileFile(filePath));
  }

  private compileFile(inputPath: string) {
    const jackTokenizer = new JackTokenizer(inputPath);
    const outPath = inputPath.replace(/\.jack$/, '.xml');
    const outStream = createWriteStream(outPath);
    const compilationEngine = new CompilationEngine(outStream, jackTokenizer);
    compilationEngine.compile();
  }
}
