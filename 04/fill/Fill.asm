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

(LOOP)
    // Initialize values
    @SCREEN
    D=A
    @pos
    M=D  // pos = SCREEN
    @color
    M=0  // color = white

    @KBD
    D=M  // D = M[KBD]
    @SCREENLOOP
    D;JEQ  // if (M[KBD] == 0) goto SCREENLOOP

    // If Key pressed, change color to black
    @color
    M=-1  // color = black

(SCREENLOOP)
    // Set pixels
    @color
    D=M  // D = color
    @pos
    A=M
    M=D  // M[pos] = color
    @pos
    M=M+1  // pos = pos + 1

    // If (pos < SCREEN + 8192) goto SCREENLOOP
    @8192  // (256 * 32)
    D=A
    @SCREEN
    D=D+A  // D = 8192 + SCREEN
    @pos
    D=M-D  // D = pos - (8192 + SCREEN)
    @SCREENLOOP
    D;JLT  // if (pos < SCREEN + 8192) goto SCREENLOOP

    @LOOP
    0;JMP