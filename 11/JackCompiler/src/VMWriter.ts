import { WriteStream } from 'fs';

export enum Segment {
  Const = 'constant',
  Arg = 'arg',
  Local = 'local',
  Static = 'static',
  This = 'this',
  That = 'that',
  Pointer = 'pointer',
  Temp = 'temp'
}

export enum ArithmeticCommand {
  Add = 'add',
  Sub = 'sub',
  Neg = 'neg',
  Eq = 'eq',
  Gt = 'gt',
  Lt = 'lt',
  And = 'and',
  Or = 'or',
  Not = 'not'
}

class VMWriter {
  private outStream: WriteStream;
  private nTabs = 0;

  constructor(outStream: WriteStream) {
    this.outStream = outStream;
  }

  writePush(segment: Segment, index: number) {
    const line = `push ${segment} ${index}`;
    this.write(line);
  }

  writePop(segment: Segment, index: number) {}

  writeArithmetic(command: ArithmeticCommand) {
    this.write(command);
  }

  writeLabel(label: string) {}

  writeGoto(label: string) {}

  writeIf(label: string) {}

  writeCall(name: string, nArgs: number) {
    const line = `call ${name} ${nArgs}`;
    this.write(line);
  }

  writeFunction(name: string, nLocals: number) {
    const line = `function ${name} ${nLocals}`;
    this.write(line);
    this.indent();
  }

  writeReturn() {
    this.write('return');
    this.dedent();
  }

  private write(line: string) {
    // const tabs = '\t'.repeat(this.nTabs);
    // this.outStream.write(`${tabs}${line}\n`);
    this.outStream.write(`${line}\n`);
  }

  private indent() {
    this.nTabs += 1;
  }

  private dedent() {
    this.nTabs -= 1;
  }

  close() {
    this.outStream.end();
  }
}

export default VMWriter;
