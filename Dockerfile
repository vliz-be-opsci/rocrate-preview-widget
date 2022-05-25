# If you need Python 3 and the GitHub CLI, then use:
FROM node:18.2.0-slim
# install rsync
RUN yum update -y
RUN yum -y install rsync xinetd

#copy over neccesary files to docker image
COPY public /public
COPY src /src
COPY package-lock.json /package-lock.json
COPY package.json /package.json
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
