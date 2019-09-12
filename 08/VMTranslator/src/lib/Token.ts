export enum TokenType {
  COMMENT = 'COMMENT',
  WHITESPACE = 'WHITESPACE',
  COMMAND = 'COMMAND'
}

export enum Segments {
  constant = 'constant',
  local = 'local', //1
  argument = 'argument', //2
  this = 'this', //3
  that = 'that', //4
  pointer = 'pointer', //3-4
  temp = 'temp', //5-12
  static = 'static' //@xxx.i
}

export type Label = string;

interface TokenProps {
  type: TokenType;
  baseName: string;
  originalText: string;
  lineNum: number;
  command: string | undefined;
  arg1: string | undefined;
  arg2: string | undefined;
}

// TODO: Can we have types for specific tokens?
export default class Token {
  type: TokenType;
  baseName: string;
  originalText: string;
  lineNum: number;
  command: string | undefined;
  arg1: string | undefined;
  arg2: string | undefined;

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
}
