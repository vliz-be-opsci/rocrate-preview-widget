#this file will serve to get all the versions of the build

import os
import shutil
import git
import requests
import re

#check out the repo of this project

repo = git.Repo(os.getcwd())

print(repo)
#releases
releases = repo.tags
print(releases)