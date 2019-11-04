import { WriteStream } from 'fs';
import JackTokenizer from './JackTokenizer';
import { TokenType } from './types';
import SymbolTable, { SymbolKind } from './SymbolTable';
import VMWriter, { Segment, ArithmeticCommand } from './VMWriter';
import {
  convertKeywordToSymbolKind,
  convertSymbolKindToSegment,
  generateLabel
} from './utils';

export default class CompilationEngine {
  private tokenizer: JackTokenizer;
  private symbolTable: SymbolTable;
  private vmWriter: VMWriter;
  private className: string | null = null;
  private instanceSize: number = 0;

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
    this.instanceSize = this.symbolTable.varCount(SymbolKind.Field);
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
    if (!this.className) {
      throw new Error(`ClassName not initialized`);
    }
    this.symbolTable.startSubroutine();
    // keyword: 'constructor' | 'function' | 'method'
    const subType = this.tokenizer.keyword();
    this.tokenizer.advance();
    if (subType === 'method') {
      this.symbolTable.define('this', this.className, SymbolKind.Arg);
    }
    // 'void' | type
    this.tokenizer.advance();
    // subroutineName
    const subroutineName = this.tokenizer.identifier();
    this.tokenizer.advance();
    // '('
    this.tokenizer.advance();
    // parameterList
    this.compileParameterList();
    // ')'
    this.tokenizer.advance();

    // subroutineBody
    // TODO: Fix, this is super confusing
    const {
      nLocals,
      continueCompileSubroutineBody
    } = this.compileSubroutineBody();

    // TODO: extract to helper so we don't repeat className
    this.vmWriter.writeFunction(`${this.className}.${subroutineName}`, nLocals);

    if (subType === 'constructor') {
      // Alloc memory for instance and assign base to THIS
      this.vmWriter.writePush(Segment.Const, this.instanceSize);
      this.vmWriter.writeCall('Memory.alloc', 1);
      this.vmWriter.writePop(Segment.Pointer, 0);
    }
    if (subType === 'method') {
      // Assign arg 0 as THIS
      this.vmWriter.writePush(Segment.Arg, 0);
      this.vmWriter.writePop(Segment.Pointer, 0);
    }

