# If you need Python 3 and the GitHub CLI, then use:
FROM node:18.2.0-slim

RUN apt-get update && \
    apt-get -y install rsync

#copy over neccesary files to docker image
COPY public /public
COPY src /src
COPY package-lock.json /package-lock.json
COPY package.json /package.json
COPY entrypoint.sh /entrypoint.sh
#print(the env variable  inputs.crate_path passed from the actins.yml file)
RUN echo $crate_path
#chmod the entrypoint.sh file to make it executable
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
