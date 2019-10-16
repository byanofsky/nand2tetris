import JackTokenizer from './JackTokenizer';
import { statSync, readdirSync } from 'fs';
import { extname, join } from 'path';

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
    const tokenOutPath = inputPath.replace(/\.jack$/, 'T.xml');
    jackTokenizer.tokenize(tokenOutPath);
  }
}
