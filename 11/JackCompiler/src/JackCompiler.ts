import JackTokenizer from './JackTokenizer';
import { statSync, readdirSync, createWriteStream } from 'fs';
import { extname, join } from 'path';
import CompilationEngine from './CompilationEngine';
import SymbolTable from './SymbolTable';
import VMWriter from './VMWriter';

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
    const symbolTable = new SymbolTable();
    const jackTokenizer = new JackTokenizer(inputPath);
    const outPath = inputPath.replace(/\.jack$/, '.vm');
    const outStream = createWriteStream(outPath);
    const vmWriter = new VMWriter(outStream);
    const compilationEngine = new CompilationEngine(
      jackTokenizer,
      symbolTable,
      vmWriter
    );
    compilationEngine.compile();
    vmWriter.close();
  }
}
