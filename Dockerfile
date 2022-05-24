# If you need Python 3 and the GitHub CLI, then use:
FROM alpine:3.15.1
RUN apk --no-cache add python3
RUN apk --no-cache add npm
RUN apk add --update py-pip

COPY requirements.txt /requirements.txt 
RUN pip install -r /requirements.txt
RUN npm install ro-crate-html-js --global
COPY entrypoint.py /entrypoint.py
ENTRYPOINT ["/entrypoint.py"]
