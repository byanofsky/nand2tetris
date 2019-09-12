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
  // TODO: Rename segment -> arg1 and index -> arg2
  segment: string | undefined;
  index: string | undefined;
}

export default class Token {
  type: TokenType;
  baseName: string;
  originalText: string;
  lineNum: number;
  command: string | undefined;
  segment: string | undefined;
  index: number | undefined;

  constructor({
    type,
    baseName,
    originalText,
    command,
    segment,
    index,
    lineNum
  }: TokenProps) {
    this.type = type;
    this.baseName = baseName;
    this.originalText = originalText;
    this.lineNum = lineNum;
    this.command = command;
    this.segment = segment;
    this.index = index === undefined ? undefined : Number(index);
  }

  isCommand() {
    return this.type === TokenType.COMMAND;
  }
}
