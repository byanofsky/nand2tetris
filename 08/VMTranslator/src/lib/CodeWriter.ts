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
  notCommand,
  labelCommand,
  gotoCommand,
  ifGotoCommand,
  functionCommand,
  callCommand,
  returnCommand,
  initCommand
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
  lt = 'lt',
  label = 'label',
  goto = 'goto',
  ifGoto = 'if-goto',
  function = 'function',
  call = 'call',
  return = 'return'
}

export default class CodeWriter {
  out: WriteStream;
  curFunc: string | null;

  constructor(out: WriteStream) {
    this.out = out;
    this.curFunc = null;
    this.createInit();
  }

  createInit = () => {
    const output = [initCommand(), '\n'].join('\n');
    this.out.write(output);
  };

  translate(token: Token) {
    if (!token.isCommand()) {
      return;
    }
    const source = `// ${token.lineNum}: ${token.originalText}`;
    const code = this.getAsmCode(token);
    const output = [source, code, '\n'].join('\n');
    this.out.write(output);
  }

  getAsmCode = (token: Token) => {
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
      case Commands.label:
        return labelCommand(token, this.curFunc);
      case Commands.goto:
        return gotoCommand(token, this.curFunc);
      case Commands.ifGoto:
        return ifGotoCommand(token, this.curFunc);
      case Commands.function:
        return functionCommand(token);
      case Commands.call:
        this.curFunc = token.arg1 || '';
        return callCommand(token);
      case Commands.return:
        this.curFunc = null;
        return returnCommand();
      default:
        throw new Error('unrecognized token command: ' + token.command);
    }
  };
}
