#!/bin/sh

set -e

rm ./shared || true
cp -r ../shared ./

node ./merge-package.js

npm publish

rm -rf ./shared
ln -s ../shared ./
