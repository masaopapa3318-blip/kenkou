# そよ風のような軽やかなBGMを、音源を使わずに合成する（著作権の心配がないオリジナル曲）
# 構成：やわらかいパッド＋つま弾くようなアルペジオ＋ときどき鈴の音＋風の音
import numpy as np, wave, sys

SR = 44100
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 195.0
OUT = sys.argv[2] if len(sys.argv) > 2 else 'bgm.wav'
BPM = 84
BEAT = 60 / BPM
rng = np.random.default_rng(7)
n = int(SR * DUR)
L = np.zeros(n); R = np.zeros(n)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y

def add(sig, start, pan=0.0, gain=1.0):
    s = int(start * SR)
    if s >= n: return
    e = min(n, s + len(sig)); sig = sig[:e - s] * gain
    L[s:e] += sig * np.sqrt((1 - pan) / 2); R[s:e] += sig * np.sqrt((1 + pan) / 2)

def pluck(freq, dur=2.4):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 2.6) * (1 - np.exp(-t * 400))
    tone = sum(np.sin(2 * np.pi * freq * k * t) / k ** 1.6 for k in range(1, 6))
    return tone * env

def bell(freq, dur=3.5):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 1.6) * (1 - np.exp(-t * 300))
    return (np.sin(2 * np.pi * freq * t) + .35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 3)) * env

def pad(freqs, dur):
    t = np.arange(int(SR * dur)) / SR
    att = np.minimum(1, t / 1.2); rel = np.minimum(1, (dur - t) / 1.2)
    sig = sum(np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.003 * t) + .3 * np.sin(2 * np.pi * f * 2 * t) for f in freqs)
    return sig * att * rel / len(freqs)

# 和音進行（ニ長調）：D - A - Bm - G、ときどき Em - A
prog = [[50, 57, 62, 66], [45, 57, 61, 64], [47, 54, 62, 66], [43, 55, 62, 67],
        [50, 57, 62, 66], [45, 57, 61, 64], [40, 55, 59, 64], [45, 57, 61, 64]]
bar = 4 * BEAT
nbars = int(DUR / bar) + 1
melody = [74, 76, 78, 76, 73, 74, 71, 69]
for b in range(nbars):
    t0 = b * bar
    ch = prog[b % len(prog)]
    add(pad([midi(m) for m in ch[1:]], bar + 1.2), t0, 0, 0.10)
    add(pad([midi(ch[0] - 12)], bar + 1.2), t0, 0, 0.12)
    # 8分音符のアルペジオ（最初の4小節は控えめに入る）
    arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12]
    for k, m in enumerate(arp):
        g = 0.09 if b >= 2 else 0.05
        add(pluck(midi(m)), t0 + k * BEAT / 2 + rng.normal(0, .004), pan=(-.4 if k % 2 else .4), gain=g * (1.0 if k % 4 == 0 else .75))
    # ときどき鈴の音でメロディ
    if b >= 4 and b % 2 == 0:
        add(bell(midi(melody[(b // 2) % len(melody)])), t0 + BEAT * 0.5, pan=.2, gain=.06)
        add(bell(midi(melody[(b // 2 + 3) % len(melody)])), t0 + BEAT * 2.5, pan=-.2, gain=.045)

# 風の音（ゆっくり強弱する、やわらかいノイズ）
noise = lowpass(lowpass(rng.normal(0, 1, n), 500), 500)
noise /= np.max(np.abs(noise))
t = np.arange(n) / SR
swell = 0.5 + 0.5 * np.sin(2 * np.pi * t / 11.0) * np.sin(2 * np.pi * t / 29.0)
wind = noise * swell * 0.05
L += wind; R += np.roll(wind, 900)

# 全体の音量を整え、最初と最後をフェード
mix = np.stack([L, R], axis=1)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.7
fade_in = np.minimum(1, t / 2.5); fade_out = np.minimum(1, (DUR - t) / 4.0)
mix *= (fade_in * fade_out)[:, None]
pcm = (mix * 32767).astype(np.int16)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', OUT, DUR, 'sec')
