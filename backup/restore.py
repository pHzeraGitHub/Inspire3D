"""Download/verify an R2 archive; optionally restore into an empty drill database."""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from backup import sha256_file
from common import postgres_environment, r2_client


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--key", required=True, help="Exact object key printed by backup.py")
    args = parser.parse_args()
    prefix = os.environ.get("R2_BACKUP_PREFIX", "inspire3d/staging").strip("/")
    if not args.key.startswith(f"{prefix}/") or not args.key.endswith(".dump"):
        raise ValueError("A chave informada não pertence ao prefixo de backup configurado.")
    client, bucket = r2_client()
    head = client.head_object(Bucket=bucket, Key=args.key)
    expected_hash = head.get("Metadata", {}).get("sha256", "")
    if len(expected_hash) != 64:
        raise RuntimeError("O objeto não contém um hash SHA-256 válido.")

    with tempfile.TemporaryDirectory(prefix="inspire3d-restore-") as directory:
        archive = Path(directory) / "postgres.dump"
        client.download_file(bucket, args.key, str(archive))
        if archive.stat().st_size != head["ContentLength"] or sha256_file(archive) != expected_hash:
            raise RuntimeError("O arquivo baixado não corresponde ao tamanho e hash do R2.")
        listed = subprocess.run(["pg_restore", "--list", str(archive)], stdout=subprocess.DEVNULL,
                                stderr=subprocess.DEVNULL, check=False)
        if listed.returncode != 0:
            raise RuntimeError("pg_restore não conseguiu ler o arquivo.")

        target_url = os.environ.get("RESTORE_DATABASE_URL")
        if not target_url:
            print(json.dumps({"archive": "verified", "key": args.key, "sha256": expected_hash,
                              "restore": "not_requested"}))
            return
        source_url = os.environ.get("DATABASE_URL")
        target_environment, target_database, target_identity = postgres_environment(target_url)
        if not target_database.endswith("_restore_test"):
            raise ValueError("O banco de destino deve terminar em _restore_test.")
        if source_url and target_identity == postgres_environment(source_url)[2]:
            raise ValueError("O destino não pode ser o banco de origem.")
        table_count = subprocess.run(
            ["psql", "--no-psqlrc", "--tuples-only", "--no-align", "--command",
             "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public'"],
            env=target_environment, capture_output=True, text=True, check=False,
        )
        if table_count.returncode != 0 or table_count.stdout.strip() != "0":
            raise RuntimeError("O banco de restauração não está acessível ou não está vazio.")
        restored = subprocess.run(
            ["pg_restore", "--single-transaction", "--no-owner", "--no-acl", "--dbname", target_database, str(archive)],
            env=target_environment, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False,
        )
        if restored.returncode != 0:
            raise RuntimeError(f"pg_restore falhou (código {restored.returncode}); descarte o banco de teste.")
        print(json.dumps({"archive": "verified", "key": args.key, "sha256": expected_hash,
                          "restore": "completed", "database": target_database}))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Restauração falhou: {error}", file=sys.stderr)
        sys.exit(1)
