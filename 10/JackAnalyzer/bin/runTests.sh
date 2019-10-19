#!/bin/sh

test() {
  dir=$1
  shift
  files=$@

  echo "Start Compilation: $dir"
  npm run compile -- ./test/$dir
  if [[ $? -ne 0 ]]; then
    echo "Compilation Failed: $dir"
    exit 1
  fi
  echo "Compilation Succeeded: $dir"
  echo "\n\n"
  
  for file in $files; do
    this=./test/$dir/$file
    that=./test/"$dir"Expected/$file
    echo "Start Test: comparing $this to $that"
    ./../../tools/TextComparer.sh $this $that
    if [[ $? -ne 0 ]]; then
      echo "Test Failed: comparing $this to $that"
      exit 1
    fi
    echo "Test Completed"
    echo "\n"
  done
  echo "\n\n"
}

echo "Starting Build"
npm run build
if [[ $? -ne 0 ]]; then
  echo "Build Failed"
  exit 1
fi
echo "Build Succeeded"
echo "\n\n"


ExpressionLessSquareFiles=(Main.xml Square.xml SquareGame.xml)
test ExpressionLessSquare "${ExpressionLessSquareFiles[@]}"

SquareFiles=(Main.xml Square.xml SquareGame.xml)
test Square "${SquareFiles[@]}"

ArrayTestFiles=(Main.xml)
test ArrayTest "${ArrayTestFiles[@]}"

echo "All Tests Passed"