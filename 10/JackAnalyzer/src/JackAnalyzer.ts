import JackTokenizer from './JackTokenizer';
import { statSync, readdirSync, createWriteStream } from 'fs';
import { extname, join } from 'path';
import CompilationEngine from './CompilationEngine';

export default class JackAnalyzer {
  analyze(inputPath: string) {
    let inputFilePaths: string[];
    if (statSync(inputPath).isDirectory()) {
      inputFilePaths = readdirSync(inputPath)
        .filter(filePath => extname(filePath) === '.jack')
        .map(filePath => join(inputPath, filePath));
    } else {
      inputFilePaths = [inputPath];
    }
    inputFilePaths.forEach(filePath => this.analyzeFile(filePath));
  }

  private analyzeFile(inputPath: string) {
    const jackTokenizer = new JackTokenizer(inputPath);
    const outPath = inputPath.replace(/\.jack$/, '.xml');
    const outStream = createWriteStream(outPath);
    const compilationEngine = new CompilationEngine(outStream, jackTokenizer);

    // const tokenOutPath = inputPath.replace(/\.jack$/, 'T.xml');
    // jackTokenizer.tokenize(tokenOutPath);

    compilationEngine.compile();
  }
}
