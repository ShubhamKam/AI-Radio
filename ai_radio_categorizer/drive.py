from __future__ import annotations

import os
import subprocess
from pathlib import Path


def rclone_sync(*, src_dir: Path, remote: str, drive_root: str, dry_run: bool = False) -> None:
    """
    Uses rclone configured on the device (recommended for Termux).
    Example remote target: "gdrive:AI-Radio"
    """
    target = f"{remote}:{drive_root}".rstrip(":")
    cmd = ["rclone", "sync", str(src_dir), target, "--create-empty-src-dirs"]
    if dry_run:
        cmd.append("--dry-run")

    env = os.environ.copy()
    subprocess.run(cmd, check=True, env=env)

