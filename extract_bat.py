#!/usr/bin/env python3
"""Extract every Director movie/cast from the Bygg båtar med Mulle Meck ISO.

Adapted from extract.py (which expects the Bygg bilar folder layout) for the
MULLEBAT (Windows).iso layout: iso/Movies/*.dxr|*.cxt plus iso/Data/data.cst.

Output goes to cst_out_new/<FILENAME>/ (ShockwaveExtractor's default), relative
to the working directory - run this from the project root.
"""
import os
import sys
from glob import glob

from shockwaveparser import ShockwaveExtractor

PROJECT = os.path.dirname(os.path.realpath(__file__))
MOVIE_DIRS = [
    os.path.join(PROJECT, 'iso', 'Movies'),
    os.path.join(PROJECT, 'iso', 'Data'),
]
PATTERNS = ('*.dxr', '*.DXR', '*.cxt', '*.CXT', '*.cst', '*.CST')


def files_in(folder):
    seen = set()
    for pattern in PATTERNS:
        for path in glob(os.path.join(folder, pattern)):
            if path not in seen:
                seen.add(path)
                yield path


def main():
    failed = []
    count = 0
    for folder in MOVIE_DIRS:
        if not os.path.isdir(folder):
            print('missing folder: %s' % folder)
            continue
        for path in sorted(files_in(folder)):
            count += 1
            print('[%d] %s' % (count, os.path.relpath(path, PROJECT)), flush=True)
            try:
                ShockwaveExtractor.main(['-e', '-i', path])
            except UnicodeEncodeError as e:
                print('  encoding error: %s' % e, flush=True)
            except Exception as e:  # keep going, one bad movie must not stop the run
                print('  ERROR: %s: %s' % (type(e).__name__, e), flush=True)
                failed.append(path)
    if failed:
        print('\n%d movies failed:' % len(failed))
        for path in failed:
            print('  %s' % path)
        sys.exit(1)
    print('\nall %d movies extracted' % count)


if __name__ == '__main__':
    main()
