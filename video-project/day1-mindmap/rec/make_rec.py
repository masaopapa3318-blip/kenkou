import sys, pathlib
base = pathlib.Path('/home/user/kenkou/video-project/day1-mindmap')
days = [(1, 'tenkyu-mindmap.html'), (2, 'tenkyu-day2-mindmap.html'), (3, 'tenkyu-day3-mindmap.html')]

CSS = """
/* 収録用：左にマインドマップ、右にいま話す枝の台本 */
.body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(340px, 44%); }
.body .stage { min-height: 0; }
.prompter { min-width: 0; min-height: 0; overflow: auto; border-left: 1px solid var(--line); background: var(--surface);
  padding-block: 20px 48px; padding-left: 24px; padding-right: max(20px, env(safe-area-inset-right, 0px)); }
.pr-top { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: baseline; justify-content: space-between; }
.pr-count { font-size: .8rem; letter-spacing: .14em; color: var(--muted); font-variant-numeric: tabular-nums; }
.pr-size { display: flex; gap: 6px; }
.pr-size button { font: inherit; font-size: .8rem; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); cursor: pointer; }
.pr-title { margin: 8px 0 2px; font-family: var(--serif); font-weight: 800; font-size: 1.5em; line-height: 1.4; color: var(--pc, var(--ink)); text-wrap: balance; }
.pr-time { margin: 0; font-size: .85rem; color: var(--muted); }
.pr-screen { margin: 12px 0 18px; padding: 8px 12px; border-radius: 8px; background: var(--bg); font-size: .85rem; color: var(--muted); }
.pr-text { font-size: var(--fs, 21px); line-height: 1.95; }
.pr-text p { margin: 0 0 1em; }
.pause { display: inline-block; margin: 0 .25em; padding: 0 .5em; border-radius: 6px; font-size: .78em; line-height: 1.6; vertical-align: .08em;
  background: color-mix(in srgb, var(--pc, var(--b6)) 18%, transparent); color: var(--pc, var(--ink)); font-weight: 700; }
.cue { padding: 10px 14px; border: 2px dashed var(--pc, var(--line)); border-radius: 10px; font-weight: 700; font-size: .9em; }
.note { font-size: .78em; color: var(--muted); }
.pr-nav { display: flex; gap: 8px; margin-top: 8px; }
.pr-nav button { font: inherit; font-size: .9rem; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); cursor: pointer; }
.pr-nav button.main { background: var(--root); color: var(--root-ink); border-color: var(--root); }
.rec-badge { display: inline-block; margin-right: 8px; padding: 1px 8px; border-radius: 999px; font-size: .7rem; letter-spacing: .1em; background: var(--b9); color: #fff; vertical-align: 1px; }
@media (max-width: 820px) {
  .body { grid-template-columns: 1fr; grid-template-rows: 38% minmax(0, 1fr); }
  .prompter { border-left: 0; border-top: 1px solid var(--line); padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
}
"""

