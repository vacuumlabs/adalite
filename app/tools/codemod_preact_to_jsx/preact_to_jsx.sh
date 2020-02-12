#!/bin/bash

if [ "$#" -eq  "0" ]; then
  echo "Missing files"
  echo "Usage: $0 file1 ..."
  exit 1
fi

FILES=$@
if [[ $(git diff --stat) != '' ]]; then
  echo 'git is dirty, aborting!'
  exit 1
else
  yarn install
  node node_modules/jscodeshift/bin/jscodeshift.js --parser ts -t preact-to-jsx.js $FILES
  (cd ../../.. && yarn fix)
  git add $FILES
  git commit -m "[codemod] Preact->react automatic conversion"
fi
