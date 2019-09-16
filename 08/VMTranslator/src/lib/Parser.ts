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
    const line = originalText.split('//')[0].trim();
    const type = getType(line);
    const [command, arg1, arg2] = line.split(' ');
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
