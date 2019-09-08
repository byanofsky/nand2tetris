// 7: push constant 10
@10
D=A
@SP
A=M
M=D
@SP
M=M+1

// 8: pop local 0
@SP
M=M-1
A=M
D=M
@R13
M=D
@LCL
D=M
@0
D=A+D
@R14
M=D
@R13
D=M
@R14
A=M
M=D

// 9: push constant 21
@21
D=A
@SP
A=M
M=D
@SP
M=M+1

// 10: push constant 22
@22
D=A
@SP
A=M
M=D
@SP
M=M+1

// 11: pop argument 2
@SP
M=M-1
A=M
D=M
@R13
M=D
@ARG
D=M
@2
D=A+D
@R14
M=D
@R13
D=M
@R14
A=M
M=D

// 12: pop argument 1
@SP
M=M-1
A=M
D=M
@R13
M=D
@ARG
D=M
@1
D=A+D
@R14
M=D
@R13
D=M
@R14
A=M
M=D

// 13: push constant 36
@36
D=A
@SP
A=M
M=D
@SP
M=M+1

// 14: pop this 6
@SP
M=M-1
A=M
D=M
@R13
M=D
@THIS
D=M
@6
D=A+D
@R14
M=D
@R13
D=M
@R14
A=M
M=D

// 15: push constant 42
@42
D=A
@SP
A=M
M=D
@SP
M=M+1

// 16: push constant 45
@45
D=A
@SP
A=M
M=D
@SP
M=M+1

// 17: pop that 5
@SP
M=M-1
A=M
D=M
@R13
M=D
@THAT
D=M
@5
D=A+D
@R14
M=D
@R13
D=M
@R14
A=M
M=D

// 18: pop that 2
@SP
M=M-1
A=M
D=M
@R13
M=D
@THAT
D=M
@2
D=A+D
@R14
M=D
@R13
D=M
@R14
A=M
M=D

// 19: push constant 510
@510
D=A
@SP
A=M
M=D
@SP
M=M+1

// 20: pop temp 6
@SP
M=M-1
A=M
D=M
@11
M=D

// 21: push local 0
@LCL
D=M
@0
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 22: push that 5
@THAT
D=M
@5
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 23: add
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M+D
@SP
M=M+1

// 24: push argument 1
@ARG
D=M
@1
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 25: sub
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M-D
@SP
M=M+1

// 26: push this 6
@THIS
D=M
@6
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 27: push this 6
@THIS
D=M
@6
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 28: add
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M+D
@SP
M=M+1

// 29: sub
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M-D
@SP
M=M+1

// 30: push temp 6
@11
D=M
@SP
A=M
M=D
@SP
M=M+1

// 31: add
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M+D
@SP
M=M+1

