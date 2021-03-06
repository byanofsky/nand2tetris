import JackTokenizer from './JackTokenizer';
import { statSync, readdirSync, createWriteStream } from 'fs';
import { extname, join } from 'path';
import CompilationEngine from './CompilationEngine';
import SymbolTable from './SymbolTable';

const isDirectory = (path: string): boolean => statSync(path).isDirectory();

export default class JackAnalyzer {
  analyze(inputPath: string) {
    let inputFilePaths: string[];
    if (isDirectory(inputPath)) {
      inputFilePaths = readdirSync(inputPath)
        .filter(filePath => extname(filePath) === '.jack')
        .map(filePath => join(inputPath, filePath));
    } else {
      inputFilePaths = [inputPath];
    }
    inputFilePaths.forEach(filePath => this.analyzeFile(filePath));
  }

  private analyzeFile(inputPath: string) {
    const symbolTable = new SymbolTable();
    const jackTokenizer = new JackTokenizer(inputPath);
    const outPath = inputPath.replace(/\.jack$/, '.xml');
    const outStream = createWriteStream(outPath);
    const compilationEngine = new CompilationEngine(
      outStream,
      jackTokenizer,
      symbolTable
    );
    compilationEngine.compile();
  }
}
