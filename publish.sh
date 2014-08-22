#!/usr/bin/env sh

./build.sh
git add -A .
git commit -m "$1"
git push

