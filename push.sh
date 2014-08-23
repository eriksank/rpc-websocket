#!/usr/bin/env sh

if [ "$1" = "" ] ; then
        echo "usage: $0 commit-message"
        exit 1
fi

message="$1"

./build.sh
git add -A .
git commit -m "$message"
git push

