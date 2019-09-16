@256
D=A
@SP
M=D
@Sys.init$RA0
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
@Sys.init
0;JMP
(Sys.init$RA0)

// 9: push constant 0    
@0
D=A
@SP
A=M
M=D
@SP
M=M+1

// 10: pop local 0         // initializes sum = 0
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

// 11: label LOOP_START
(null$LOOP_START)

// 12: push argument 0    
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

// 13: push local 0
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

// 14: add
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

// 15: pop local 0	        // sum = sum + counter
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

// 16: push argument 0
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

// 17: push constant 1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1

// 18: sub
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

// 19: pop argument 0      // counter--
@SP
M=M-1
A=M
D=M
@R13
M=D
@ARG
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

// 20: push argument 0
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

// 21: if-goto LOOP_START  // If counter > 0, goto LOOP_START
@SP
M=M-1
A=M
D=M
@null$LOOP_START
D;JNE

// 22: push local 0
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

