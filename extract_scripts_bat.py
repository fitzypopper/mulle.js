#!/usr/bin/env python3
"""
Extract Director score + Lingo script chunks from the boat game movies with
drxtract (System25/drxtract, the same tool mulle.js uses for score scripts).

Output: scripts_out/<MOVIE>/score.json, cas/, bin/*.Lscr (compiled Lingo), fonts.json

Note: .Lscr files are *compiled* Lingo - decompiling them to readable handlers
is a separate step (cars-game equivalent: reference/mullestuff/research/lingo/old/*.lingo).

Run from the project root:
    .venv/bin/python extract_scripts_bat.py
"""
import os
import shutil
import subprocess
import sys

DRXTRACT = 'build_data/drxtract'
SOURCE = 'iso/Movies'
OUT = 'scripts_out'
COMMIT = 'be17978bb9dcf220f2c97c1b0f7a19022a95c001'


def ensure_drxtract():
    if os.path.isdir(DRXTRACT):
        return
    os.makedirs('build_data', exist_ok=True)
    subprocess.run(['git', 'clone', '-q', 'https://github.com/System25/drxtract.git', DRXTRACT], check=True)
    subprocess.run(['git', '-C', DRXTRACT, 'checkout', '-q', COMMIT], check=True)


def main():
    ensure_drxtract()
    movies = sorted(f for f in os.listdir(SOURCE) if f.lower().endswith(('.dxr', '.cxt')))
    ok, failed = [], []

    for i, movie in enumerate(movies, 1):
        dest = os.path.join(OUT, movie.upper())
        if os.path.isdir(dest) and os.listdir(dest):
            print(f'[{i}/{len(movies)}] {movie}: exists, skip')
            ok.append(movie)
            continue
        os.makedirs(dest, exist_ok=True)
        proc = subprocess.run(
            [sys.executable, 'drxtract', 'pc', os.path.abspath(os.path.join(SOURCE, movie)), os.path.abspath(dest)],
            cwd=DRXTRACT, capture_output=True)
        files = os.listdir(dest)
        status = 'ok' if files else 'EMPTY'
        if proc.returncode != 0 or not files:
            status = 'FAIL'
            failed.append(movie)
            tail = proc.stderr.decode('utf-8', 'replace').strip().splitlines()[-1:]
            print(f'[{i}/{len(movies)}] {movie}: {status} {tail}')
        else:
            ok.append(movie)
            print(f'[{i}/{len(movies)}] {movie}: {status} ({len(files)} entries)')
        # drxtract writes a lot of DEBUG noise to stderr; keep stdout readable
        if proc.stdout and status == 'FAIL':
            print(proc.stdout.decode('utf-8', 'replace')[-500:])

    print(f'\n{len(ok)} ok, {len(failed)} failed: {failed}')


if __name__ == '__main__':
    main()
