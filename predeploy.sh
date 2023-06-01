# predeploy.sh

# remove the version hash from our base javascript file for a stable URL
find build/static/js -name "main.*.js" -exec mv '{}' build/static/js/main.js \;
# do the same for the CSS file
find build/static/css -name "main.*.css" -exec mv '{}' build/static/css/main.css \;

# move all the files from ./themes into ./static/css
cp -r ./themes/* ./build/static/css