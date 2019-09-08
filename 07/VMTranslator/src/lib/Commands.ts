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
      'M=-1',
      `@${label}`,
      `D;${condition}`,
      '@SP',
      'A=M',
      'M=0',
      `(${label})`,
      ...incStack
    ].join('\n');
  };
})();

const memMap = {
  [Segments.constant]: 9,
  [Segments.local]: 1,
  [Segments.argument]: 2,
  [Segments.this]: 3,
  [Segments.that]: 4,
  [Segments.pointer]: 3,
  [Segments.temp]: 5
};

export const pushCommand = ({ segment, index, baseName }: Token) => {
  if (index === undefined) {
    throw new Error('push command with invalid index: ' + index);
  }
  switch (segment) {
    case Segments.constant:
      return [`@${index}`, 'D=A', '@SP', 'A=M', 'M=D', ...incStack].join('\n');
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
        '@SP',
        'A=M',
        'M=D',
        ...incStack
      ].join('\n');
    }
    case Segments.pointer:
    case Segments.temp: {
      return [
        `@${memMap[segment] + index}`,
        'D=M',
        '@SP',
        'A=M',
        'M=D',
        ...incStack
      ].join('\n');
    }
    case Segments.static: {
      return [
        `@${baseName}.${index}`,
        'D=M',
        '@SP',
        'A=M',
        'M=D',
        ...incStack
      ].join('\n');
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
        '@SP',
        'M=M-1',
        'A=M',
        'D=M',
        '@R13',
        'M=D',
        `@${memMap[segment]}`,
        'D=M',
        `@${index}`,
        'D=A+D', // addr pop to
        '@R14',
        'M=D',
        '@R13',
        'D=M',
        '@R14',
        'A=M',
        'M=D'
      ].join('\n');
    }
    case Segments.pointer:
    case Segments.temp: {
      return [
        '@SP',
        'M=M-1',
        'A=M',
        'D=M',
        `@${memMap[segment] + index}`,
        'M=D'
      ].join('\n');
    }
    case Segments.static: {
      return [
        '@SP',
        'M=M-1',
        'A=M',
        'D=M',
        `@${baseName}.${index}`,
        'M=D'
      ].join('\n');
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
