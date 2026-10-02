#!/usr/bin/env python3
import json

with open('/home/nas/Projects/MulleBat/scripts_out/05.DXR/score.json') as f:
    data = json.load(f)

# Load metadata for cast names
import os
meta_path = '/home/nas/Projects/MulleBat/cst_out_new/05.DXR/metadata.json'
with open(meta_path) as f:
    meta = json.load(f)

cast_names = {}
for lib in meta['libraries']:
    if lib['name'] == 'Internal':
        for k, v in lib['members'].items():
            cast_names[int(k)] = v.get('name', '')

for frame_idx, frame in enumerate(data):
    score = frame.get('score', [])
    sprites = [(ch, s) for ch, s in enumerate(score) if s and 'castId' in s]
    if sprites:
        print(f'=== Frame {frame_idx} ({len(sprites)} sprites) ===')
        for ch, s in sprites:
            cid = s['castId']
            name = cast_names.get(cid, '')
            print(f'  Ch{ch:3d}: castId={cid:3d} ({name})  x={s.get("x",0):4d} y={s.get("y",0):4d}  w={s.get("width",0):4d} h={s.get("height",0):4d}  ink={str(s.get("ink_type","")):30s}  bg={s.get("backgroundColor",0):3d} fg={s.get("foregroundColor",0):3d}')