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

  writeFunction(name: string, nLocals: number) {}

  writeReturn() {}

  close() {}
}

export default VMWriter;
