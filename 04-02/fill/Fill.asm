// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// reset
(LOOP)
    @SCREEN
    D=A
    @addr
    M=D  // addr=SCREEN
    @KBD
    D=M
    @BLACK_OUT
    D;JGT  // goto BLACK_OUT if M[KBD] > 0

// paint white
    @color
    D=M
    @LOOP
    D;JEQ  // if color==0, screen is already white, so don't repaint
    @color
    M=0  // color=0 (white)
    @FILL
    0;JMP  // Jump to fill

// paint black
(BLACK_OUT)
    @color
    D=M
    @LOOP
    D+1;JEQ  // if color ==-1, screen is already black, so don't repaint
    @color
    M=-1  // color=-1 (black)

// paint screen
(FILL)
    @addr
    D=M
    @24576  // 16384 + 32*256
    D=D-A
    @LOOP
    D;JGE  // goto LOOP if addr >= 8192

    @color
    D=M
    @addr
    A=M
    M=D  // M[addr]=color
    @addr
    M=M+1  // addr+=1

    @FILL
    0;JMP