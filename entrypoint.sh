#!/bin/sh -l
pwd
ls -a
echo "listing all the files that are in the ../.. directory"
cd ../..
pwd
ls -a
#echo the env variable inputs.crate_path from the actions.yml file
echo "crate_path is" $1
#make a .env file with the crate_path variable
echo "REACT_APP_CRATE=$1" > .env
#echo cat of the .env file
cat .env
echo "making tocopy dir in src"
mkdir ./src/topcopy
if [ -d "/src/topcopy" ] 
then
    echo "Directory /src/topcopy exists." 
else
    echo "Error: Directory /src/topcopy does not exists."
fi
echo "copying everything in current dir into tocopy"
rsync --recursive --progress --exclude=".* unicornpages/*" ./github/workspace/* ./src/tocopy
echo "installing dependencies for building react app"
npm install
echo "npm run build"
npm run build
echo "copying over scr files to build folder"
cp ./src/tocopy/* ./build/ -r
echo "renaming index.html in the build folder to ro-crate-preview.html"
cp ./build/index.html ./build/ro-crate-preview.html
rsync --recursive --progress ./build/* ./github/workspace/unicornpages
ls -a ./github/workspace/unicornpages