JS = """
// ---- 収録用：台本パネル ----
const PR = document.getElementById('prompter');
function esc(s) { return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function line(p) {
  if (p.startsWith('【')) return `<p class="cue">${esc(p)}</p>`;
  if (p.startsWith('※')) return `<p class="note">${esc(p)}</p>`;
  return `<p>${esc(p).replace(/（間）/g, '<span class="pause">間</span>')}</p>`;
}
function showScript(i) {
  const nav = `<div class="pr-nav"><button type="button" data-go="prev">◀ 前の枝</button><button type="button" class="main" data-go="next">次の枝 ▶</button></div>`;
  const size = `<div class="pr-size"><button type="button" data-size="-1" aria-label="文字を小さく">文字 小</button><button type="button" data-size="1" aria-label="文字を大きく">文字 大</button></div>`;
  if (i < 0) {
    PR.style.removeProperty('--pc');
    PR.innerHTML = `<div class="pr-top"><span class="pr-count">${DAYLABEL}　収録用</span>${size}</div>
      <h2 class="pr-title">収録の準備ができました</h2>
      <div class="pr-text"><p>「次の枝を開く」を押すと、左のマインドマップと、この台本が一緒に進みます。</p>
      <p>「<span class="pause">間</span>」のところで、2〜3秒だまります。</p>
      <p class="note">このページは収録用です。受講生には、ふつうのマインドマップのページを見せてください。</p></div>${nav}`;
    return;
  }
  const s = SCRIPT[i];
  PR.style.setProperty('--pc', cssVar(DATA.c[i].color));
  PR.innerHTML = `<div class="pr-top"><span class="pr-count">${DAYLABEL}　${i + 1} / ${SCRIPT.length}</span>${size}</div>
    <h2 class="pr-title">${esc(s.t)}</h2><p class="pr-time">${esc(s.m)}</p>
    <p class="pr-screen">画面：${esc(s.s)}</p>
    <div class="pr-text">${s.p.map(line).join('')}</div>${nav}`;
  PR.scrollTop = 0;
}
function goTo(i) {
  step = (i + DATA.c.length) % DATA.c.length;
  DATA.c.forEach((b, k) => { if (k === step) openAll(b); else closeAll(b); });
  render();
  const b = DATA.c[step], stage = document.getElementById('stage');
  let top = b.y - b.b.h / 2;
  (function minY(n) { top = Math.min(top, n.y - n.b.h / 2); if (n.open) (n.c || []).forEach(minY); })(b);
  stage.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'smooth' });
  showScript(step);
}
// 「次の枝を開く」と「はじめに戻す」を、台本と一緒に動くものに置きかえる
for (const id of ['btn-next', 'btn-reset']) { const o = document.getElementById(id); o.replaceWith(o.cloneNode(true)); }
document.getElementById('btn-next').addEventListener('click', () => goTo(step + 1));
document.getElementById('btn-reset').addEventListener('click', () => { step = -1; DATA.c.forEach(b => closeAll(b)); render(); document.getElementById('stage').scrollTo({ top: 0, left: 0 }); showScript(-1); });
PR.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { goTo(g.dataset.go === 'next' ? step + 1 : (step < 0 ? DATA.c.length - 1 : step - 1)); return; }
  const z = e.target.closest('[data-size]'); if (z) { setSize(fs + (+z.dataset.size) * 2); }
});
document.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input, textarea')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goTo(step + 1); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(step < 0 ? DATA.c.length - 1 : step - 1); }
});
// 枝をタップして開いたときも、その枝の台本を出す
const baseToggle = toggleNode;
toggleNode = function (n) {
  baseToggle(n);
  if (n.depth === 1 && n.open) { step = DATA.c.indexOf(n); showScript(step); }
};
// 文字の大きさ（この端末だけに覚えておく）
let fs = 21;
function setSize(v) { fs = Math.max(15, Math.min(34, v)); PR.style.setProperty('--fs', fs + 'px'); try { localStorage.setItem('rec-fs', fs); } catch (e) {} }
try { const v = +localStorage.getItem('rec-fs'); if (v) fs = v; } catch (e) {}
setSize(fs);
showScript(-1);
"""

for n, src in days:
    s = (base / src).read_text(encoding='utf8')
    script = (base / 'rec' / f'day{n}-script.js').read_text(encoding='utf8')
    label = {1: 'Day1「知る」', 2: 'Day2「実践して育てる」', 3: 'Day3「伝える」'}[n]
    title_old = f'<title>天給自足 Day{n} マインドマップ</title>'
    assert title_old in s
    s = s.replace(title_old, f'<title>天給自足 Day{n} 収録用</title>')
    s = s.replace('</style>\n\n<div class="app">', CSS + '</style>\n\n<div class="app">', 1)
    old_stage = '<div class="stage" id="stage"><svg id="map" role="img" aria-label="天給自足 Day%d マインドマップ"></svg></div>' % n
    assert old_stage in s, n
    s = s.replace(old_stage, '<div class="body">' + old_stage + '<aside class="prompter" id="prompter" aria-live="polite"></aside></div>')
    s = s.replace('      <h1>自給自足ではなく、「天給自足」</h1>', '      <h1><span class="rec-badge">収録用</span>自給自足ではなく、「天給自足」</h1>', 1)
    assert s.count('\n</script>') == 1
    s = s.replace('\n</script>', '\n' + script + f'\nconst DAYLABEL = "{label}";\n' + JS + '</script>', 1)
    out = base / 'rec' / f'tenkyu-day{n}-rec.html'
    out.write_text(s, encoding='utf8')
    print('wrote', out)
