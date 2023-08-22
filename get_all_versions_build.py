#this file will serve to get all the versions of the build

import os
import shutil
import git
import requests
import re
import json

#check out the repo of this project

repo = git.Repo(os.getcwd())

print(repo)

repo_url = (
        "https://api.github.com/repos/vliz-be-opsci/rocrate-preview-widget/releases"
    )

os.mkdir("temp")

releases = requests.get(repo_url).json()
for release in releases:
    #print(json.dumps(release, indent=4, sort_keys=True))
    release_url = release["tarball_url"]
    print(release_url)
    
    #download the release into the temp folder
    response = requests.get(release_url, stream=True)
    with open("temp.tar.gz", "wb") as handle:
        for data in response.iter_content():
            handle.write(data)

    #extract the tar.gz file
    shutil.unpack_archive("temp.tar.gz", "temp/"+release["name"],"gztar")
    
    #go into the folder that was created
    os.chdir("temp/"+release["name"])
    #list the folder in this folder and cd into it 
    for folder in os.listdir():
        if os.path.isdir(folder):
            name_folder = folder
            #check if there is a folder in this folder that is called static
            for folder2 in os.listdir(folder):
                if folder2 == "static":
                    #if there is a folder called static, copy the contents to ./build/{release_name}/static
                    #check if foldre exists first 
                    if not os.path.exists("../../build/"+release["name"]+"/static"):
                        os.makedirs("../../build/"+release["name"]+"/static")
                    #copy the contents recursively
                    shutil.copytree(folder+"/static", "../../build/"+release["name"]+"/static", dirs_exist_ok=True)
                    
#clean up the temp folder
os.chdir("../..")
shutil.rmtree("temp")
#remove the temp.tar.gz file
os.remove("temp.tar.gz")