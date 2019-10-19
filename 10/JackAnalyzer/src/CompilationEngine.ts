import { WriteStream } from 'fs';
import JackTokenizer from './JackTokenizer';
import { TokenType } from './types';

export default class CompilationEngine {
  private outStream: WriteStream;
  private tokenizer: JackTokenizer;
  private nTabs: number = 0;

  constructor(outStream: WriteStream, tokenizer: JackTokenizer) {
    this.outStream = outStream;
    this.tokenizer = tokenizer;
  }

  compile() {
    this.tokenizer.advance();
    this.compileClass();
    this.outStream.end();
  }

  compileClass() {
    this.write('<class>');
    this.indent();
    // class
    this.compileKeyword();
    this.compileIdentifier();
    this.compileSymbol();
    while (this.isClassVarDec()) {
      this.compileClassVarDec();
    }
    while (this.isSubroutineDec()) {
      this.compileSubroutineDec();
    }
    this.compileSymbol();
    this.deindent();
    this.write('</class>');
  }

  compileClassVarDec() {
    this.write('<classVarDec>');
    this.indent();
    // keyword
    this.compileKeyword();
    // type
    this.compileType();
    // varNames
    while (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      // varName
      this.compileIdentifier();
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.compileSymbol();
      }
    }
    // ';'
    this.compileSymbol();
    this.deindent();
    this.write('</classVarDec>');
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
    this.write('<subroutineDec>');
    this.indent();
    // keyword
    this.compileKeyword();
    // 'void' | type
    this.compileType();
    // subroutineName
    this.compileIdentifier();
    // '('
    this.compileSymbol();
    // parameterList
    this.compileParameterList();
    // ')'
    this.compileSymbol();
    // subroutineBody
    this.compileSubroutineBody();
    this.deindent();
    this.write('</subroutineDec>');
  }

  private isSubroutineDec() {
    if (!this.isKeyword()) {
      return false;
    }
    const keyword = this.tokenizer.keyword();
    return ['constructor', 'function', 'method'].includes(keyword);
  }

  private compileSubroutineBody() {
    this.write('<subroutineBody>');
    this.indent();
    // '{'
    this.compileSymbol();
    while (this.isVarDec()) {
      this.compileVarDec();
    }
    this.compileStatements();
    // '}'
    this.compileSymbol();
    this.deindent();
    this.write('</subroutineBody>');
  }

  compileParameterList() {
    this.write('<parameterList>');
    this.indent();
    while (!(this.isSymbol() && this.tokenizer.symbol() === ')')) {
      // type
      this.compileType();
      // varName
      this.compileIdentifier();
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.compileSymbol();
      }
    }
    this.deindent();
    this.write('</parameterList>');
  }

  compileVarDec() {
    this.write('<varDec>');
    this.indent();
    // 'var'
    this.compileKeyword();
    // type
    this.compileType();
    while (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      this.compileIdentifier();
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.compileSymbol();
      }
    }
    // ';'
    this.compileSymbol();
    this.deindent();
    this.write('</varDec>');
  }

  private isVarDec() {
    return this.isKeyword() && this.tokenizer.keyword() === 'var';
  }

  compileStatements() {
    this.write('<statements>');
    this.indent();
    while (this.isStatement()) {
      this.compileStatement();
    }
    this.deindent();
    this.write('</statements>');
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
    this.write('<doStatement>');
    this.indent();
    // 'do'
    this.compileKeyword();
    // subroutineCall
    this.compileSubroutineCall();
    // ';'
    this.compileSymbol();
    this.deindent();
    this.write('</doStatement>');
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
    this.write('<letStatement>');
    this.indent();
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
    this.deindent();
    this.write('</letStatement>');
  }

  isLet(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'let';
  }

  compileWhile() {
    this.write('<whileStatement>');
    this.indent();
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
    this.deindent();
    this.write('</whileStatement>');
  }

  isWhile(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'while';
  }

  compileReturn() {
    this.write('<returnStatement>');
    this.indent();
    // 'return'
    this.compileKeyword();
    // 'expression'
    if (!(this.isSymbol() && this.tokenizer.symbol() === ';')) {
      this.compileExpression();
    }
    // ';'
    this.compileSymbol();
    this.deindent();
    this.write('</returnStatement>');
  }

  isReturn(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'return';
  }

  compileIf() {
    this.write('<ifStatement>');
    this.indent();
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
    this.deindent();
    this.write('</ifStatement>');
  }

  isIf(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'if';
  }

  compileExpression() {
    this.write('<expression>');
    this.indent();
    this.compileTerm();
    while (this.isOp()) {
      this.compileOp();
      this.compileTerm();
    }
    this.deindent();
    this.write('</expression>');
  }

  compileTerm() {
    this.write('<term>');
    this.indent();
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
    this.deindent();
    this.write('</term>');
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
    this.write('<expressionList>');
    this.indent();
    while (this.isExpression()) {
      this.compileExpression();
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        this.compileSymbol();
      }
    }
    this.deindent();
    this.write('</expressionList>');
  }

  isExpression(): boolean {
    return this.isTerm();
  }

  // TODO: We could map a type to tokenizer method
  private writeTerminal(type: TokenType, token: string) {
    this.write(`<${type}>${token}</${type}>`);
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
    this.writeTerminal(TokenType.Keyword, this.tokenizer.keyword());
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
    this.writeTerminal(TokenType.Symbol, symbol);
    this.tokenizer.advance();
  }

  private compileIntegerConstant() {
    this.writeTerminal(
      TokenType.IntegerConstant,
      String(this.tokenizer.intVal())
    );
    this.tokenizer.advance();
  }

  private compileStringConstant() {
    this.writeTerminal(TokenType.StringConstant, this.tokenizer.stringVal());
    this.tokenizer.advance();
  }

  private compileIdentifier() {
    this.writeTerminal(TokenType.Identifier, this.tokenizer.identifier());
    this.tokenizer.advance();
  }

  private write(out: string) {
    const tabs = '\t'.repeat(this.nTabs);
    this.outStream.write(tabs + out + '\n');
  }

  private indent() {
    this.nTabs++;
  }

  private deindent() {
    this.nTabs--;
  }
}
