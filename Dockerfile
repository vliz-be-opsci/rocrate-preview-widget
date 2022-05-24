# If you need Python 3 and the GitHub CLI, then use:
FROM alpine:3.15.1
RUN apt-get install -y git-core curl build-essential openssl libssl-dev \
 && git clone https://github.com/nodejs/node.git \
 && cd node \
 && ./configure \
 && make \
 && sudo make install

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
