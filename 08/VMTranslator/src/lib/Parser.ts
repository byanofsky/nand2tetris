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
  parseLine(baseName: string, originalText: string, lineNum: number) {
    let command;
    let arg1;
    let arg2;
    const trimmed = originalText.trim();
    const type = getType(trimmed);
    if (type === TokenType.COMMAND) {
      [command, arg1, arg2] = trimmed.split(' ');
    }
    return new Token({
      type,
      baseName,
      originalText,
      lineNum,
      command,
      arg1,
      arg2
    });
  }
}
