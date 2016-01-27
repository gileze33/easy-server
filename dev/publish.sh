#!/bin/sh

set -e

rm ./shared || true
cp -r ../shared ./

npm publish

rm -rf ./shared
ln -s ../shared ./
