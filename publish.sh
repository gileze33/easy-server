#!/bin/sh

set -e

npm publish

cd dev

./publish.sh
