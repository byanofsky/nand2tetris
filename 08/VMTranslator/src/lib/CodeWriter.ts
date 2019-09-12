import { WriteStream } from 'fs';
import Token from './Token';
import {
  pushCommand,
  addCommand,
  popCommand,
  subCommand,
  negCommand,
  gtCommand,
  eqCommand,
  ltCommand,
  andCommand,
  orCommand,
  notCommand
} from './Commands';

export enum Commands {
  push = 'push',
  pop = 'pop',
  add = 'add',
  sub = 'sub',
  and = 'and',
  or = 'or',
  neg = 'neg',
  not = 'not',
  eq = 'eq',
  gt = 'gt',
  lt = 'lt'
}

const getAsmCode = (token: Token) => {
  if (!token.isCommand()) {
    throw new Error('Cannot get ASM code for token type: ' + token.type);
  }

  switch (token.command) {
    case Commands.push:
      return pushCommand(token);
    case Commands.pop:
      return popCommand(token);
    case Commands.add:
      return addCommand();
    case Commands.sub:
      return subCommand();
    case Commands.and:
      return andCommand();
    case Commands.or:
      return orCommand();
    case Commands.neg:
      return negCommand();
    case Commands.not:
      return notCommand();
    case Commands.eq:
      return eqCommand();
    case Commands.gt:
      return gtCommand();
    case Commands.lt:
      return ltCommand();
    default:
      throw new Error('unrecognized token command: ' + token.command);
  }
};

export default class CodeWriter {
  out: WriteStream;

  constructor(out: WriteStream) {
    this.out = out;
  }

  translate(token: Token) {
    if (!token.isCommand()) {
      return;
    }
    const source = `// ${token.lineNum}: ${token.originalText}`;
    const code = getAsmCode(token);
    const output = [source, code, '\n'].join('\n');
    this.out.write(output);
  }
}
