#!/bin/sh -l

echo "Hello $1"
time=$(date)
echo "::set-output name=time::$time"
echo "cd into the right folder"
cd ../../
echo "installing dependencies for building react app"
npm install
echo "npm run build"
npm run build
echo "copying over scr files to build folder"
cp ./scr/tocopy/* ./build/ -r
echo "renaming index.html in the build folder to ro-crate-preview.html"
mv ./build/index.html ./build/ro-crate-preview.html
