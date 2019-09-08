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

export const pushCommand = ({ segment, index }: Token) => {
  let value;
  switch (segment) {
    case Segments.constant:
      value = index;
      break;
    default:
      throw new Error('unrecognized segment: ' + segment);
  }
  return [`@${value}`, 'D=A', '@SP', 'A=M', 'M=D', ...incStack].join('\n');
};

export const popCommand = ({ segment, index }: Token) => {
  switch (segment) {
    case Segments.constant:
      throw new Error('cannot pop for segment: ' + Segments.constant);
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
