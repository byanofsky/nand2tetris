import { readFileSync, createWriteStream } from 'fs';
import {
  extractTokens,
  removeComments,
  isSymbol,
  isStringConstant,
  isIntegerConstant,
  isKeyword
} from './Tokens';
import { TokenType } from './types';

export default class JackTokenizer {
  private tokens: string[];
  private currentTokenPos: number;

  constructor(inputPath: string) {
    const inputFile = readFileSync(inputPath, 'utf8');
    this.tokens = extractTokens(removeComments(inputFile)) || [];
    this.currentTokenPos = -1;
  }

  tokenize(outPath: string) {
    const outStream = createWriteStream(outPath);
    outStream.write('<tokens>\n');
    while (this.hasMoreTokens()) {
      this.advance();
      let val: string | number = '';
      switch (this.tokenType()) {
        case TokenType.Identifier: {
          val = this.identifier();
          break;
        }
        case TokenType.IntegerConstant: {
          val = this.intVal();
          break;
        }
        case TokenType.Keyword: {
          val = this.keyword();
          break;
        }
        case TokenType.StringConstant: {
          val = this.stringVal();
          break;
        }
        case TokenType.Symbol: {
          const token = this.symbol();
          switch (token) {
            case '<':
              val = '&lt;';
            case '>':
              val = '&gt;';
            case '&':
              val = '&amp;';
            default:
              val = token;
          }
          break;
        }
      }
      const type = this.tokenType();
      outStream.write(`\t<${type}>${val}</${type}>\n`);
    }
    outStream.write('</tokens>\n');
    outStream.end();
  }

  hasMoreTokens(): boolean {
    return this.currentTokenPos < this.tokens.length;
  }

  advance() {
    if (!this.hasMoreTokens()) {
      throw new Error('cannot call advance when there are no more tokens');
    }

    this.currentTokenPos += 1;
  }

  peekNextToken() {
    const nextPos = this.currentTokenPos + 1;
    if (!(nextPos < this.tokens.length)) {
      throw new Error(
        'Cannot peek beyond tokens. Length: ' + this.tokens.length
      );
    }
    return this.tokens[nextPos];
  }

  tokenType(): TokenType {
    if (this.currentTokenPos === -1) {
      throw new Error('Must advance to first token. Invoke advance method.');
    }
    const currentToken = this.getCurrentToken();
    if (isSymbol(currentToken)) {
      return TokenType.Symbol;
    } else if (isStringConstant(currentToken)) {
      return TokenType.StringConstant;
    } else if (isIntegerConstant(currentToken)) {
      return TokenType.IntegerConstant;
    } else if (isKeyword(currentToken)) {
      return TokenType.Keyword;
    }
    return TokenType.Identifier;
  }

  keyword(): string {
    if (this.tokenType() !== TokenType.Keyword) {
      throw new Error('Not a keyword: ' + this.getCurrentToken());
    }
    return this.getCurrentToken();
  }

  symbol(): string {
    if (this.tokenType() !== TokenType.Symbol) {
      throw new Error('Not a symbol: ' + this.getCurrentToken());
    }
    return this.getCurrentToken();
  }

  identifier(): string {
    if (this.tokenType() !== TokenType.Identifier) {
      throw new Error('Not an identifier: ' + this.getCurrentToken());
    }
    return this.getCurrentToken();
  }

  intVal(): number {
    if (this.tokenType() !== TokenType.IntegerConstant) {
      throw new Error('Not an int: ' + this.getCurrentToken());
    }
    return parseInt(this.getCurrentToken());
  }

  stringVal(): string {
    if (this.tokenType() !== TokenType.StringConstant) {
      throw new Error('Not a string: ' + this.getCurrentToken());
    }
    return this.getCurrentToken().replace(/"/g, '');
  }

  private getCurrentToken(): string {
    return this.tokens[this.currentTokenPos];
  }
}
