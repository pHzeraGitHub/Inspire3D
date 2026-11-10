"""Shared, secret-safe configuration for PostgreSQL backups in private R2."""

import os
import re
from urllib.parse import parse_qs, unquote, urlparse


def postgres_environment(url: str) -> tuple[dict[str, str], str, tuple[str, int, str]]:
    parsed = urlparse(url)
    if parsed.scheme not in ("postgres", "postgresql") or not parsed.hostname or not parsed.username:
        raise ValueError("A URL PostgreSQL está incompleta.")
    database = unquote(parsed.path.lstrip("/"))
    if not database or "/" in database:
        raise ValueError("A URL PostgreSQL precisa indicar um banco.")
    options = parse_qs(parsed.query)
    sslmode = options.get("sslmode", [os.environ.get("BACKUP_PGSSLMODE", "require")])[0]
    if sslmode not in ("require", "verify-ca", "verify-full", "disable"):
        raise ValueError("sslmode inválido para o backup.")
    environment = os.environ.copy()
    environment.update({
        "PGHOST": parsed.hostname,
        "PGPORT": str(parsed.port or 5432),
        "PGUSER": unquote(parsed.username),
        "PGPASSWORD": unquote(parsed.password or ""),
        "PGDATABASE": database,
        "PGSSLMODE": sslmode,
        "PGCONNECT_TIMEOUT": "15",
    })
    return environment, database, (parsed.hostname.lower(), parsed.port or 5432, database)


def r2_config() -> tuple[str, str, str, str]:
    endpoint = os.environ.get("R2_ENDPOINT", "").rstrip("/")
    bucket = os.environ.get("R2_BACKUP_BUCKET", "")
    access_key = os.environ.get("R2_ACCESS_KEY_ID", "")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY", "")
    host = urlparse(endpoint)
    if host.scheme != "https" or not host.hostname or not host.hostname.endswith(".r2.cloudflarestorage.com"):
        raise ValueError("R2_ENDPOINT deve ser um endpoint HTTPS oficial do R2.")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,61}[a-z0-9]", bucket):
        raise ValueError("R2_BACKUP_BUCKET inválido.")
    if not access_key or not secret_key:
        raise ValueError("Configure as duas credenciais R2 do bucket privado.")
    return endpoint, bucket, access_key, secret_key


def r2_client():
    import boto3
    from botocore.config import Config

    endpoint, bucket, access_key, secret_key = r2_config()
    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )
    return client, bucket
