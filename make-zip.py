"""
Create ai-interview-resume-saas.zip inside this directory.
Run from anywhere: python path/to/make-zip.py
"""
import os
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ZIP_PATH = os.path.join(HERE, "ai-interview-resume-saas.zip")
SKIP_DIRS = {"node_modules", ".git", "dist", "build"}


def should_skip_dir(path: str) -> bool:
    rel = os.path.relpath(path, HERE)
    parts = rel.split(os.sep)
    return any(p in SKIP_DIRS for p in parts)


def main():
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as z:
        for dp, dirnames, filenames in os.walk(HERE):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            if should_skip_dir(dp):
                continue
            for f in filenames:
                if f in {"zip-build.log"} or f.endswith(".zip"):
                    continue
                full = os.path.join(dp, f)
                rel_inside = os.path.relpath(full, HERE)
                arc = rel_inside.replace("\\", "/")
                z.write(full, arc)
    log = os.path.join(HERE, "zip-build.log")
    with open(log, "w", encoding="utf-8") as fh:
        fh.write(f"ZIP_PATH={ZIP_PATH}\n")
        fh.write(f"size_bytes={os.path.getsize(ZIP_PATH)}\n")


if __name__ == "__main__":
    main()
