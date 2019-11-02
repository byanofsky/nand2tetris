import { WriteStream } from 'fs';
import JackTokenizer from './JackTokenizer';
import { TokenType } from './types';
import SymbolTable, { SymbolKind } from './SymbolTable';
import VMWriter, { Segment, ArithmeticCommand } from './VMWriter';
import {
  convertKeywordToSymbolKind,
  convertSymbolKindToSegment
} from './utils';

export default class CompilationEngine {
  private tokenizer: JackTokenizer;
  private symbolTable: SymbolTable;
  private vmWriter: VMWriter;
  private className: string | null = null;

  constructor(
    tokenizer: JackTokenizer,
    symbolTable: SymbolTable,
    vmWriter: VMWriter
  ) {
    this.tokenizer = tokenizer;
    this.symbolTable = symbolTable;
    this.vmWriter = vmWriter;
  }

  compile() {
    this.tokenizer.advance();
    this.compileClass();
  }

  compileClass() {
    // class
    // skip keyword, identifier, symbol `{`
    // TODO: better way to handle advancing
    // maybe via `this.advance(n)`
    this.tokenizer.advance();
    this.className = this.tokenizer.identifier();
    this.tokenizer.advance();
    this.tokenizer.advance();
    while (this.isClassVarDec()) {
      this.compileClassVarDec();
    }
    while (this.isSubroutineDec()) {
      this.compileSubroutineDec();
    }
    // skip `}`
    this.tokenizer.advance();
  }

