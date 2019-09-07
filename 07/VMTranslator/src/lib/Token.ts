export enum TokenType {
  COMMENT = 'COMMENT',
  WHITESPACE = 'WHITESPACE',
  COMMAND = 'COMMAND'
}

export enum Segments {
  constant = 'constant'
}

interface TokenProps {
  type: TokenType;
  originalText: string;
  command: string | undefined;
  segment: string | undefined;
  index: string | undefined;
}

export default class Token {
  type: TokenType;
  originalText: string;
  command: string | undefined;
  segment: string | undefined;
  index: number | undefined;

  constructor({ type, originalText, command, segment, index }: TokenProps) {
    this.type = type;
    this.originalText = originalText;
    this.command = command;
    this.segment = segment;
    this.index = index === undefined ? undefined : Number(index);
  }

  isCommand() {
    return this.type === TokenType.COMMAND;
  }
}
