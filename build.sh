#!/usr/bin/env bash

# Written by Erik Poupaert, Cambodia
# (c) 2014
# Licensed under the LGPL

# Browserifies and uglifies the files for the web browser
# Builds the documentation in README.md

## get config

source ./config.sh

## add web support

browserify $browserMainFile -o browser-support/$project-bundle.js
uglifyjs browser-support/$project-bundle.js -o browser-support/$project-bundle.min.js

## build API documentation

markDownLevelChars=$(printf '%.s#'  $(seq 1 $newMarkDownLevelForFunctionHeadings))

for apiFile in $apiFiles; do
        basename=$(basename $apiFile .js)
        markdox $apiFile -o doc/api/$basename.draft.md
        sed -e 's/^### Params:/_Params_/' -e 's/^##[^#]/'$markDownLevelChars' /'  doc/api/$basename.draft.md > \
               doc/api/$basename.md
        rm -f doc/api/$basename.draft.md
done

## create first draft of README.md

for f in $(ls doc/readme/*.md); do
        cat $f >> README.draft.1.md
done

## add external files

markdown-pp.py README.draft.1.md README.draft.2.md
rm -f README.draft.1.md

## replace ../index.js and ../../index.js by rpc-websocket

sed -e 's/\.\.\/\.\.\/index.js/'$project'/' \
        -e 's/\.\.\/index.js/'$project'/' README.draft.2.md > \
       README.md
rm -f README.draft.2.md

