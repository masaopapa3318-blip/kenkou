# シーン画像から動画を組み立てる（ゆっくりズーム＋クロスフェード）
import json, subprocess, os, sys
D = os.path.dirname(os.path.abspath(__file__))
SD = os.environ.get('SDIR', 'scenes'); VERT = SD != 'scenes'
S = os.path.join(D, SD); C = os.path.join(D, 'clips' + ('_v' if VERT else '')); os.makedirs(C, exist_ok=True)
BIG, OUTS = ('2160:3840', '720x1280') if VERT else ('3840:2160', '1280x720')
scenes = json.load(open(os.path.join(S, 'scenes.json')))
FPS, XF = 30, 0.8
only = sys.argv[1].split(',') if len(sys.argv) > 1 else None
for i, sc in enumerate(scenes):
    out = os.path.join(C, sc['name'] + '.mp4')
    if only and sc['name'] not in only and os.path.exists(out): continue
    n = int(sc['dur'] * FPS)
    z = f"1+0.035*on/{n}" if i % 2 == 0 else f"1.035-0.035*on/{n}"
    vf = (f"scale={BIG}:flags=lanczos,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={OUTS}:fps={FPS},"
          "format=yuv420p")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', os.path.join(S, sc['name'] + '.png'), '-vf', vf,
                    '-frames:v', str(n), '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', out], check=True)
    print('clip', sc['name'], flush=True)
# クロスフェードでつなぐ
inputs = []; fl = []; t = 0; prev = '0:v'
for i, sc in enumerate(scenes):
    inputs += ['-i', os.path.join(C, sc['name'] + '.mp4')]
for i in range(1, len(scenes)):
    t += scenes[i - 1]['dur'] - XF
    lab = f'v{i}'
    fl.append(f'[{prev}][{i}:v]xfade=transition=fade:duration={XF}:offset={t:.2f}[{lab}]')
    prev = lab
fl.append(f'[{prev}]fade=t=in:st=0:d=0.8,fade=t=out:st={t + scenes[-1]["dur"] - 1.2:.2f}:d=1.2[vout]')
out = os.path.join(D, 'tenkyu-intro' + ('-vertical' if VERT else '') + '.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fl), '-map', '[vout]',
                '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
print('done', out)
