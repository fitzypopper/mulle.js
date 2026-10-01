#!/usr/bin/env python3
"""
Build script for Mulle Meck Bygger Båtar (boat game).

Adapted from build.py (cars game). Key differences:
- Uses local ISO already extracted to iso/ and cst_out_new/
- No plugin.exe / PLUGIN.CST / 66.DXR (car DLC only)
- Different movie numbers for missions/minigames (70-88 instead of 82-94)
- Different assets.yml (boat-specific sprite sheets)
"""
import glob
import os
import platform
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

import requests
from assets import DirectorAssets

try:
    from git import Repo
    from shockwaveparser import ShockwaveExtractor
    from topography import build_topography
    from convert_image import convert_image
    from assets.build_spritesheets import SpriteSheetBuilder
except ImportError as e:
    if 'download-only' not in sys.argv:
        raise e


def download_file(url, local_file, show_progress=True):
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(local_file, 'wb') as fp:
            print('Download to', local_file)
            for chunk in r.iter_content(chunk_size=8192):
                if show_progress:
                    print(fp.tell(), end='\r')
                fp.write(chunk)


class Build:
    # Topography member pairs in CDDATA.CXT. Cars game: 693..748.
    # Boat game: 30t001v0/30t001v0-2 ... 30t088v0/30t088v0-2 = 88 pairs.
    TOPOGRAPHY_FIRST = 2315
    TOPOGRAPHY_LAST = 2490

    def __init__(self, language='sv'):
        self.language = language
        self.script_folder = os.path.dirname(__file__)
        self.project_folder = os.path.realpath(os.path.join(self.script_folder, '..'))
        self.build_folder = os.path.join(self.project_folder, 'build_data')
        self.dist_folder = os.path.join(self.project_folder, 'dist')
        self.movie_folder = os.path.join(self.build_folder, 'Movies')
        self.extract_folder = os.path.join(self.project_folder, 'cst_out_new')
        self.iso_folder = os.path.join(self.script_folder, '..', 'iso')
        if not os.path.exists(self.build_folder):
            os.mkdir(self.build_folder)

        config_file = Path(self.script_folder).joinpath('assets', 'assets_bat.yml')
        self.director_assets = DirectorAssets(self.language, Path(self.extract_folder), config_file)

        if platform.system() == 'Windows':
            self.npm = 'npm.CMD'
            self.npx = 'npx.CMD'
        else:
            self.npm = 'npm'
            self.npx = 'npx'

    def drxtract(self, movie_file):
        drxtract_folder = os.path.join(self.build_folder, 'drxtract')
        if not os.path.exists(drxtract_folder):
            repo = Repo.clone_from('https://github.com/System25/drxtract.git', drxtract_folder)
            repo.git.checkout('be17978bb9dcf220f2c97c1b0f7a19022a95c001')

        movie_name = os.path.basename(movie_file)
        movie_dir = os.path.dirname(movie_file)
        extract_folder = os.path.join(movie_dir, 'drxtract', movie_name)
        os.makedirs(extract_folder, exist_ok=True)

        drxtract_run = subprocess.run([sys.executable, 'drxtract', 'pc', movie_file, extract_folder],
                                      cwd=drxtract_folder, capture_output=True)
        drxtract_run.check_returncode()
        if len(os.listdir(extract_folder)) == 0:
            raise RuntimeError(
                'No files extracted from %s, output from drxtract: %s' % (movie_file, drxtract_run.stderr.decode()))
        return extract_folder

    def scores(self):
        """Extract score data from boat minigame movies (70-88)."""
        # Boat game has minigames in 70-88 range, not 82-94
        files = glob.glob('%s/7*.dxr' % self.movie_folder) + glob.glob('%s/8*.dxr' % self.movie_folder)
        files = [f for f in files if not any(x in f for x in ['80.DXR', '81.DXR'])]  # 80/81 are larger scenes
        if not files:
            print('Warning: No minigame movies found for scores (glob 7*.dxr, 8*.dxr)')
            return

        score_script = os.path.join(self.script_folder, 'score', 'score.py')
        for movie_file in files:
            extract_folder = self.drxtract(movie_file)
            score_json = os.path.join(extract_folder, 'score.json')
            if os.path.exists(score_json):
                try:
                    subprocess.run([sys.executable, score_script, score_json],
                                   capture_output=True).check_returncode()
                except subprocess.CalledProcessError as e:
                    print('Output from score for %s: %s' % (movie_file, e.stderr.decode('utf-8')))

        # No hardcoded 82.DXR JustDoIt - boat game has different minigame scoring
        # Individual minigames can be added here if they have score.json

    def phaser(self):
        folder = os.path.join(self.build_folder, 'phaser-ce')
        if not os.path.exists(folder):
            Repo.clone_from('https://github.com/photonstorm/phaser-ce.git', folder, branch='v2.16.0',
                            single_branch=None)

        subprocess.run([self.npm, 'uninstall', 'fsevents'], cwd=folder).check_returncode()
        subprocess.run([self.npm, 'install'], cwd=folder).check_returncode()

        exclude = ['gamepad',
                   'bitmaptext',
                   'retrofont',
                   'rope',
                   'tilesprite',
                   'flexgrid',
                   'ninja',
                   'p2',
                   'tilemaps',
                   'particles',
                   'weapon',
                   'creature',
                   'video'
                   ]

        subprocess.run([
            self.npx,
            'grunt',
            'custom',
            '--exclude=' + ','.join(exclude),
            '--uglify',
            '--sourcemap'
        ], cwd=folder).check_returncode()

        shutil.copy(os.path.join(folder, 'dist', 'phaser.min.js'), self.dist_folder)
        shutil.copy(os.path.join(folder, 'dist', 'phaser.map'), self.dist_folder)

    def webpack(self, prod=False):
        if not prod:
            config = os.path.join(self.project_folder, 'webpack.dev.js')
        else:
            config = os.path.join(self.project_folder, 'webpack.prod.js')
        process = subprocess.run([self.npx, 'webpack-cli', '-c', config])
        process.check_returncode()

    def html(self):
        for folder in ['progress', 'info']:
            destination = os.path.join(self.dist_folder, folder)
            if not os.path.exists(destination):
                os.mkdir(destination)
            shutil.copytree(os.path.join(self.project_folder, folder), destination, dirs_exist_ok=True)
        shutil.copy(os.path.join(self.project_folder, 'src', 'index.html'), self.dist_folder)

    def copy_data(self):
        """
        Copy game data to dist/data.

        Boat game: the data is generated by extract_data_bat.py into gamedata/
        (the repo's data/ folder still holds the cars-game data).
        """
        source = os.path.join(self.project_folder, 'gamedata')
        if not os.path.exists(source):
            raise RuntimeError('gamedata/ not found - run .venv/bin/python extract_data_bat.py first')
        shutil.copytree(source, os.path.join(self.dist_folder, 'data'), dirs_exist_ok=True)

    def copy_assets(self):
        """Copy the generated spritesheets/audio (assets_<lang>/) into dist/assets/."""
        source = Path(self.project_folder).joinpath(f'assets_{self.language}')
        if not source.exists():
            raise RuntimeError(f'{source} not found - run the assets stage first')
        destination = Path(self.dist_folder).joinpath('assets')
        destination.mkdir(parents=True, exist_ok=True)
        for file in source.iterdir():
            shutil.copy(file, destination.joinpath(file.name))

    def copy_phaser(self):
        """
        Use the phaser-ce npm package build instead of cloning + grunt building.
        (The upstream `phaser` stage still exists for a custom exclude-build.)
        """
        source = Path(self.project_folder).joinpath('node_modules', 'phaser-ce', 'build', 'phaser.min.js')
        if not source.exists():
            raise RuntimeError(f'{source} not found - run npm install first')
        shutil.copy(source, self.dist_folder)

    def extract_iso(self, extract_content=True):
        """Already extracted via extract_bat.py. Optionally re-extract from ISO."""
        import pycdlib
        # Use the first .iso file found in iso/
        iso_files = glob.glob(os.path.join(self.iso_folder, '*.iso'))
        if not iso_files:
            print('No ISO found in %s, skipping extract_iso (using existing cst_out_new/)' % self.iso_folder)
            return
        iso_path = iso_files[0]

        iso = pycdlib.PyCdlib()
        iso.open(iso_path)

        if not os.path.exists(self.movie_folder):
            os.mkdir(self.movie_folder)

        try:
            children = iso.list_children(iso_path='/Movies')
            iso.get_record(iso_path='/Movies')
        except pycdlib.pycdlib.pycdlibexception.PyCdlibInvalidInput:
            children = iso.list_children(iso_path='/MOVIES')
            iso.get_record(iso_path='/MOVIES')

        for child in children:
            assert isinstance(child, pycdlib.pycdlib.dr.DirectoryRecord)
            if child is None or child.is_dot() or child.is_dotdot():
                continue

            file = iso.full_path_from_dirrecord(child)
            extracted_file = os.path.join(self.movie_folder, os.path.basename(file).upper())
            iso.get_file_from_iso(extracted_file, iso_path=file)
            if extract_content:
                try:
                    ShockwaveExtractor.main(['-e', '-i', extracted_file])
                except Exception as e:
                    print('%s: %s' % (file, str(e)))
                    continue

    def copy_images(self):
        """
        Copy cursor and loading images.

        Boat game difference: the cursors are NOT in 00.CXT (cars game members
        109-117). Here they live in 11.DXR Internal #101-109, verified against
        cst_out_new/11.DXR/metadata.json:
            101 C_standard, 102 C_Grab, 103 C_Left, 104 C_Click, 105 C_Back,
            106 C_Right, 107 C_MoveLeft, 108 C_MoveRight, 109 C_MoveIn
        src/style.scss already uses these Director names as CSS classes.
        """
        cursors = {
            101: 'default',        # C_standard
            102: 'grab',           # C_Grab
            103: 'left',           # C_Left
            104: 'point',          # C_Click
            105: 'back',           # C_Back
            106: 'right',          # C_Right
            107: 'drag_left',      # C_MoveLeft
            108: 'drag_right',     # C_MoveRight
            109: 'drag_forward'    # C_MoveIn
        }

        ui_folder = os.path.join(self.dist_folder, 'ui')
        if not os.path.exists(ui_folder):
            os.makedirs(ui_folder, exist_ok=True)

        for number, name in cursors.items():
            cursor_file = self.director_assets.get_asset('11.DXR', 'Internal', number).file()
            output_file = os.path.join(ui_folder, '%s.png' % name)
            convert_image(cursor_file, output_file=output_file)

        # TODO verify: boat game has no 235x189 loading splash like the cars
        # game (00.CXT #122 is an animation frame here). 10.DXR #21
        # (10b008v0, 381x251) is the main-menu Mulle image - placeholder until
        # the real loading art is identified.
        loading_file = self.director_assets.get_asset('10.DXR', 'Internal', 21).file()
        output_file = os.path.join(self.dist_folder, 'loading.png')
        convert_image(loading_file, output_file=output_file)

        # No PLUGIN.CST in boat game - skip info/img generation

    def topography(self):
        source = os.path.join(self.extract_folder, 'CDDATA.CXT', 'Standalone')
        topography_dir = os.path.join(self.dist_folder, 'assets', 'topography')
        if not os.path.exists(topography_dir):
            os.makedirs(topography_dir, exist_ok=True)

        build_topography(source, topography_dir,
                         first=self.TOPOGRAPHY_FIRST, last=self.TOPOGRAPHY_LAST)

        try:
            subprocess.run(['node', os.path.join(self.script_folder, 'topography.js'), topography_dir],
                           capture_output=True).check_returncode()
        except subprocess.CalledProcessError as e:
            print(e.stderr.decode('utf-8'))
            raise e

    def assets(self, optipng: int = 0):
        for sheet in self.director_assets.spritesheets():
            builder = SpriteSheetBuilder(sheet, Path(self.project_folder).joinpath(f'assets_{self.language}'),
                                         optipng_level=optipng)
            builder.add_assets(self.director_assets.get_spritesheet_assets(sheet))
            builder.save()


