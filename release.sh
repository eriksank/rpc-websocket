#!/usr/bin/env sh

# Written by Erik Poupaert, Cambodia
# (c) 2014
# Licensed under the LGPL

# creates a new version, updates package.json for this version, creates a git tag for this version,
# updates the LAST-VERSION file 
# and pushes the source to both git and npm

if [ "$1" = "" ] ; then
        echo "usage: $0 version"
        exit 1
fi

version="$1"

rm -f LAST-VERSION_*
echo "$1" > "LAST-VERSION_$1"

cat package.json | sed 's/"version": "\(.*\)"/"version": "'$1'"/' > package.json.draft
rm -f package.json
mv package.json.draft package.json

./push.sh "version $version"

git tag -a "$version" -m "$version"
git push origin --tags
npm publish

