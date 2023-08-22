# predeploy.sh

# remove the version hash from our base javascript file for a stable URL
find build/static/js -name "main.*.js" -exec mv '{}' build/static/js/main.js \;
# do the same for the CSS file
find build/static/css -name "main.*.css" -exec mv '{}' build/static/css/main.css \;

# move all the files from ./themes into ./static/css
cp -r ./themes/* ./build/static/css
# delete all folders that aren't ./static in ./build folder => don't delete the folder ./build
rm -rf "./build/audio"
rm -rf "./build/code"
rm -rf "./build/compressed_files"
rm -rf "./build/data"
rm -rf "./build/images"
rm -rf "./build/microsoft"
rm -rf "./build/pdf"
rm -rf "./build/video"