    continueCompileSubroutineBody();
  }

  private isSubroutineDec() {
    if (!this.isKeyword()) {
      return false;
    }
    const keyword = this.tokenizer.keyword();
    return ['constructor', 'function', 'method'].includes(keyword);
  }

  private compileSubroutineBody(): {
    nLocals: number;
    continueCompileSubroutineBody: Function;
  } {
    let nLocals = 0;

    // '{'
    this.tokenizer.advance();
    while (this.isVarDec()) {
      const nVarDec = this.compileVarDec();
      nLocals += nVarDec;
    }

    const continueCompileSubroutineBody = () => {
      this.compileStatements();
      // '}'
      this.tokenizer.advance();
    };

    return {
      nLocals,
      continueCompileSubroutineBody
    };
  }

  compileParameterList() {
    while (!(this.isSymbol() && this.tokenizer.symbol() === ')')) {
      // type
      const type = this.getType();
      this.tokenizer.advance();
      // varName
      const identifier = this.tokenizer.identifier();
      this.tokenizer.advance();
      this.symbolTable.define(identifier, type, SymbolKind.Arg);

      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        // ','
        this.tokenizer.advance();
      }
    }
  }

  compileVarDec(): number {
    let nVarDec = 0;

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
      nVarDec += 1;
    }
    // ';'
    this.tokenizer.advance();

    return nVarDec;
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
    this.tokenizer.advance();
    // subroutineCall
    this.compileSubroutineCall();
    // pop the returned value
    this.vmWriter.writePop(Segment.Temp, 0);
    // ';'
    this.tokenizer.advance();
  }

  isDo(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'do';
  }

  compileSubroutineCall() {
    // subroutineName | className | varName
    const idenitifier = this.tokenizer.identifier();
    this.tokenizer.advance();
    let nArgs = 0;
    let fullSubroutineName;
    if (this.isSymbol() && this.tokenizer.symbol() === '.') {
      let className = idenitifier;
      if (this.symbolTable.has(idenitifier)) {
        // subroutineName is a varName
        // Push instance as Arg 0 so it can be assigned to THIS in method
        const kind = this.symbolTable.kindOf(idenitifier);
        const segment = convertSymbolKindToSegment(kind);
        const index = this.symbolTable.indexOf(idenitifier);
        this.vmWriter.writePush(segment, index);
        nArgs += 1;

        // Get className from symbol table
        const type = this.symbolTable.typeOf(idenitifier);
        className = type;
      }

      // '.'
      this.tokenizer.advance();
      // 'subRoutineName'
      const methodName = this.tokenizer.identifier();
      this.tokenizer.advance();
      fullSubroutineName = `${className}.${methodName}`;
    } else {
      // Is a local method / function
      fullSubroutineName = `${this.className}.${idenitifier}`;
      // Push THIS to stack as Arg 0
      this.vmWriter.writePush(Segment.Pointer, 0);
      nArgs += 1;
    }
    // '('
    this.tokenizer.advance();
    // expressionList
    nArgs += this.compileExpressionList();
    // ')'
    this.tokenizer.advance();
    this.vmWriter.writeCall(fullSubroutineName, nArgs);
  }

  compileLet() {
    // 'let'
    this.tokenizer.advance();
    // varName
    const idenitifier = this.tokenizer.identifier();
    this.tokenizer.advance();
    const kind = this.symbolTable.kindOf(idenitifier);
    const segment = convertSymbolKindToSegment(kind);
    const index = this.symbolTable.indexOf(idenitifier);
    let popToSegment = segment;
    let popToIndex = index;
    if (this.tokenizer.symbol() === '[') {
      // Push base of Array
      this.vmWriter.writePush(segment, index);
      // '['
      this.tokenizer.advance();
      // expression
      this.compileExpression();
      // ']'
      this.tokenizer.advance();
      // Add base of Array plus Index
      this.vmWriter.writeArithmetic(ArithmeticCommand.Add);
      // Pop to THAT
      this.vmWriter.writePop(Segment.Pointer, 1);

      // Update popTo Segment and Index
      popToSegment = Segment.That;
      popToIndex = 0;
    }
    // '='
    this.tokenizer.advance();
    // expression
    this.compileExpression();
    this.vmWriter.writePop(popToSegment, popToIndex);
    // ';'
    this.tokenizer.advance();
  }

  isLet(): boolean {
    return this.isKeyword() && this.tokenizer.keyword() === 'let';
  }

  compileWhile() {
    const whileLabel = generateLabel('while');
    const breakLabel = generateLabel('breakWhile');

    this.vmWriter.writeLabel(whileLabel);

    // 'while'
    this.tokenizer.advance();
    // '('
    this.tokenizer.advance();
    // expression
    this.compileExpression();
    // ')'
    this.tokenizer.advance();

    // Not conditional statement.
    // Therefore, if conditional is false, goto break label.
    // Otherwise, continue through while block.
    this.vmWriter.writeArithmetic(ArithmeticCommand.Not);
    this.vmWriter.writeIf(breakLabel);

    // '{'
    this.tokenizer.advance();
    // statements
    this.compileStatements();
    // Return to beginning of while statemet
    this.vmWriter.writeGoto(whileLabel);
    // '}'
    this.tokenizer.advance();

    this.vmWriter.writeLabel(breakLabel);
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
    const falseLabel = generateLabel('else');
    const breakLabel = generateLabel('breakIf');

    // 'if'
    this.tokenizer.advance();
    // '('
    this.tokenizer.advance();
    // expression
    this.compileExpression();
    // ')'
    this.tokenizer.advance();

    // Not conditional statement.
    // Therefore, if conditional is false, goto `false` label,
    // which executes else (if it exists) then continues execution.
    // Otherwise, execute `true` block and jump to `break` label
    this.vmWriter.writeArithmetic(ArithmeticCommand.Not);
    this.vmWriter.writeIf(falseLabel);

    // '{'
    this.tokenizer.advance();
    // statements
    this.compileStatements();
    // '}'
    this.tokenizer.advance();
    this.vmWriter.writeGoto(breakLabel);

    this.vmWriter.writeLabel(falseLabel);
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

    this.vmWriter.writeLabel(breakLabel);
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
      // TODO: streamline this process
      const stringVal = this.tokenizer.stringVal();
      this.tokenizer.advance();
      // Create new String with length of stringVal
      // Store in TEMP 0
      this.vmWriter.writePush(Segment.Const, stringVal.length);
      this.vmWriter.writeCall('String.new', 1);
      // Create string by appending chars
      for (let i = 0; i < stringVal.length; i++) {
        const charCode = stringVal[i].charCodeAt(0);
        this.vmWriter.writePush(Segment.Const, charCode);
        this.vmWriter.writeCall('String.appendChar', 2);
      }
    } else if (this.isKeyword()) {
      // keywordConstant
      this.compileKeywordConstant();
    } else if (this.isIdentifier()) {
      // varName | varName[expression] | subRoutineCall
      const nextToken = this.tokenizer.peekNextToken();
      switch (nextToken) {
        // varName[expression]
        case '[': {
          // TODO: This sequence is inefficient
          // Array
          // look up Array base by varName
          const arrayIdentifier = this.tokenizer.identifier();
          this.tokenizer.advance();
          const kind = this.symbolTable.kindOf(arrayIdentifier);
          const segment = convertSymbolKindToSegment(kind);
          const index = this.symbolTable.indexOf(arrayIdentifier);
          // Push Array base to stack
          this.vmWriter.writePush(segment, index);

          // '['
          this.tokenizer.advance();
          // expression
          this.compileExpression();
          // ']'
          this.tokenizer.advance();

          // Add Array base and index, and assign to THAT
          this.vmWriter.writeArithmetic(ArithmeticCommand.Add);
          this.vmWriter.writePop(Segment.Pointer, 1);
          // Push stored Array value to stack
          this.vmWriter.writePush(Segment.That, 0);
          break;
        }
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
          const writeOp = this.compileUnaryOp();
          this.compileTerm();
          writeOp();
      }
    }
  }

  compileKeywordConstant() {
    const keyword = this.tokenizer.keyword();
    this.tokenizer.advance();
    switch (keyword) {
      case 'true': {
        this.vmWriter.writePush(Segment.Const, 1);
        this.vmWriter.writeArithmetic(ArithmeticCommand.Neg);
        return;
      }
      case 'false':
      case 'null': {
        this.vmWriter.writePush(Segment.Const, 0);
        return;
      }
      case 'this': {
        this.vmWriter.writePush(Segment.Pointer, 0);
        return;
      }
      default:
        throw new Error(`Keyword Constant not recognized: ${keyword}`);
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

  compileUnaryOp() {
    const op = this.tokenizer.symbol();
    this.tokenizer.advance();
    let command: ArithmeticCommand;
    switch (op) {
      case '-': {
        command = ArithmeticCommand.Neg;
        break;
      }
      case '~': {
        command = ArithmeticCommand.Not;
        break;
      }
      default:
        throw new Error(`Not a recongized unary operation: "${op}"`);
    }
    return () => this.vmWriter.writeArithmetic(command);
  }

  isUnaryOp(): boolean {
    return this.isSymbol() && ['-', '~'].includes(this.tokenizer.symbol());
  }

  compileExpressionList() {
    let nArgs = 0;
    while (this.isExpression()) {
      this.compileExpression();
      nArgs += 1;
      if (this.isSymbol() && this.tokenizer.symbol() === ',') {
        this.tokenizer.advance();
      }
    }
    return nArgs;
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
}
