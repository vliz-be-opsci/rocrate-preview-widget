# If you need Python 3 and the GitHub CLI, then use:
FROM alpine:3.15.1

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
