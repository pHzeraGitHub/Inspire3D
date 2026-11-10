FROM postgres:18-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-boto3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/inspire3d-backup
COPY backup/*.py ./
USER postgres
CMD ["python3", "backup.py"]
