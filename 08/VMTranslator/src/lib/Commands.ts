import Token, { Segments } from './Token';

/**
 * Increments stack pointer.
 */
const incStack = ['@SP', 'M=M+1'];

/**
 * Pop value at top of stack.
 * End state is A=@SP-1, and value at top of stack can be referenced by M
 */
const pop = ['@SP', 'M=M-1', 'A=M'];

/**
 * Push value stored in D to top of stack and increment stack.
 * `*SP=D, SP++`
 */
const push = ['@SP', 'A=M', 'M=D', ...incStack];

/**
 * Invokes command on top 2 values in stack.
 * 1st arg is 2nd value in stack, 2nd arg is 1st value in stack.
 * eg, M[SP-2] - M[SP-1]
 */
const createBinaryCommand = (command: string) =>
  [...pop, 'D=M', ...pop, `M=M${command}D`, ...incStack].join('\n');

/**
 * Invokes command on top value in stack.
 */
const createUnaryCommand = (command: string) =>
  [...pop, `M=${command}M`, ...incStack].join('\n');

const createConditionCommand = (() => {
  let i = 0;
  return (condition: 'JEQ' | 'JGT' | 'JLT') => {
    const label = `L${i++}`;
    return [
      ...pop,
      'D=M',
      ...pop,
      'D=M-D',
      '@SP',
      'A=M',
      'M=-1', // *SP=true
      `@${label}`,
      `D;${condition}`,
      '@SP',
      'A=M',
      'M=0', // if not condition, *SP=false
      `(${label})`,
      ...incStack
    ].join('\n');
  };
})();

const memMap = {
  [Segments.local]: 'LCL',
  [Segments.argument]: 'ARG',
  [Segments.this]: 'THIS',
  [Segments.that]: 'THAT',
  [Segments.pointer]: 3,
  [Segments.temp]: 5
};

export const pushCommand = ({ segment, index, baseName }: Token) => {
  if (index === undefined) {
    throw new Error('push command with invalid index: ' + index);
  }
  switch (segment) {
    case Segments.constant:
      return [`@${index}`, 'D=A', ...push].join('\n');
    case Segments.local:
    case Segments.argument:
    case Segments.this:
    case Segments.that: {
      return [
        `@${memMap[segment]}`,
        'D=M',
        `@${index}`,
        'A=D+A',
        'D=M',
        ...push
      ].join('\n');
    }
    case Segments.pointer:
    case Segments.temp: {
      return [`@${memMap[segment] + index}`, 'D=M', ...push].join('\n');
    }
    case Segments.static: {
      return [`@${baseName}.${index}`, 'D=M', ...push].join('\n');
    }
    default:
      throw new Error('unrecognized segment: ' + segment);
  }
};

export const popCommand = ({ segment, index, baseName }: Token) => {
  if (index === undefined) {
    throw new Error('push command with invalid index: ' + index);
  }

  switch (segment) {
    case Segments.constant:
      throw new Error('cannot pop for segment: ' + Segments.constant);
    case Segments.local:
    case Segments.argument:
    case Segments.this:
    case Segments.that: {
      return [
        ...pop,
        'D=M',
        '@R13',
        'M=D', // R13=*SP, stores topmost stack value at R13
        `@${memMap[segment]}`,
        'D=M',
        `@${index}`,
        'D=A+D',
        '@R14',
        'M=D', // R14=addr, stores address to pop to at R14
        '@R13',
        'D=M',
        '@R14',
        'A=M',
        'M=D' // *R14=R13
      ].join('\n');
    }
    case Segments.pointer:
    case Segments.temp: {
      return [...pop, 'D=M', `@${memMap[segment] + index}`, 'M=D'].join('\n');
    }
    case Segments.static: {
      return [...pop, 'D=M', `@${baseName}.${index}`, 'M=D'].join('\n');
    }
    default:
      throw new Error('unrecognized segment: ' + segment);
  }
};

export const addCommand = () => createBinaryCommand('+');

export const subCommand = () => createBinaryCommand('-');

export const andCommand = () => createBinaryCommand('&');

export const orCommand = () => createBinaryCommand('|');

export const negCommand = () => createUnaryCommand('-');

export const notCommand = () => createUnaryCommand('!');

export const eqCommand = () => createConditionCommand('JEQ');

export const gtCommand = () => createConditionCommand('JGT');

export const ltCommand = () => createConditionCommand('JLT');

export const labelCommand = (token: Token) => `(${token.segment})`;

export const gotoCommond = (token: Token) =>
  [`@${token.segment}`, '0;JMP'].join('\n');

export const ifGotoCommand = (token: Token) =>
  [
    ...pop, // pop topmost value
    'D=M',
    `@${token.segment}`,
    'D;JNE' // Jump if D != 0
  ].join('\n');
