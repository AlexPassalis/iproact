FROM n8nio/n8n AS base

COPY workflows/ /data/workflows

ENTRYPOINT ["sh","-c","n8n import:workflow --separate --input=/data/workflows && n8n start"]
