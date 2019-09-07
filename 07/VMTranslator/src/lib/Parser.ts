import Token, { TokenType } from './Token';

const getType = (line: string) => {
  if (line.slice(0, 2) === '//') {
    return TokenType.COMMENT;
  }
  if (line === '') {
    return TokenType.WHITESPACE;
  }
  return TokenType.COMMAND;
};

export default class Parser {
  parseLine(originalText: string, lineNum: number) {
    let command;
    let segment;
    let index;
    const trimmed = originalText.trim();
    const type = getType(trimmed);
    if (type === TokenType.COMMAND) {
      [command, segment, index] = trimmed.split(' ');
    }
    return new Token({
      type,
      originalText,
      lineNum,
      command,
      segment,
      index
    });
  }
}
