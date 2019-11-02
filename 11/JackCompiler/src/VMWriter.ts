import { WriteStream } from 'fs';

enum Segment {
  Const = 'const',
  Arg = 'arg',
  Local = 'local',
  Static = 'static',
  This = 'this',
  That = 'that',
  Pointer = 'pointer',
  Temp = 'temp'
}

enum ArithmeticCommand {
  Add,
  Sub,
  Neg,
  Eq,
  Gt,
  Lt,
  And,
  Or,
  Not
}

class VMWriter {
  private outStream: WriteStream;
  private nTabs = 0;

  constructor(outStream: WriteStream) {
    this.outStream = outStream;
  }

  writePush(segment: Segment, index: number) {}

  writePop(segment: Segment, index: number) {}

  writeArithmetic(command: ArithmeticCommand) {}

  writeLabel(label: string) {}

  writeGoto(label: string) {}

  writeIf(label: string) {}

  writeCall(name: string, nArgs: number) {}

  writeFunction(name: string, nLocals: number) {
    const line = `function ${name} ${nLocals}`;
    this.write(line);
    this.indent();
  }

  writeReturn() {}

  private write(line: string) {
    const tabs = ' '.repeat(this.nTabs);
    this.outStream.write(`${tabs}${line}\n`);
  }

  private indent() {
    this.nTabs += 1;
  }

  close() {
    this.outStream.end();
  }
}

export default VMWriter;
