# 録音の場面ごとの長さに合わせて各場面の秒数を決め、ナレーション音声トラックを作る
import json, subprocess, os, sys
D = os.path.dirname(os.path.abspath(__file__))
AL = json.load(open(os.path.join(D, 'voice', sys.argv[1]), encoding='utf-8'))
XF, LEAD, TAIL, MIN = 0.8, 0.9, 1.6, 5.0
durs = {a['key']: round(max(MIN, (a['end'] - a['start']) + LEAD + TAIL), 2) for a in AL}
for sd in ['scenes', 'scenes_v']:
    p = os.path.join(D, sd, 'scenes.json'); sc = json.load(open(p))
    for s in sc: s['dur'] = durs[s['name']]
    json.dump(sc, open(p, 'w'), ensure_ascii=False, indent=1)
sc = json.load(open(os.path.join(D, 'scenes', 'scenes.json')))
t = 0; inputs = []; parts = []
for i, s in enumerate(sc):
    a = next(x for x in AL if x['key'] == s['name'])
    start_ms = int((t + LEAD) * 1000)
    inputs += ['-ss', f"{max(0, a['start'] - (0 if a['start'] < 0.2 else 0.12)):.2f}", '-to', f"{a['end'] + 0.25:.2f}", '-i', os.path.join(D, 'voice', a['src'])]
    parts.append(f"[{i}:a]aformat=sample_rates=44100:channel_layouts=mono,afade=t=in:d=0.08,adelay={start_ms}|{start_ms}[v{i}]")
    t += s['dur'] - XF
total = t + XF
mix = ';'.join(parts) + ';' + ''.join(f'[v{i}]' for i in range(len(sc))) + f'amix=inputs={len(sc)}:normalize=0,apad=whole_dur={total:.2f},loudnorm=I=-16:TP=-1.5:LRA=11[out]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', mix, '-map', '[out]', '-ar', '44100', '-ac', '1', os.path.join(D, 'voice.wav')], check=True)
print('total', round(total, 2), 'sec')
