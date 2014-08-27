#!/usr/bin/env sh

# Written by Erik Poupaert, Cambodia
# (c) 2014
# Licensed under the LGPL

# Builds, commits and pushes the current branch to git

if [ "$1" = "" ] ; then
        echo "usage: $0 commit-message"
        exit 1
fi

mocha

message="$1"

./build.sh
git add -A .
git commit -m "$message"
git push

