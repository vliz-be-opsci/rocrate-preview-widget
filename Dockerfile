# If you need Python 3 and the GitHub CLI, then use:
FROM node:18.2.0-slim


COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
