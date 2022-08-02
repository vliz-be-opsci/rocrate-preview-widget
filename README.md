# Github Action to publish rocrate objects as Github Pages
This visualise the [content from a `research object crate`](https://www.researchobject.org/ro-crate/) through a preview-HTML page. The generated preview file (human readeable) is to be hosted as an html page, presumably using on [GH-Pages](https://pages.github.com/), together with the crate contents and jsonld metadata (machine reedable).

[![.github/workflows/testing.yml](https://github.com/vliz-be-opsci/rocrate-to-html/actions/workflows/testing.yml/badge.svg)](https://github.com/vliz-be-opsci/rocrate-to-html/actions/workflows/testing.yml)

## Example ##

Below is an example yaml file that once copied to "/.github/workflows/rocrate_to_pages.yml" would trigger the publishing to github pages action on push to the "main" branch.

```yml

name: RoCrate to GitHub Pages
on:
  push:
    branches:
      - main  # Set a branch name to trigger deployment
  pull_request:
jobs:
  build-html:
    runs-on: ubuntu-20.04
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    steps:
      # Checkout this repo
      - uses: actions/checkout@v3 
      
      # Build the preview.html file from the rocrate.json
      - name: Build Preview HTML
        uses: vliz-be-opsci/rocrate-to-pages@latest #replace vliz-be-opsci with your git username or if you are using this action in a organisation , replace this by the organisation name
 
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./unicornpages 

``` 

## Steps
This action is to be used on git projects that include rocrate files that comply to the [rocrate standard](https://www.researchobject.org/ro-crate/1.0/):

  - The project *must* include a metadata file named "ro-crate-metadata.json"
  - The project *may* include a human-readable preview file that *must* be called "ro-crate-preview.html"
  - In this first iteration of the action it is assumed that the preview file does exist. In future versions a fallback process could create a standard preview file using the metadata file. 
   
Gitlab pages routes traffic to an "index.html" file by default and is incapable of handling content negotiation. Due to these (and other) GH-Pages limitations the following steps are taken:
  
  - Some preperation steps are handled by other actions
  - A symbolic link is created that maps an "index.html" file to "ro-crate-preview.html"
  - A symbolic link is created that maps "ro-crate-metadata.json" to "ro-crate-metadata.jsonld"
  - Some publishing and cleanup steps are handled by other actions.

## Updating tags

This repo also has automated versioning and latest release management.
When pushing a change , the user can add the following tags to the commit header to trigger a new release of the repo. (#major , #minor , #patch, #none)
[more info on repo relase tags here](https://github.com/marketplace/actions/github-tag-bump)

When using the #major appendix in the commit header, the repo will push out a release.
By default a push to this repo will result in a new patch tag eg: Vx.x.x+1

The following code coming from the /github/workflow/testing.yml shows how this works:

```  
name: On_Push_Testing

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:

  test_build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Environment
      uses: actions/setup-node@v3
      with:
        node-version: 18.1.0
    - run: npm install
    # - run: npm run build

    - name: Verify that the Docker image for the action builds
      run: docker build . --file Dockerfile
      
    - name: Bump version and push tag
      uses: anothrNick/github-tag-action@1.36.0
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        WITH_V: true
        DEFAULT_BUMP: patch
    - name: change latest tag
      uses: EndBug/latest-tag@latest
      env:
       GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
       token: ${{ secrets.GITHUB_TOKEN }}
      with:
        # You can change the name of the tag or branch with this input.
        # Default: 'latest'
        ref: 'latest'
        # If a description is provided, the action will use it to create an annotated tag. If none is given, the action will create a lightweight tag.
        # Default: ''
        description: 'latest version of the rocrate-to-html.' 
        # Force-update a branch instead of using a tag.
        # Default: false
        force-branch: false
          
  release-manager:
    needs: test_build 
    name: Check if ready for release
    runs-on: ubuntu-latest
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - run: echo ${{ github.event.repository.name }}
        name: Get latest tag of repo 
      - uses: oprypin/find-latest-tag@v1
        with:
          repository: vliz-be-opsci/${{ github.event.repository.name }}  # The repository to scan. Change the part before the / to name or organisation where repo resides
          releases-only: false  # Set to true if you want to know the tag linked to the latest release
        id: vliz-be-opsci  # The step ID to refer to later.

      - run: echo "${{ github.event.repository.name }} is at version ${{ steps.vliz-be-opsci.outputs.tag }}"
        name: check if latest tag meets maor release requirements
      - uses: actions-ecosystem/action-regex-match@v2
        id: regex-match
        with:
          text: ${{ steps.vliz-be-opsci.outputs.tag }}
          regex: 'v[0-9].0.0'
      - name: Create release
        if: ${{ steps.regex-match.outputs.match != '' }}
        uses: rymndhng/release-on-push-action@master
        with:
          bump_version_scheme: minor
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


