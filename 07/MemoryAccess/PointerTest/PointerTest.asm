// 8: push constant 3030
@3030
D=A
@SP
A=M
M=D
@SP
M=M+1

// 9: pop pointer 0
@SP
M=M-1
A=M
D=M
@3
M=D

// 10: push constant 3040
@3040
D=A
@SP
A=M
M=D
@SP
M=M+1

// 11: pop pointer 1
@SP
M=M-1
A=M
D=M
@4
M=D

// 12: push constant 32
@32
D=A
@SP
A=M
M=D
@SP
M=M+1

// 13: pop this 2
@SP
M=M-1
A=M
D=M
@R13
M=D
@3
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

// 14: push constant 46
@46
D=A
@SP
A=M
M=D
@SP
M=M+1

// 15: pop that 6
@SP
M=M-1
A=M
D=M
@R13
M=D
@4
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

// 16: push pointer 0
@3
D=M
@SP
A=M
M=D
@SP
M=M+1

// 17: push pointer 1
@4
D=M
@SP
A=M
M=D
@SP
M=M+1

// 18: add
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

// 19: push this 2
@3
D=M
@2
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 20: sub
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

// 21: push that 6
@4
D=M
@6
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 22: add
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

