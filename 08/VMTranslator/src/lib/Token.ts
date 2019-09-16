export enum TokenType {
  COMMENT = 'COMMENT',
  WHITESPACE = 'WHITESPACE',
  COMMAND = 'COMMAND'
}

interface TokenProps {
  type: TokenType;
  baseName: string;
  originalText: string;
  lineNum: number;
  command: string | undefined;
  arg1: string | undefined;
  arg2: string | undefined;
}

export default class Token {
  private type: TokenType;
  private baseName: string;
  private originalText: string;
  private lineNum: number;
  private command: string | undefined;
  private arg1: string | undefined;
  private arg2: string | undefined;

  constructor({
    type,
    baseName,
    originalText,
    command,
    arg1,
    arg2,
    lineNum
  }: TokenProps) {
    this.type = type;
    this.baseName = baseName;
    this.originalText = originalText;
    this.lineNum = lineNum;
    this.command = command;
    this.arg1 = arg1;
    this.arg2 = arg2;
  }

  isCommand() {
    return this.type === TokenType.COMMAND;
  }

  getType() {
    return this.type;
  }

  getBaseName() {
    return this.baseName;
  }

  getOriginalText() {
    return this.originalText;
  }

  getLineNum() {
    return this.lineNum;
  }

  getCommand() {
    if (!this.isCommand()) {
      throw new Error('cannot getCommand for token of type ' + this.type);
    }
    return this.command;
  }

  getArg1() {
    if (this.arg1 === undefined) {
      throw new Error('arg1 is undefined');
    }
    return this.arg1;
  }

  getArg2() {
    if (this.arg2 === undefined) {
      throw new Error('arg2 is undefined');
    }
    const asNumber = Number(this.arg2);
    if (Number.isNaN(asNumber)) {
      throw new Error('illegal arg2: cannot convert into number: ' + this.arg2);
    }
    return asNumber;
  }
}
