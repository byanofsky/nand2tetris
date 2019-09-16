import Token from './Token';

enum Segments {
  constant = 'constant',
  local = 'local', //1
  argument = 'argument', //2
  this = 'this', //3
  that = 'that', //4
  pointer = 'pointer', //3-4
  temp = 'temp', //5-12
  static = 'static' //@xxx.i
}

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
// TODO: Pass arg to push as value to store
const push = ['@SP', 'A=M', 'M=D', ...incStack];

/**
 * Invokes command on top 2 values in stack.
 * 1st arg is 2nd value in stack, 2nd arg is 1st value in stack.
 * eg, M[SP-2] - M[SP-1]
 */
const createBinaryCommand = (command: string) => [
  ...pop,
  'D=M',
  ...pop,
  `M=M${command}D`,
  ...incStack
];

/**
 * Invokes command on top value in stack.
 */
const createUnaryCommand = (command: string) => [
  ...pop,
  `M=${command}M`,
  ...incStack
];

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
    ];
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

export const pushCommand = (token: Token) => {
  const baseName = token.getBaseName();
  const arg1 = token.getArg1();
  const arg2 = token.getArg2();
  if (arg2 === undefined) {
    throw new Error('push command with invalid index: ' + arg2);
  }
  const index = Number(arg2);
  if (Number.isNaN(index)) {
    throw new Error('arg2 value must be a number: ' + arg2);
  }
  switch (arg1) {
    case Segments.constant:
      return [`@${index}`, 'D=A', ...push];
    case Segments.local:
    case Segments.argument:
    case Segments.this:
    case Segments.that: {
      return [`@${memMap[arg1]}`, 'D=M', `@${index}`, 'A=D+A', 'D=M', ...push];
    }
    case Segments.pointer:
    case Segments.temp: {
      return [`@${memMap[arg1] + index}`, 'D=M', ...push];
    }
    case Segments.static: {
      return [`@${baseName}.${index}`, 'D=M', ...push];
    }
    default:
      throw new Error('unrecognized segment: ' + arg1);
  }
};

export const popCommand = (token: Token) => {
  const arg1 = token.getArg1();
  const arg2 = token.getArg2();
  const baseName = token.getBaseName();
  if (arg2 === undefined) {
    throw new Error('push command with invalid index: ' + arg2);
  }
  const index = Number(arg2);
  if (Number.isNaN(index)) {
    throw new Error('arg2 value must be a number: ' + arg2);
  }

  switch (arg1) {
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
        `@${memMap[arg1]}`,
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
      ];
    }
    case Segments.pointer:
    case Segments.temp: {
      return [...pop, 'D=M', `@${memMap[arg1] + index}`, 'M=D'];
    }
    case Segments.static: {
      return [...pop, 'D=M', `@${baseName}.${index}`, 'M=D'];
    }
    default:
      throw new Error('unrecognized segment: ' + arg1);
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

export const labelCommand = (token: Token, curFunc: null | string) => [
  `(${curFunc}$${token.getArg1()})`
];

const goto = (label: string) => [`@${label}`, '0;JMP'];

export const gotoCommand = (token: Token, curFunc: null | string) =>
  goto(`${curFunc}$${token.getArg1()}`);

export const ifGotoCommand = (token: Token, curFunc: null | string) => [
  ...pop, // pop topmost value
  'D=M',
  `@${curFunc}$${token.getArg1()}`,
  'D;JNE' // Jump if D != 0
];

const initLocalVar = ['D=0', ...push];

export const functionCommand = (token: Token) => {
  const result = [`(${token.getArg1()})`];
  for (let i = 0; i < token.getArg2(); i++) {
    result.push(...initLocalVar);
  }
  return result;
};

const call = (() => {
  let i = -1;
  return (f: string, n: number) => {
    i++;
    const returnAddressLabel = `${f}$RA${i}`;
    return [
      `@${returnAddressLabel}`,
      'D=A',
      ...push,
      '@LCL',
      'D=M',
      ...push,
      '@ARG',
      'D=M',
      ...push,
      '@THIS',
      'D=M',
      ...push,
      '@THAT',
      'D=M',
      ...push,
      `@${Number(n) + 5}`,
      'D=A',
      '@SP',
      'D=M-D',
      '@ARG',
      'M=D',
      '@SP',
      'D=M',
      '@LCL',
      'M=D',
      // TODO: Extract goto
      ...goto(f || ''),
      `(${returnAddressLabel})`
    ];
  };
})();

export const callCommand = (token: Token) =>
  call(token.getArg1(), token.getArg2());

export const returnCommand = () => [
  '@LCL',
  'D=M',
  '@R13',
  'M=D', // FRAME=LCL
  '@5',
  'D=A',
  '@R13',
  'A=M-D',
  'D=M',
  '@R14',
  'M=D', // RET=*(FRAME-5),
  ...pop,
  'D=M',
  '@ARG',
  'A=M',
  'M=D', // *ARG=pop()
  '@ARG',
  'D=M',
  '@SP',
  'M=D+1', // SP=ARG+1
  '@1',
  'D=A', // D=1
  '@R13',
  'A=M-D', // A=FRAME-1
  'D=M', // D=*(FRAME-1)
  '@THAT',
  'M=D', // THAT=*(FRAME-1)
  '@2',
  'D=A', // D=2
  '@R13',
  'A=M-D', // A=FRAME-2
  'D=M', // D=*(FRAME-2)
  '@THIS',
  'M=D', // THIS=*(FRAME-2)
  '@3',
  'D=A', // D=3
  '@R13',
  'A=M-D', // A=FRAME-3
  'D=M', // D=*(FRAME-3)
  '@ARG',
  'M=D', // ARG=*(FRAME-3)
  '@4',
  'D=A', // D=4
  '@R13',
  'A=M-D', // A=FRAME-4
  'D=M', // D=*(FRAME-4)
  '@LCL',
  'M=D', // LCL=*(FRAME-4)
  '@R14',
  'A=M', // A=RET
  '0;JMP' // goto RET
];

export const initCommand = [
  '@256',
  'D=A',
  '@SP',
  'M=D',
  ...call('Sys.init', 0)
];
