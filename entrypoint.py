#!/usr/bin/env python3

# NOTE: If you are using an alpine docker image
# such as pyaction-lite, the -S option above won't
# work. The above line works fine on other linux distributions
# such as debian, etc, so the above line will work fine
# if you use pyaction:4.0.0 or higher as your base docker image.

# Steps in this action:
    # - check if correct files exist. 
    # - create symlink for index.html and crate.json
    # - check validation?
import sys
import os
from pathlib import Path
import subprocess
import logging 
from bs4 import BeautifulSoup

log = logging.getLogger('entrypoint') 

class CrateObj():
    def __init__(self, crate_dir):
        self.crate_dir = crate_dir
        self.metadata_path = Path(os.path.join(self.crate_dir, 'ro-crate-metadata.json'))
        self.metadata_exists = False 
        self.preview_path  = Path(os.path.join(self.crate_dir, 'ro-crate-preview.html'))
        self.preview_exists = False
        self.crate_valid = None
        self.metadata_valid = None
        self.preview_valid = None 

    def check_rocrate_valid(self):
        # Checks if there are rocrate objects in directory
        log.debug('Checking that rocrate files exist...') 
        if os.path.exists(self.metadata_path):
            log.debug('ROCrate metadata json file exists: {0}'.format(self.metadata_path))
            self.metadata_exists = True
        elif os.path.exists(self.metadata_path.with_suffix('.jsonld')):
            self.metadata_path = self.metadata_path.with_suffix('.jsonld')
            log.debug('ROCrate metadata jsonld file exists: {0}'.format(self.metadata_path)) 
            self.metadata_exists = True
        else:
            log.error('ROCrate metadata file DOES NOT exist: {0}'.format(self.metadata_path))
            self.metadata_exists = False
            self.crate_valid = False
            exit(1)

        if os.path.exists(self.preview_path):
            log.debug('ROCrate preview file exists: {0}'.format(self.preview_path))
            self.preview_exists = True
        else: 
            log.warning('ROCrate preview file DOES NOT exist: {0}'.format(self.preview_path)) 
            self.preview_exists = False

        self.check_metadata()
        self.check_preview()
        if self.metadata_valid and self.preview_valid:
            log.info('Crate passes validity checks.')
            self.crate_valid = True
        return 
    
    def check_metadata(self):
        log.debug('Checking if metadata is valid...')
        #TODO:some test
        self.metadata_valid = True
        return

    def check_preview(self):
        log.debug('Checking if preview is valid...')
        #TODO:some test
        self.preview_valid = True
        return

def create_symlink(dst, src):
    # This creates a symbolic link on python in tmp directory
    log.debug(f'Creating symlink between {src} and {dst}')
    try:
        os.symlink(src, dst)
    except Exception as err:
        log.warning('Problem while creating symlink:')
        log.warning(err)
    return

def create_preview_html(crate_obj):
    ''' 
    This uses https://github.com/UTS-eResearch/ro-crate-html-js to create a preview.html 
    from a rocrate json file. 

    rochtml rocrate_datacrate_test/ro-crate-metadata.json
    '''
    log.info('Creating HTML preview file for {0}...'.format(crate_obj.metadata_path))
    metadata_file = crate_obj.metadata_path
    subprocess.check_call(f'rochtml {metadata_file}', shell=True)
    
    # log.debug('Adding Header/Footer template to preview file...')

    # #TODO: Find a better way of getting the header/footer templates.
    # NOTE: Header/footer functionality moved to jekyll
    # with open(crate_obj.preview_path, 'r') as preview_file:
    #     soup = BeautifulSoup(preview_file, 'html.parser')
    #     #Add Header
    #     header_path = './header.html'
    #     with open(header_path) as header_file:
    #         head_soup = BeautifulSoup(header_file, 'html.parser')
    #         soup.html.body.insert_before(head_soup)

    #     #Add Footer
    #     footer_path = './footer.html'
    #     with open(footer_path, 'r') as footer_file:
    #         foot_soup = BeautifulSoup(footer_file, 'html.parser')
    #         soup.html.body.append(foot_soup)
    
    # # Write updated page to html file
    # with open('./test_out.html','wb') as outfile:
    #     outfile.write(soup.prettify("utf-8")) 
    return

def publish_rocrate(crate_dir): 
    # steps to follow to create the correct files to publish to GH-Pages
    log.info('Preparing to publish ROCrate.')

    this_crate = CrateObj(crate_dir)
    this_crate.check_rocrate_valid()
    create_preview_html(this_crate)
    # create_symlink('index.html', this_crate.preview_path)

    # if this_crate.preview_exists:
    #     create_preview_html(this_crate)
    #     create_symlink('index.html', this_crate.preview_path)
    # else: 
    #     #Create index.html page
    #     create_preview_html(this_crate)
    #     create_symlink('index.html', this_crate.preview_path)

    if this_crate.metadata_exists:
        ## Create symlink between the .json >> .jsonld file extensions depending on which exists
        if os.path.splitext(this_crate.metadata_path) == '.json':
            create_symlink('ro-crate-metadata.jsonld', this_crate.metadata_path) 
        elif os.path.splitext(this_crate.metadata_path) == '.jsonld':
            create_symlink('ro-crate-metadata.json', this_crate.metadata_path) 
    log.info('ROCrate ready to publish')

if __name__ == "__main__" :
    # Rename these variables to something meaningful
    crate_path = sys.argv[1]
    loglevel = sys.argv[2]

    logging.basicConfig(
        stream=sys.stdout,
        format='%(asctime)s - %(levelname)s - %(name)s - %(message)s',
        level=getattr(logging, loglevel))
    log.setLevel(getattr(logging, loglevel))

    # The work:
    publish_rocrate(crate_path) 