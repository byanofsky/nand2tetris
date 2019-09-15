// 8: function Sys.init 0
(Sys.init)

// 9: push constant 4000	// test THIS and THAT context save
@4000
D=A
@SP
A=M
M=D
@SP
M=M+1

// 10: pop pointer 0
@SP
M=M-1
A=M
D=M
@3
M=D

// 11: push constant 5000
@5000
D=A
@SP
A=M
M=D
@SP
M=M+1

// 12: pop pointer 1
@SP
M=M-1
A=M
D=M
@4
M=D

// 13: call Sys.main 0
@Sys.main$RA0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@5
D=A
@SP
D=M-D
@ARG
M=D
@SP
D=M
@LCL
M=D
@Sys.main
0;JMP
(Sys.main$RA0)

// 14: pop temp 1
@SP
M=M-1
A=M
D=M
@6
M=D

// 15: label LOOP
(Sys.main$LOOP)

// 16: goto LOOP
@Sys.main$LOOP
0;JMP

// 26: function Sys.main 5
(Sys.main)
D=0
@SP
A=M
M=D
@SP
M=M+1
D=0
@SP
A=M
M=D
@SP
M=M+1
D=0
@SP
A=M
M=D
@SP
M=M+1
D=0
@SP
A=M
M=D
@SP
M=M+1
D=0
@SP
A=M
M=D
@SP
M=M+1

// 27: push constant 4001
@4001
D=A
@SP
A=M
M=D
@SP
M=M+1

// 28: pop pointer 0
@SP
M=M-1
A=M
D=M
@3
M=D

// 29: push constant 5001
@5001
D=A
@SP
A=M
M=D
@SP
M=M+1

// 30: pop pointer 1
@SP
M=M-1
A=M
D=M
@4
M=D

// 31: push constant 200
@200
D=A
@SP
A=M
M=D
@SP
M=M+1

// 32: pop local 1
@SP
M=M-1
A=M
D=M
@R13
M=D
@LCL
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

// 33: push constant 40
@40
D=A
@SP
A=M
M=D
@SP
M=M+1

// 34: pop local 2
@SP
M=M-1
A=M
D=M
@R13
M=D
@LCL
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

// 35: push constant 6
@6
D=A
@SP
A=M
M=D
@SP
M=M+1

// 36: pop local 3
@SP
M=M-1
A=M
D=M
@R13
M=D
@LCL
D=M
@3
D=A+D
@R14
M=D
@R13
D=M
@R14
A=M
M=D

// 37: push constant 123
@123
D=A
@SP
A=M
M=D
@SP
M=M+1

// 38: call Sys.add12 1
@Sys.add12$RA1
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@6
D=A
@SP
D=M-D
@ARG
M=D
@SP
D=M
@LCL
M=D
@Sys.add12
0;JMP
(Sys.add12$RA1)

// 39: pop temp 0
@SP
M=M-1
A=M
D=M
@5
M=D

// 40: push local 0
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

// 41: push local 1
@LCL
D=M
@1
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 42: push local 2
@LCL
D=M
@2
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 43: push local 3
@LCL
D=M
@3
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 44: push local 4
@LCL
D=M
@4
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 45: add
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

// 46: add
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

// 47: add
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

// 48: add
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

// 49: return
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M-D
D=M
@R14
M=D
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
@ARG
D=M
@SP
M=D+1
@1
D=A
@R13
A=M-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M-D
D=M
@LCL
M=D
@R14
A=M
0;JMP

// 55: function Sys.add12 0
(Sys.add12)

// 56: push constant 4002
@4002
D=A
@SP
A=M
M=D
@SP
M=M+1

// 57: pop pointer 0
@SP
M=M-1
A=M
D=M
@3
M=D

// 58: push constant 5002
@5002
D=A
@SP
A=M
M=D
@SP
M=M+1

// 59: pop pointer 1
@SP
M=M-1
A=M
D=M
@4
M=D

// 60: push argument 0
@ARG
D=M
@0
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 61: push constant 12
@12
D=A
@SP
A=M
M=D
@SP
M=M+1

// 62: add
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

// 63: return
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M-D
D=M
@R14
M=D
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
@ARG
D=M
@SP
M=D+1
@1
D=A
@R13
A=M-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M-D
D=M
@LCL
M=D
@R14
A=M
0;JMP

