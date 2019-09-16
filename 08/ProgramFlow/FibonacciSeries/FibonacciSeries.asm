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

// 11: push argument 1
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

// 12: pop pointer 1           // that = argument[1]
@SP
M=M-1
A=M
D=M
@4
M=D

// 14: push constant 0
@0
D=A
@SP
A=M
M=D
@SP
M=M+1

// 15: pop that 0              // first element in the series = 0
@SP
M=M-1
A=M
D=M
@R13
M=D
@THAT
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

// 16: push constant 1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1

// 17: pop that 1              // second element in the series = 1
@SP
M=M-1
A=M
D=M
@R13
M=D
@THAT
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

// 19: push argument 0
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

// 20: push constant 2
@2
D=A
@SP
A=M
M=D
@SP
M=M+1

// 21: sub
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

// 22: pop argument 0          // num_of_elements -= 2 (first 2 elements are set)
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

// 24: label MAIN_LOOP_START
(null$MAIN_LOOP_START)

// 26: push argument 0
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

// 27: if-goto COMPUTE_ELEMENT // if num_of_elements > 0, goto COMPUTE_ELEMENT
@SP
M=M-1
A=M
D=M
@null$COMPUTE_ELEMENT
D;JNE

// 28: goto END_PROGRAM        // otherwise, goto END_PROGRAM
@null$END_PROGRAM
0;JMP

// 30: label COMPUTE_ELEMENT
(null$COMPUTE_ELEMENT)

// 32: push that 0
@THAT
D=M
@0
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 33: push that 1
@THAT
D=M
@1
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1

// 34: add
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

// 35: pop that 2              // that[2] = that[0] + that[1]
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

// 37: push pointer 1
@4
D=M
@SP
A=M
M=D
@SP
M=M+1

// 38: push constant 1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1

// 39: add
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

// 40: pop pointer 1           // that += 1
@SP
M=M-1
A=M
D=M
@4
M=D

// 42: push argument 0
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

// 43: push constant 1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1

// 44: sub
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

// 45: pop argument 0          // num_of_elements--
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

// 47: goto MAIN_LOOP_START
@null$MAIN_LOOP_START
0;JMP

// 49: label END_PROGRAM
(null$END_PROGRAM)

