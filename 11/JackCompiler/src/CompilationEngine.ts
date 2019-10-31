import { WriteStream } from 'fs';
import JackTokenizer from './JackTokenizer';
import { TokenType } from './types';
import SymbolTable, {
  SymbolKind,
  convertKeywordToSymbolKind
} from './SymbolTable';
import VMWriter from './VMWriter';

export default class CompilationEngine {
  private tokenizer: JackTokenizer;
  private symbolTable: SymbolTable;
  private vmWriter: VMWriter;

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
    this.compileKeyword();
    this.symbolTable.define(
      this.tokenizer.identifier(),
      'class',
      SymbolKind.None
    );
    this.compileIdentifier(true);
    this.compileSymbol();
    while (this.isClassVarDec()) {
      this.compileClassVarDec();
    }
    while (this.isSubroutineDec()) {
      this.compileSubroutineDec();
    }
    this.compileSymbol();
  }

  compileClassVarDec() {
    // keyword
    const keyword = this.tokenizer.keyword();
    this.compileKeyword();
    // type
    const type = this.isKeyword()
      ? this.tokenizer.keyword()
      : this.tokenizer.identifier();
    this.compileType();
    // varNames
    while (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      // varName
      this.symbolTable.define(
        this.tokenizer.identifier(),
        type,
        convertKeywordToSymbolKind(keyword)
      );
      this.compileIdentifier(true);
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.compileSymbol();
      }
    }
    // ';'
    this.compileSymbol();
  }

  private isClassVarDec() {
    if (!this.isKeyword()) {
      return false;
    }
    const keyword = this.tokenizer.keyword();
    return keyword === 'static' || keyword === 'field';
  }

  private compileType() {
    if (this.isKeyword()) {
      this.compileKeyword();
    } else {
      this.compileIdentifier();
    }
  }

  compileSubroutineDec() {
    // keyword
    this.compileKeyword();
    // 'void' | type
    this.compileType();
    // subroutineName
    this.symbolTable.startSubrouting();
    this.symbolTable.define(
      this.tokenizer.identifier(),
      'subroutine',
      SymbolKind.None
    );
    this.compileIdentifier(true);
    // '('
    this.compileSymbol();
    // parameterList
    this.compileParameterList();
    // ')'
    this.compileSymbol();
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
    this.compileSymbol();
    while (this.isVarDec()) {
      this.compileVarDec();
    }
    this.compileStatements();
    // '}'
    this.compileSymbol();
  }

  compileParameterList() {
    while (!(this.isSymbol() && this.tokenizer.symbol() === ')')) {
      // type
      const type = this.isKeyword()
        ? this.tokenizer.keyword()
        : this.tokenizer.identifier();
      this.compileType();
      // varName
      this.symbolTable.define(
        this.tokenizer.identifier(),
        type,
        SymbolKind.Arg
      );
      this.compileIdentifier(true);
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.compileSymbol();
      }
    }
  }

  compileVarDec() {
    // 'var'
    this.compileKeyword();
    // type
    const type = this.isKeyword()
      ? this.tokenizer.keyword()
      : this.tokenizer.identifier();
    this.compileType();
    while (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      this.symbolTable.define(
        this.tokenizer.identifier(),
        type,
        SymbolKind.Var
      );
      this.compileIdentifier(true);
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.compileSymbol();
      }
    }
    // ';'
    this.compileSymbol();
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
    this.compileSymbol();
  }

  isDo(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'do';
  }

  compileSubroutineCall() {
    // subroutineName | className | varName
    this.compileIdentifier();
    if (this.isSymbol() && this.tokenizer.symbol() === '.') {
      // '.'
      this.compileSymbol();
      // 'subRoutineName'
      this.compileIdentifier();
    }
    // '('
    this.compileSymbol();
    // expressionList
    this.compileExpressionList();
    // ')'
    this.compileSymbol();
  }

  compileLet() {
    // 'let'
    this.compileKeyword();
    // varName
    this.compileIdentifier();
    if (this.tokenizer.symbol() === '[') {
      // '['
      this.compileSymbol();
      // expression
      this.compileExpression();
      // ']'
      this.compileSymbol();
    }
    // '='
    this.compileSymbol();
    // expression
    this.compileExpression();
    // ';'
    this.compileSymbol();
  }

  isLet(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'let';
  }

  compileWhile() {
    // 'while'
    this.compileKeyword();
    // '('
    this.compileSymbol();
    // expression
    this.compileExpression();
    // ')'
    this.compileSymbol();
    // '{'
    this.compileSymbol();
    // statements
    this.compileStatements();
    // '}'
    this.compileSymbol();
  }

  isWhile(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'while';
  }

  compileReturn() {
    // 'return'
    this.compileKeyword();
    // 'expression'
    if (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      this.compileExpression();
    }
    // ';'
    this.compileSymbol();
  }

  isReturn(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'return';
  }

  compileIf() {
    // 'if'
    this.compileKeyword();
    // '('
    this.compileSymbol();
    // expression
    this.compileExpression();
    // ')'
    this.compileSymbol();
    // '{'
    this.compileSymbol();
    // statements
    this.compileStatements();
    // '}'
    this.compileSymbol();
    if (this.isKeyword() && this.tokenizer.keyword() === 'else') {
      // 'else'
      this.compileKeyword();
      // '{'
      this.compileSymbol();
      // statements
      this.compileStatements();
      // '}'
      this.compileSymbol();
    }
  }

  isIf(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'if';
  }

  compileExpression() {
    this.compileTerm();
    while (this.isOp()) {
      this.compileOp();
      this.compileTerm();
    }
  }

  compileTerm() {
    // integerConstant
    if (this.isIntegerConstant()) {
      this.compileIntegerConstant();
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
          this.compileSymbol();
          // expression
          this.compileExpression();
          // ']'
          this.compileSymbol();
          break;
        // subRoutineCall
        case '(':
        case '.':
          this.compileSubroutineCall();
          break;
        // varName
        default:
          this.compileIdentifier();
      }
    } else if (this.isSymbol()) {
      // (expression) | unaryOp term
      const symbol = this.tokenizer.symbol();
      switch (symbol) {
        // (expression)
        case '(':
          // '('
          this.compileSymbol();
          // expression
          this.compileExpression();
          // ')'
          this.compileSymbol();
          break;
        // unaryOp term
        default:
          this.compileSymbol();
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

  compileOp() {
    this.compileSymbol();
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
        this.compileSymbol();
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

  private compileSymbol() {
    let symbol = this.tokenizer.symbol();
    switch (symbol) {
      case '<':
        symbol = '&lt;';
        break;
      case '>':
        symbol = '&gt;';
        break;
      case '&':
        symbol = '&amp;';
        break;
    }
    this.tokenizer.advance();
  }

  private compileIntegerConstant() {
    this.tokenizer.advance();
  }

  private compileStringConstant() {
    this.tokenizer.advance();
  }

  private compileIdentifier(isDeclaration = false) {
    this.tokenizer.advance();
  }
}
