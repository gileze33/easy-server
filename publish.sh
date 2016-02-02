#!/bin/sh

set -e

npm run build

npm publish

cd dev

./publish.sh