  compileClassVarDec() {
    // keyword
    const keyword = this.tokenizer.keyword();
    this.tokenizer.advance();
    // type
    const type = this.getType();
    this.tokenizer.advance();
    // varNames
    while (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      const identifier = this.tokenizer.identifier();
      // varName
      this.symbolTable.define(
        identifier,
        type,
        convertKeywordToSymbolKind(keyword)
      );
      this.tokenizer.advance();
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.tokenizer.advance();
      }
    }
    // ';'
    this.tokenizer.advance();
  }

  private isClassVarDec() {
    if (!this.isKeyword()) {
      return false;
    }
    const keyword = this.tokenizer.keyword();
    return keyword === 'static' || keyword === 'field';
  }

  private getType() {
    if (this.isKeyword()) {
      return this.tokenizer.keyword();
    }
    if (this.isIdentifier()) {
      return this.tokenizer.identifier();
    }
    // TODO: need way to get current token value
    throw new Error(
      'Called getType() on symbol that is not keyword or identifier'
    );
  }

  compileSubroutineDec() {
    this.symbolTable.startSubroutine();
    // keyword
    this.tokenizer.advance();
    // 'void' | type
    this.tokenizer.advance();
    // subroutineName
    const subroutineName = this.tokenizer.identifier();
    this.tokenizer.advance();
    // '('
    this.tokenizer.advance();
    // parameterList
    const nLocals = this.compileParameterList();
    // ')'
    this.tokenizer.advance();

    // TODO: extract to helper so we don't repeat className
    this.vmWriter.writeFunction(`${this.className}.${subroutineName}`, nLocals);

    // subroutineBody
    this.compileSubroutineBody();
  }

  private isSubroutineDec() {
    if (!this.isKeyword()) {
      return false;
    }
    const keyword = this.tokenizer.keyword();
    return ['constructor', 'function', 'method'].includes(keyword);
  }

  private compileSubroutineBody() {
    // '{'
    this.tokenizer.advance();
    while (this.isVarDec()) {
      this.compileVarDec();
    }
    this.compileStatements();
    // '}'
    this.tokenizer.advance();
  }

  compileParameterList() {
    let nLocals = 0;
    while (!(this.isSymbol() && this.tokenizer.symbol() === ')')) {
      // type
      const type = this.getType();
      this.tokenizer.advance();
      // varName
      const identifier = this.tokenizer.identifier();
      this.tokenizer.advance();
      this.symbolTable.define(identifier, type, SymbolKind.Arg);
      nLocals += 1;

      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.tokenizer.advance();
      }
    }
    return nLocals;
  }

  compileVarDec() {
    // 'var'
    this.tokenizer.advance();
    // type
    const type = this.getType();
    this.tokenizer.advance();
    while (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      const identifier = this.tokenizer.identifier();
      this.symbolTable.define(identifier, type, SymbolKind.Var);
      this.tokenizer.advance();
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.tokenizer.advance();
      }
    }
    // ';'
    this.tokenizer.advance();
  }

  private isVarDec() {
    return this.isKeyword() && this.tokenizer.keyword() === 'var';
  }

  compileStatements() {
    while (this.isStatement()) {
      this.compileStatement();
    }
  }

  compileStatement() {
    // TODO: use a switch with statement type as enum
    if (this.isLet()) {
      this.compileLet();
    } else if (this.isIf()) {
      this.compileIf();
    } else if (this.isWhile()) {
      this.compileWhile();
    } else if (this.isDo()) {
      this.compileDo();
    } else if (this.isReturn()) {
      this.compileReturn();
    }
  }

  isStatement(): boolean {
    return (
      this.isLet() ||
      this.isIf() ||
      this.isWhile() ||
      this.isDo() ||
      this.isReturn()
    );
  }

  compileDo() {
    // 'do'
    this.compileKeyword();
    // subroutineCall
    this.compileSubroutineCall();
    // ';'
    this.tokenizer.advance();
  }

  isDo(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'do';
  }

  compileSubroutineCall() {
    // subroutineName | className | varName
    this.compileIdentifier();
    if (this.isSymbol() && this.tokenizer.symbol() === '.') {
      // '.'
      this.tokenizer.advance();
      // 'subRoutineName'
      this.compileIdentifier();
    }
    // '('
    this.tokenizer.advance();
    // expressionList
    this.compileExpressionList();
    // ')'
    this.tokenizer.advance();
  }

  compileLet() {
    // 'let'
    this.compileKeyword();
    // varName
    this.compileIdentifier();
    if (this.tokenizer.symbol() === '[') {
      // '['
      this.tokenizer.advance();
      // expression
      this.compileExpression();
      // ']'
      this.tokenizer.advance();
    }
    // '='
    this.tokenizer.advance();
    // expression
    this.compileExpression();
    // ';'
    this.tokenizer.advance();
  }

  isLet(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'let';
  }

  compileWhile() {
    // 'while'
    this.compileKeyword();
    // '('
    this.tokenizer.advance();
    // expression
    this.compileExpression();
    // ')'
    this.tokenizer.advance();
    // '{'
    this.tokenizer.advance();
    // statements
    this.compileStatements();
    // '}'
    this.tokenizer.advance();
  }

  isWhile(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'while';
  }

  compileReturn() {
    // 'return'
    this.tokenizer.advance();
    // 'expression'
    if (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      this.compileExpression();
    } else {
      // Return void, push `0` to stack
      this.vmWriter.writePush(Segment.Const, 0);
    }
    this.vmWriter.writeReturn();
    // ';'
    this.tokenizer.advance();
  }

  isReturn(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'return';
  }

  compileIf() {
    // 'if'
    this.compileKeyword();
    // '('
    this.tokenizer.advance();
    // expression
    this.compileExpression();
    // ')'
    this.tokenizer.advance();
    // '{'
    this.tokenizer.advance();
    // statements
    this.compileStatements();
    // '}'
    this.tokenizer.advance();
    if (this.isKeyword() && this.tokenizer.keyword() === 'else') {
      // 'else'
      this.compileKeyword();
      // '{'
      this.tokenizer.advance();
      // statements
      this.compileStatements();
      // '}'
      this.tokenizer.advance();
    }
  }

  isIf(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'if';
  }

  compileExpression() {
    this.compileTerm();
    while (this.isOp()) {
      const writeOp = this.compileOp();
      this.compileTerm();
      writeOp();
    }
  }

  compileTerm() {
    // integerConstant
    if (this.isIntegerConstant()) {
      const intVal = this.tokenizer.intVal();
      this.vmWriter.writePush(Segment.Const, intVal);
      this.tokenizer.advance();
    }
    // stringConstant
    else if (this.isStringConstant()) {
      this.compileStringConstant();
    } else if (this.isKeyword()) {
      // keywordConstant
      this.compileKeyword();
    } else if (this.isIdentifier()) {
      // varName | varName[expression] | subRoutineCall
      const nextToken = this.tokenizer.peekNextToken();
      switch (nextToken) {
        // varName[expression]
        case '[':
          // varName
          this.compileIdentifier();
          // '['
          this.tokenizer.advance();
          // expression
          this.compileExpression();
          // ']'
          this.tokenizer.advance();
          break;
        // subRoutineCall
        case '(':
        case '.':
          this.compileSubroutineCall();
          break;
        // varName
        default:
          const identifier = this.tokenizer.identifier();
          this.tokenizer.advance();
          const kind = this.symbolTable.kindOf(identifier);
          const segment = convertSymbolKindToSegment(kind);
          const index = this.symbolTable.indexOf(identifier);
          this.vmWriter.writePush(segment, index);
      }
    } else if (this.isSymbol()) {
      // (expression) | unaryOp term
      const symbol = this.tokenizer.symbol();
      switch (symbol) {
        // (expression)
        case '(':
          // '('
          this.tokenizer.advance();
          // expression
          this.compileExpression();
          // ')'
          this.tokenizer.advance();
          break;
        // unaryOp term
        default:
          this.tokenizer.advance();
          this.compileTerm();
      }
    }
  }

  isTerm(): boolean {
    return (
      this.isIntegerConstant() ||
      this.isStringConstant() ||
      this.isKeyword() ||
      this.isIdentifier() ||
      this.isUnaryOp() ||
      (this.isSymbol() && this.tokenizer.symbol() === '(')
    );
  }

  /**
   * Op is not written at moment of compilation. Therefore, compileOp
   * returns a function that should be invoked when write should occur.
   * This allows an expression like:
   * `1 + 2`
   * To be compiled as:
   * ```
   * 1
   * 2
   * add
   * ```
   */
  compileOp() {
    const op = this.tokenizer.symbol();
    this.tokenizer.advance();

    if (op === '*') {
      return () => this.vmWriter.writeCall('Math.multiply', 2);
    }
    if (op === '/') {
      return () => this.vmWriter.writeCall('Math.divide', 2);
    }

    let command: ArithmeticCommand;
    switch (op) {
      case '+': {
        command = ArithmeticCommand.Add;
        break;
      }
      case '-': {
        command = ArithmeticCommand.Sub;
        break;
      }
      case '&': {
        command = ArithmeticCommand.And;
        break;
      }
      case '|': {
        command = ArithmeticCommand.Or;
        break;
      }
      case '<': {
        command = ArithmeticCommand.Lt;
        break;
      }
      case '>': {
        command = ArithmeticCommand.Gt;
        break;
      }
      case '=': {
        command = ArithmeticCommand.Eq;
        break;
      }
      default:
        throw new Error(`Not a recognized operation: "${op}"`);
    }
    return () => this.vmWriter.writeArithmetic(command);
  }

  isOp(): boolean {
    const opList = ['+', '-', '*', '/', '&', '|', '<', '>', '='];
    return this.isSymbol() && opList.includes(this.tokenizer.symbol());
  }

  isUnaryOp(): boolean {
    return this.isSymbol() && ['-', '~'].includes(this.tokenizer.symbol());
  }

  compileExpressionList() {
    while (this.isExpression()) {
      this.compileExpression();
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        this.tokenizer.advance();
      }
    }
  }

  isExpression(): boolean {
    return this.isTerm();
  }

  private isKeyword(): boolean {
    return this.tokenizer.tokenType() === TokenType.Keyword;
  }

  private isSymbol(): boolean {
    return this.tokenizer.tokenType() === TokenType.Symbol;
  }

  private isIntegerConstant(): boolean {
    return this.tokenizer.tokenType() === TokenType.IntegerConstant;
  }

  private isStringConstant(): boolean {
    return this.tokenizer.tokenType() === TokenType.StringConstant;
  }

  private isIdentifier(): boolean {
    return this.tokenizer.tokenType() === TokenType.Identifier;
  }

  private compileKeyword() {
    this.tokenizer.advance();
  }

  private compileStringConstant() {
    this.tokenizer.advance();
  }

  private compileIdentifier() {
    this.tokenizer.advance();
  }
}
