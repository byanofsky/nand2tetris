// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

    @n
    M=0  // n = 0
    @R2
    M=0  // M[R2] = 0

(LOOP)
    @n
    D=M  // D = n
    @R1
    D=D-M  // D = n - M[R1]
    @END
    D;JGE  // if (n > M[R1]) goto END

    @R0
    D=M
    @R2
    M=M+D  // M[R2] = M[R2] + M[R0] 
    @n
    M=M+1  // n = n + 1

    @LOOP
    0;JMP

(END)
    @END
    0;JMP
