const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const dir = path.join(__dirname, 'scenes');
  const only = process.argv[2];
  const scenes = JSON.parse(fs.readFileSync(path.join(dir, 'scenes.json')));
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const s of scenes) {
    if (only && !only.split(',').includes(s.name)) continue;
    await p.goto('file://' + path.join(dir, s.name + '.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(dir, s.name + '.png') });
  }
  await b.close();
})();
