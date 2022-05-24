# Github Action to publish rocrate objects as Github Pages
This takes the [files files from research object](https://www.researchobject.org/) and creates an HTML page from them. This allows the human readable preview file to be hosted as an html page, possibly on GH-Pages, and the machine readable json file to be reachable from anywhere. 

## Steps
This action is to be used on git projects that include rocrate files that comply to the [rocrate standard](https://www.researchobject.org/ro-crate/1.0/):

  - The project *must* include a metadata file named "ro-crate-metadata.jsonld"
  - The project *may* include a human-readable preview file that *must* be called "ro-crate-preview.html"
  - In this first iteration of the action it is assumed that the preview file does exist. In future versions a fallback process could create a standard preview file using the metadata file. 
   
Gitlab pages routes traffic to an "index.html" file by default and is incapable of handling content negotiation. Due to these (and other) GH-Pages limitations the following steps are taken:
  
  - Some preperation steps are handled by other actions
  - A symbolic link is created that maps an "index.html" file to "ro-crate-preview.html"
  - A symbolic link is created that maps "ro-crate-metadata.json" to "ro-crate-metadata.jsonld"
  - Some publishing and cleanup steps are handled by other actions

## Example

Below is an example yaml file that once copied to "/.github/workflows/rocrate_to_pages.yml" would trigger the publishing to github pages action on push to the "main" branch.

```yml

name: RoCrate to GitHub Pages
on:
  push:
    branches:
      - main  # Set a branch name to trigger deployment
  pull_request:
jobs:
  deploy:
    runs-on: ubuntu-20.04
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod
          
      - name: Setup Python
        uses: actions/setup-python@v3
        with: 
          python-version: '3.x'

      - name: Build Pages
        uses: vliz-be-opsci/rocrate-to-pages@v0

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        if: ${{ github.ref == 'refs/heads/main' }}
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./

```

## Known Issues

There seems to be an issue with the first commit not triggering the github controlled gh-pages runner. [Decribed here](https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-first-deployment-with-github_token) and [here](https://github.com/peaceiris/actions-gh-pages/issues/9). One method to work around this is to commit/push to gh-pages branch on a system that has SSH access or to supply an SSH deploy key to the peaceiris/actions-gh-pages@v3 step.

The result of this bug is that the a user with admin priviledges must FIRST commit to the gh-pages branch before a gh-pages publication will happen. 

The following would work to create an empty gh-pages branch that has been touched by an admin user:

```
git checkout gh-pages
git push origin --delete gh-pages
git push origin
git checkout main
```