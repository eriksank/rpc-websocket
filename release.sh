#!/usr/bin/env sh

# Written by Erik Poupaert, Cambodia
# (c) 2014
# Licensed under the LGPL

# creates a new version, updates package.json for this version, creates a git tag for this version,
# updates the LAST-VERSION file 
# and pushes the source to both git and npm


if [ "$1" = "" ] ; then
        echo "usage: $0 version commit-message"
        exit 1
fi

if [ "$2" = "" ] ; then
        echo "usage: $0 version commit-message"
        exit 1
fi

version="$1"
message="$2"

rm -f LAST-VERSION_*
echo "changes to previous version: $message" > "LAST-VERSION_$version"

cat package.json | sed 's/"version": "\(.*\)"/"version": "'$version'"/' > package.json.draft
rm -f package.json
mv package.json.draft package.json

./push.sh "version $version: $message"

git tag -a "$version" -m "$version: $message"
git push origin --tags
npm publish

