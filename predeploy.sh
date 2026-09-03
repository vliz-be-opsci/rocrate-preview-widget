# predeploy.sh

# create directories if they do not exist
mkdir -p build/static/js build/static/css

# remove the version hash from our base javascript file for a stable URL
find dist/assets -name "index*.js" -exec mv '{}' build/static/js/main.js \;
# do the same for the CSS file
find dist/assets -name "index*.css" -exec mv '{}' build/static/css/main.css \;

# move all the files from ./themes into ./static/css if themes directory exists
if [ -d "./themes" ]; then
    cp -r ./themes/* ./build/static/css
fi

# delete all folders that aren't ./static in ./build folder => don't delete the folder ./build
rm -rf "./build/audio"
rm -rf "./build/code"
rm -rf "./build/compressed_files"
rm -rf "./build/data"
rm -rf "./build/images"
rm -rf "./build/microsoft"
rm -rf "./build/pdf"
rm -rf "./build/video"

# log into the venv if it exists
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
elif [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

# install the requirements
# pip install -r requirements.txt
# run the python script
# python ./get_all_versions_build.py

#remove the temp folder recursively
rm -rf "./temp"
#remove the temp.tar.gz file
rm -rf "./temp.tar.gz"