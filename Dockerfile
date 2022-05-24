# If you need Python 3 and the GitHub CLI, then use:
FROM node:18.2.0-slim

copy public /public
COPY src /src
COPY package-lock.json /package-lock.json
COPY package.json /package.json
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