if __name__ == '__main__':
    if len(sys.argv) > 1 and len(sys.argv[1]) == 2:
        build = Build(sys.argv[1])
    else:
        build = Build()

    # Boat game build stages (no download, no plugin)
    if 'build-prod' in sys.argv:
        sys.argv = ['webpack-prod', 'phaser-npm', 'html_css', 'data', 'topography',
                    'dist-assets', 'assets-prod']

    if 'build' in sys.argv:
        sys.argv = ['webpack-dev', 'phaser-npm', 'html_css', 'data', 'topography',
                    'assets', 'dist-assets']

    if 'webpack-dev' in sys.argv:
        build.webpack()
    elif 'webpack-prod' in sys.argv:
        build.webpack(True)

    if 'download-only' in sys.argv:
        # No-op for boat game
        pass

    if 'download' in sys.argv:
        build.extract_iso()

    if 'phaser' in sys.argv:
        build.phaser()

    if 'assets' in sys.argv:
        build.assets()

    if 'scores' in sys.argv:
        build.scores()

    if 'html_css' in sys.argv:
        build.html()

    if 'ui-images' in sys.argv:
        build.copy_images()

    if 'data' in sys.argv:
        build.copy_images()
        build.copy_data()

    if 'topography' in sys.argv:
        build.topography()

    if 'phaser-npm' in sys.argv:
        build.copy_phaser()

    if 'assets-prod' in sys.argv:
        build.assets(7)

    if 'dist-assets' in sys.argv:
        build.copy_assets()