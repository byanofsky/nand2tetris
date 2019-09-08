// 8: push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1

// 9: push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1

// 10: eq
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L0
D;JEQ
@SP
A=M
M=0
(L0)
@SP
M=M+1

// 11: push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1

// 12: push constant 16
@16
D=A
@SP
A=M
M=D
@SP
M=M+1

// 13: eq
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L1
D;JEQ
@SP
A=M
M=0
(L1)
@SP
M=M+1

// 14: push constant 16
@16
D=A
@SP
A=M
M=D
@SP
M=M+1

// 15: push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1

// 16: eq
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L2
D;JEQ
@SP
A=M
M=0
(L2)
@SP
M=M+1

// 17: push constant 892
@892
D=A
@SP
A=M
M=D
@SP
M=M+1

// 18: push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1

// 19: lt
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L3
D;JLT
@SP
A=M
M=0
(L3)
@SP
M=M+1

// 20: push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1

// 21: push constant 892
@892
D=A
@SP
A=M
M=D
@SP
M=M+1

// 22: lt
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L4
D;JLT
@SP
A=M
M=0
(L4)
@SP
M=M+1

// 23: push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1

// 24: push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1

// 25: lt
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L5
D;JLT
@SP
A=M
M=0
(L5)
@SP
M=M+1

// 26: push constant 32767
@32767
D=A
@SP
A=M
M=D
@SP
M=M+1

// 27: push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1

// 28: gt
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L6
D;JGT
@SP
A=M
M=0
(L6)
@SP
M=M+1

// 29: push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1

// 30: push constant 32767
@32767
D=A
@SP
A=M
M=D
@SP
M=M+1

// 31: gt
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L7
D;JGT
@SP
A=M
M=0
(L7)
@SP
M=M+1

// 32: push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1

// 33: push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1

// 34: gt
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
D=M-D
@SP
A=M
M=-1
@L8
D;JGT
@SP
A=M
M=0
(L8)
@SP
M=M+1

// 35: push constant 57
@57
D=A
@SP
A=M
M=D
@SP
M=M+1

// 36: push constant 31
@31
D=A
@SP
A=M
M=D
@SP
M=M+1

// 37: push constant 53
@53
D=A
@SP
A=M
M=D
@SP
M=M+1

// 38: add
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

// 39: push constant 112
@112
D=A
@SP
A=M
M=D
@SP
M=M+1

// 40: sub
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

// 41: neg
@SP
M=M-1
A=M
M=-M
@SP
M=M+1

// 42: and
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M&D
@SP
M=M+1

// 43: push constant 82
@82
D=A
@SP
A=M
M=D
@SP
M=M+1

// 44: or
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M|D
@SP
M=M+1

// 45: not
@SP
M=M-1
A=M
M=!M
@SP
M=M+1

