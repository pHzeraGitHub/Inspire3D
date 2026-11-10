"""Create a consistent pg_dump archive and upload it to a private R2 bucket."""

import hashlib
import json
import os
import subprocess
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

from common import postgres_environment, r2_client


def sha256_file(filename: Path) -> str:
    digest = hashlib.sha256()
    with filename.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url:
        raise ValueError("DATABASE_URL não configurada.")
    pg_environment, _, _ = postgres_environment(database_url)
    client, bucket = r2_client()
    now = datetime.now(timezone.utc)
    prefix = os.environ.get("R2_BACKUP_PREFIX", "inspire3d/staging").strip("/")
    if not prefix or any(part in (".", "..") for part in prefix.split("/")):
        raise ValueError("R2_BACKUP_PREFIX inválido.")
    key = f"{prefix}/{now:%Y/%m/%d}/{now:%Y%m%dT%H%M%SZ}-{uuid.uuid4().hex}.dump"

    with tempfile.TemporaryDirectory(prefix="inspire3d-backup-") as directory:
        archive = Path(directory) / "postgres.dump"
        result = subprocess.run(
            ["pg_dump", "--format=custom", "--compress=6", "--no-owner", "--no-acl", f"--file={archive}"],
            env=pg_environment,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(f"pg_dump falhou (código {result.returncode}); nenhuma cópia foi enviada.")
        size = archive.stat().st_size
        if size == 0:
            raise RuntimeError("pg_dump produziu um arquivo vazio.")
        digest = sha256_file(archive)
        client.upload_file(
            str(archive), bucket, key,
            ExtraArgs={
                "ContentType": "application/octet-stream",
                "Metadata": {"sha256": digest, "created-at": now.strftime("%Y-%m-%dT%H:%M:%SZ")},
            },
        )
        stored = client.head_object(Bucket=bucket, Key=key)
        if stored["ContentLength"] != size or stored.get("Metadata", {}).get("sha256") != digest:
            raise RuntimeError("A cópia no R2 não confirmou tamanho e hash; verifique o objeto antes de usá-lo.")
        print(json.dumps({"backup": "confirmed", "key": key, "bytes": size, "sha256": digest}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Backup falhou: {error}", file=sys.stderr)
        sys.exit(1)
