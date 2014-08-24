#!/usr/bin/env sh

if [ "$1" = "" ] ; then
        echo "usage: $0 version"
        exit 1
fi

version="$1"

echo "$1" > "LAST-VERSION_$1"
cat package.json | sed 's/"version": "\(.*\)"/"version": "'$1'"/' > package.json.draft
rm -f package.json
mv package.json.draft package.json

./push.sh "version $version"

git tag -a "$version" -m "$version"
git push origin --tags
npm publish

