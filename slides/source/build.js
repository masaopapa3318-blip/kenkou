// 天給自足実践塾 プレゼン — リデザイン版
const path = require("path");
const fs = require("fs");
const SP = "/tmp/claude-0/-home-user-kenkou/6a3d5870-3f22-5ba0-84e0-7dbac2216fcb/scratchpad/node_modules/";
const pptxgen = require(SP + "pptxgenjs");
const sharp = require(SP + "sharp");
const React = require(SP + "react");
const RDS = require(SP + "react-dom/server");
const FA = require(SP + "react-icons/fa");
const GI = require(SP + "react-icons/gi");
const PI = require(SP + "react-icons/pi");
const { applyTheme } = require("/root/.claude/skills/synced/76e97d8a-1ebb-49d2-8b1e-20f57a91e743_0da0ab0e-0cbb-40d4-9f9a-30123d721499/pptx/scripts/apply_theme.js");

const W = 13.333, H = 7.5;
const F = "BIZ UDPGothic", M = "BIZ UDPMincho";
const DG = "1E4D3A", LG = "5E9E5A", PG = "EEF5EA", GD = "E8A33D", PGD = "FBF0DC",
  CR = "C8502F", TX = "2B2B2B", MU = "666666", LN = "D8DED4", WH = "FFFFFF", SOFT = "F6F8F4";

const THEME = {
  name: "天給自足 Dawn",
  headFontFace: F, bodyFontFace: F,
  colors: { dk1: TX, lt1: WH, dk2: DG, lt2: PG, accent1: LG, accent2: GD, accent3: CR,
    accent4: "8BBF7A", accent5: "7A6A53", accent6: "3E7C9B", hlink: "3E7C9B", folHlink: "7A6A53" },
};

const IMG = "/root/work/img/", GEN = "/root/work/gen/";
const warnings = [];

// ---------- helpers ----------
const sh = () => ({ type: "outer", color: "000000", opacity: 0.13, blur: 10, offset: 2, angle: 90 });
function units(s) { let u = 0; for (const ch of s) u += ch.charCodeAt(0) < 0x2000 ? 0.55 : 1; return u; }
function estH(text, w, pt, ls = 1.35) {
  const paras = String(text).split("\n");
  const per = Math.max(1, (w - 0.15) / (pt / 72));
  let lines = 0; for (const p of paras) lines += Math.max(1, Math.ceil(units(p) / per));
  return lines * pt * ls / 72 + 0.1;
}
function T(s, text, o) {
  const opts = Object.assign({ fontFace: F, color: TX, fontSize: 16, margin: 0.05, valign: "top", isTextBox: true, lineSpacingMultiple: 1.2 }, o);
  if (typeof text === "string" && !o.noCheck) {
    const need = estH(text, opts.w, opts.fontSize, 1.2 * 1.15);
    if (need > opts.h + 0.05) warnings.push(`[slide ${s._n}] maybe overflow (${need.toFixed(2)} > ${opts.h}): ${text.slice(0, 30)}`);
  }
  delete opts.noCheck;
  s.addText(text, opts);
}
function box(s, x, y, w, h, fill, o = {}) {
  s.addShape("roundRect", Object.assign({ x, y, w, h, rectRadius: o.r ?? 0.12, fill: { color: fill, transparency: o.tr || 0 },
    line: o.line ? { color: o.line, width: o.lw || 1 } : { type: "none" }, shadow: o.shadow ? sh() : undefined }, {}));
}
function circ(s, x, y, d, fill, o = {}) {
  s.addShape("ellipse", { x, y, w: d, h: d, fill: { color: fill, transparency: o.tr || 0 }, line: o.line ? { color: o.line, width: o.lw || 1.5 } : { type: "none" }, shadow: o.shadow ? sh() : undefined });
}
const iconCache = {};
async function icon(Comp, color, px = 256) {
  const key = Comp.name + color;
  if (iconCache[key]) return iconCache[key];
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: px }));
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return (iconCache[key] = "image/png;base64," + buf.toString("base64"));
}
async function iconC(s, Comp, x, y, d, bg, fg, ratio = 0.52) {
  circ(s, x, y, d, bg);
  const id = d * ratio;
  s.addImage({ data: await icon(Comp, fg), x: x + (d - id) / 2, y: y + (d - id) / 2, w: id, h: id });
}
async function photo(s, file, x, y, w, h, o = {}) {
  const r = o.r ?? 0.14, pxw = Math.round(w * 160), pxh = Math.round(h * 160);
  const png = !!o.png, bg = o.bg || WH;
  const out = GEN + "p_" + path.basename(file, path.extname(file)) + `_${pxw}x${pxh}_${png ? "a" : bg}.` + (png ? "png" : "jpg");
  if (!fs.existsSync(out)) {
    let img = sharp(IMG + file).rotate().resize(pxw, pxh, { fit: "cover", position: o.pos || "attention" });
    const rr = Math.round(r * 160);
    const mask = Buffer.from(`<svg width="${pxw}" height="${pxh}"><rect x="0" y="0" width="${pxw}" height="${pxh}" rx="${rr}" ry="${rr}"/></svg>`);
    const rounded = await img.composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    if (png) await sharp(rounded).png({ compressionLevel: 9 }).toFile(out);
    else await sharp(rounded).flatten({ background: "#" + bg }).jpeg({ quality: 84 }).toFile(out);
  }
  s.addImage({ path: out, x, y, w, h, shadow: o.shadow === false ? undefined : sh() });
}
function kicker(s, text, dark) {
  T(s, text, { x: 0.6, y: 0.3, w: 9, h: 0.34, fontSize: 13, bold: true, color: dark ? GD : LG, charSpacing: 1 });
}
function note(s, n) { if (n) s.addNotes(n); }

// ---------- deck ----------
(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "天給自足実践塾 未来創造プラン";
  pres.author = "藤巻正夫";
  pres.theme = { headFontFace: F, bodyFontFace: F };

  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: WH },
    objects: [
      { text: { text: "天給自足実践塾 ｜ 藤巻正夫", options: { x: 0.6, y: 7.02, w: 6, h: 0.3, fontFace: F, fontSize: 10, color: "8A8F86", margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.62, w: 12.1, h: 0.82, fontFace: F, fontSize: 30, bold: true, color: DG, valign: "middle", align: "left", margin: 0.05 }, text: "" } },
    ],
    slideNumber: { x: 12.15, y: 7.02, w: 0.6, h: 0.3, fontFace: F, fontSize: 10, color: "8A8F86", align: "right" },
  });
  pres.defineSlideMaster({
    title: "DARK",
    background: { path: GEN + "dawn.jpg" },
    objects: [],
    slideNumber: { x: 12.15, y: 7.02, w: 0.6, h: 0.3, fontFace: F, fontSize: 10, color: "B9C9BF", align: "right" },
  });
  pres.defineSlideMaster({ title: "PHOTO", background: { color: DG }, objects: [] });

  let n = 0;
  let curSection = "";
  const add = (master, section) => {
    if (section && section !== curSection) { pres.addSection({ title: section }); curSection = section; }
    const s = pres.addSlide({ masterName: master, sectionTitle: curSection });
    s._n = ++n; return s;
  };
  const title = (s, t) => s.addText(t, { placeholder: "title" });

  // ===== 1. 表紙 =====
  {
    const s = add("PHOTO", "オープニング");
    s.addImage({ path: IMG + "s01_61dbc221.jpg", x: 0, y: -0.05, w: W, h: W * 900 / 1352, sizing: { type: "cover", w: W, h: H } });
    s.addImage({ path: GEN + "overlay_top.png", x: 0, y: 0, w: W, h: H });
    T(s, "天給自足実践塾の学びを未来に活かす", { x: 0.9, y: 0.75, w: 11.5, h: 0.5, fontSize: 20, bold: true, color: "F6D58E", align: "center" });
    T(s, "まっちゃんの未来創造プラン", { x: 0.9, y: 1.3, w: 11.5, h: 1.2, fontFace: M, fontSize: 54, color: WH, align: "center", valign: "middle" });
    T(s, "天給自足、発酵食と自然農、野草、きのこ ―― 一生モノの食のスキルを\nこれからの生活に連動し、どう活かすか", { x: 1.4, y: 2.6, w: 10.5, h: 1.0, fontSize: 18, color: WH, align: "center" });
    box(s, 3.4, 3.85, 6.53, 0.56, WH, { r: 0.28, tr: 15 });
    T(s, "日本の食文化・伝統文化・徳文化をいかに伝承するか", { x: 3.4, y: 3.85, w: 6.53, h: 0.56, fontSize: 16, bold: true, color: DG, align: "center", valign: "middle" });
    note(s, "このタイトルを見て、いいなと思ったところ教えてもらえますか？\nなぜですか？");
  }

  // ===== 2. 本日のセッションにあたって =====
  const msgSlide = async (who, notesExtra) => {
    const s = add("CONTENT", "オープニング");
    kicker(s, "本日の体験セッションを実りあるものにするために");
    title(s, "今日という日は、残りの人生の最初の日です");
    const cards = [
      [FA.FaSun, "輝く未来を描く時間に", `先に天給自足を経験した者として、${who}の人生に必要な応援者になりたいと思っています。`],
      [GI.GiWheat, "世の中を変えるのは「伝承」", "一人ひとりが足元の食を自分で確保しながら、日本の食文化・伝統文化・徳文化を伝承してゆく。食の復活が日本の復活につながります。"],
      [FA.FaCompass, "人生の質は、選択の質", `一生モノの食のスキル（天給自足）を、これから${who}がどう活かすか。いっしょに考える時間にしましょう。`],
    ];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 4.1;
      box(s, x, 1.75, 3.85, 3.95, SOFT, { shadow: true });
      await iconC(s, cards[i][0], x + 0.35, 2.05, 0.9, DG, GD);
      T(s, cards[i][1], { x: x + 0.3, y: 3.1, w: 3.3, h: 0.85, fontSize: 20, bold: true, color: DG, valign: "top" });
      T(s, cards[i][2], { x: x + 0.3, y: 3.95, w: 3.3, h: 1.65, fontSize: 16, color: TX });
    }
    box(s, 0.6, 5.95, 12.1, 0.8, DG, { r: 0.4 });
    T(s, [{ text: "人生の主役は、自分自身です。", options: { bold: true, color: WH } }, { text: "　天給自足は単なるスキルではなく、これからの人生をどう生きるかの選択です。", options: { color: "DDE8DF" } }],
      { x: 0.9, y: 5.95, w: 11.5, h: 0.8, fontSize: 17, valign: "middle", align: "center", noCheck: true });
    note(s, notesExtra);
    return s;
  };
  await msgSlide("まっちゃん", "このタイトルを見て、いいなと思ったところ教えてもらえますか？\nなぜですか？\n\n【元スライドの全文】\n本日の体験セッションを実りあるものにするためにお伝えしたいこと。\nまっちゃんの輝く未来を描くお手伝いの時間にしたいと考えています。先に天給自足を経験した者としてまっちゃんの人生に必要な応援者になりたいと思っています。残りの人生の時間をどう創るか、和多志は本来の日本の食の復活が日本全体の復活につながると考えています。今日という日は残りの人生の最初の日です。有意義な楽しい時間にしましょう。\n現在、わたしは世の中を変えるには二つしかないとの思いに至りました。武力か伝承かです。政治家、教育者、医者、ジャーナリスト、インフルエンサーに任せていても世の中は良くなりませんでした。81年以上日本を弱体化するための政策等を伝承してきていまの日本があります。すべての人がまず足元の自分の食は自分で確保しながら日本の食文化、伝統文化、徳文化を伝承してゆくしかないと思います。人生の質は選択の質です。自分によりしっくりくる、勇気が湧いてくる、自分を後押ししてくれる選択、一生モノの食のスキル（天給自足）を習得しこれからまっちゃんが、どう活かすかをいっしょに考える時間に出来たらと思います。天給自足は単なるスキルではありません、これからの自分の人生をどう生きてゆきたいか？人生の主役は自分自身です。少しでもお役に立つお話出来たら幸いです。よろしくお願い致します。");

  // ===== 章扉 =====
  const divider = (num, t, sub, section) => {
    const s = add("DARK", section);
    T(s, num, { x: 0.9, y: 1.7, w: 3, h: 1.2, fontFace: M, fontSize: 72, color: GD, noCheck: true });
    T(s, t, { x: 0.9, y: 2.95, w: 11, h: 1.0, fontFace: M, fontSize: 44, color: WH, noCheck: true });
    T(s, sub, { x: 0.9, y: 4.05, w: 10, h: 0.6, fontSize: 20, color: "CFE0D3" });
    return s;
  };

  // ===== わたしについて =====
  divider("01", "わたしについて", "天の恵みを活かして、美味しく健康に", "わたしについて");
  {
    const s = add("CONTENT", "わたしについて");
    kicker(s, "自己紹介");
    title(s, "藤巻正夫（Masao Fujimaki）");
    await photo(s, "s03_d17d980d.jpg", 0.6, 1.7, 3.3, 4.5, { pos: "north" });
    T(s, "天の恵みを活かして、美味しく健康に！", { x: 0.6, y: 6.3, w: 4.2, h: 0.4, fontSize: 14, bold: true, color: LG });
    const rows = [[FA.FaBirthdayCake, "生年月日", "1958年1月8日"], [FA.FaMapMarkerAlt, "出身", "新潟県柏崎市"], [FA.FaUsers, "家族", "妻、長男、長女"],
      [FA.FaHome, "住まい", "長野県諏訪郡"], [FA.FaDrum, "趣味", "西アフリカの太鼓、きのこ狩り、山菜摘み、美味しいものを作り楽しむ"]];
    let y = 1.75;
    for (const [ic, k, v] of rows) {
      await iconC(s, ic, 4.3, y, 0.5, PG, LG);
      T(s, k, { x: 4.95, y: y + 0.05, w: 1.3, h: 0.4, fontSize: 15, bold: true, color: MU, valign: "middle" });
      const hh = k === "趣味" ? 0.75 : 0.4;
      T(s, v, { x: 6.25, y: y + 0.05, w: 2.6, h: hh, fontSize: 16, color: TX, valign: k === "趣味" ? "top" : "middle" });
      y += k === "趣味" ? 0.95 : 0.68;
    }
    box(s, 9.1, 1.7, 3.6, 5.0, DG, { shadow: true });
    T(s, "志・ミッション", { x: 9.4, y: 1.95, w: 3, h: 0.4, fontSize: 15, bold: true, color: GD });
    T(s, "天給自足伝承者、\n講師を養成する", { x: 9.4, y: 2.4, w: 3.1, h: 1.3, fontFace: M, fontSize: 26, color: WH });
    T(s, "天給自足と醗酵で食を楽しみ健康に。ひとり一人の持ち味を活かすための食創りと、日本伝統文化の伝承復活。", { x: 9.4, y: 4.0, w: 3.05, h: 2.4, fontSize: 16, color: "DDE8DF" });
    note(s, "最初に自己紹介させてください。\nこれを見て共通点ってありますか？（そういう方をサポートしたいと思っています。）\n\n今回ご提案するプランは、これまでの僕の人生やキャリアがベースになって作られているので、それをご紹介させてください。\n今でこそセールスコーチをやらせていただいていますが、実は・・・・");
  }

  // 歩みスライド共通: ステップ（縦の流れ）
  const journeyTrack = (s, idx) => {
    const labels = ["上京", "渡欧", "横浜レジオン", "講師", "八ヶ岳"];
    const x0 = 8.3;
    for (let i = 0; i < 5; i++) {
      const on = i === idx;
      box(s, x0 + i * 0.9, 0.3, 0.82, 0.32, on ? GD : PG, { r: 0.16 });
      T(s, labels[i], { x: x0 + i * 0.9, y: 0.3, w: 0.82, h: 0.32, fontSize: 10, bold: on, color: on ? WH : LG, align: "center", valign: "middle", margin: 0, noCheck: true });
    }
  };
  const steps = (s, items, x, y, w, gap = 0.18) => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const hl = it.hl;
      const fs_ = it.fs || 17;
      const h = Math.max(0.55, estH(it.t, w - 0.85, fs_, 1.38) + 0.12);
      box(s, x, y, w, h, hl ? PGD : SOFT);
      circ(s, x + 0.18, y + h / 2 - 0.2, 0.4, hl ? GD : LG);
      T(s, it.n || String(i + 1), { x: x + 0.18, y: y + h / 2 - 0.2, w: 0.4, h: 0.4, fontSize: 12, bold: true, color: WH, align: "center", valign: "middle", margin: 0, noCheck: true });
      T(s, it.t, { x: x + 0.75, y, w: w - 0.85, h, fontSize: fs_, bold: !!hl, color: hl ? "7A4A0B" : TX, valign: "middle" });
      y += h + gap;
    }
    return y;
  };

  {
    const s = add("CONTENT", "わたしについて");
    kicker(s, "わたしの歩み ①"); journeyTrack(s, 0);
    title(s, "18歳で上京、食の道へスタート");
    steps(s, [{ t: "世界の洋菓子を創る店「ヒサモト」「菓歩区」で修行", n: "18" }, { t: "職人人生へ。24歳でオーボンヴュータンのスーシェフに", n: "24" },
      { t: "26歳、人間関係の壁の解決と、さらなる高みをめざし渡欧", n: "26", hl: true }, { t: "31歳で帰国", n: "31" }], 0.6, 1.8, 6.6, 0.25);
    T(s, "※丸の数字は年齢", { x: 0.6, y: 6.55, w: 3, h: 0.3, fontSize: 11, color: MU });
    await photo(s, "s04_1569ad0f.jpg", 7.6, 1.8, 5.1, 4.6);
    note(s, "アウトレットとか、デパートとか、ショッピングモールでクレジットカードの営業見たことありません？\nセールスから逃げた");
  }
  {
    const s = add("CONTENT", "わたしについて");
    kicker(s, "わたしの歩み ②"); journeyTrack(s, 1);
    title(s, "渡欧 ― スイス・フランスで4年4か月の修行");
    steps(s, [{ t: "スイス：ホテル・ボーリバージュパラス・ローザンヌで1年間修業", n: "CH", fs: 16 },
      { t: "フランス：料理・デザートを知るため、ミシュラン三ツ星・二ツ星、パティスリーで約3年", n: "FR", fs: 16 },
      { t: "重要な食のあり方に氣づく", n: "!", fs: 16 },
      { t: "帰国後、田舎に帰り「自然に根ざした食創り」の豊かさは、三ツ星以上だと氣づく", n: "★", hl: true, fs: 16 }], 0.6, 1.75, 7.2, 0.2);
    await photo(s, "s05_cb3e8430.jpg", 8.2, 1.75, 4.5, 2.4);
    await photo(s, "s05_2e78bf08.jpg", 8.2, 4.35, 4.5, 2.4);
  }
  {
    const s = add("CONTENT", "わたしについて");
    kicker(s, "わたしの歩み ③"); journeyTrack(s, 2);
    title(s, "横浜レジオン時代");
    T(s, "横浜都筑区センター北に自店をオープン", { x: 0.6, y: 1.65, w: 7.4, h: 0.45, fontSize: 18, bold: true, color: TX });
    const stats = [["21", "年間", "お店を営業"], ["15", "年間", "フランス菓子教室"], ["15", "年間", "パン教室"]];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 2.5;
      box(s, x, 2.25, 2.3, 2.0, SOFT, { shadow: true });
      T(s, [{ text: stats[i][0], options: { fontSize: 54, bold: true, color: DG } }, { text: stats[i][1], options: { fontSize: 18, bold: true, color: DG } }],
        { x, y: 2.35, w: 2.3, h: 1.1, align: "center", valign: "middle", noCheck: true });
      T(s, stats[i][2], { x, y: 3.5, w: 2.3, h: 0.45, fontSize: 16, color: MU, align: "center" });
    }
    steps(s, [{ t: "自分で野菜作りから始める教室をスタート", n: "→" }, { t: "生ゴミを畑に返す自然農を始める", n: "→", hl: true }], 0.6, 4.55, 7.4, 0.2);
    await photo(s, "s06_cf5a15cb.jpg", 8.4, 1.65, 4.3, 5.1, { pos: "centre" });
    note(s, "ペライチってご存知ですか？");
  }
  {
    const s = add("CONTENT", "わたしについて");
    kicker(s, "わたしの歩み ④"); journeyTrack(s, 3);
    title(s, "講師として");
    const items = [[GI.GiSprout, "天給自足・ポタジェ作り・野草を生活に落とし込む"], [GI.GiBread, "米で作るフランス菓子・米パン、醗酵実践塾、乾物活用"]];
    let y = 1.75;
    for (const [ic, t] of items) {
      await iconC(s, ic, 0.6, y, 0.7, PG, LG);
      T(s, t, { x: 1.5, y, w: 4.5, h: 0.75, fontSize: 17, valign: "middle" });
      y += 0.95;
    }
    box(s, 0.6, 3.8, 5.4, 1.15, PGD);
    T(s, [{ text: "一生モノのスキルとマインドを伝える", options: { bold: true, color: "7A4A0B", breakLine: true } }], { x: 0.85, y: 3.8, w: 5.0, h: 1.15, fontSize: 18, valign: "middle", noCheck: true });
    box(s, 0.6, 5.15, 5.4, 1.4, DG);
    T(s, "好きで得意なことで社会貢献できる講師を増やす", { x: 0.85, y: 5.15, w: 5.0, h: 1.4, fontSize: 19, bold: true, color: WH, valign: "middle" });
    await photo(s, "s07_ace14c89.jpg", 6.4, 1.75, 6.3, 4.8);
    note(s, "「このプランはこうしてできたあったんですがここまで聞いてみて共通点とか、共感できるポイントってありましたか？」\n\n「ではみなさん受けたらどう変わっているのかとのを、分かりやすく表にまとめました・・・」");
  }
  {
    const s = add("CONTENT", "わたしについて");
    kicker(s, "わたしの歩み ⑤"); journeyTrack(s, 4);
    title(s, "横浜レジオンから八ヶ岳へ ― 志の変化");
    const rows = [["新宿高島屋への出店、結婚式のウエディング商品作り", "幸せ作りに貢献"],
      ["常に季節を意識した商品創りでオリジナリティを磨く", "楽しさ、美味しさ作り"],
      ["プロ向けの共著2冊を出版、料理新聞社の表紙を2年間担当", "広く幸せを広める活動で業界に貢献"],
      ["八ヶ岳で食の安全安心、天給自足の重要性に氣づき活動", "健康になるための食作り、伝承者・講師を増やす事が志に"]];
    let y = 1.7;
    for (let i = 0; i < rows.length; i++) {
      const last = i === 3;
      const h = last ? 1.25 : 1.05;
      box(s, 0.6, y, 4.6, h, last ? PGD : SOFT);
      T(s, rows[i][0], { x: 0.8, y, w: 4.3, h, fontSize: 15, valign: "middle" });
      s.addImage({ data: await icon(FA.FaArrowRight, last ? GD : LG), x: 5.35, y: y + h / 2 - 0.18, w: 0.36, h: 0.36 });
      box(s, 5.85, y, 3.5, h, last ? GD : DG);
      T(s, rows[i][1], { x: 6.0, y, w: 3.25, h, fontSize: 16, bold: true, color: WH, valign: "middle" });
      y += h + 0.15;
    }
    await photo(s, "s08_88a55a6e.jpg", 9.75, 1.7, 2.95, 2.45, { pos: "centre" });
    await photo(s, "s08_1c68a53a.jpg", 9.75, 4.35, 2.95, 2.45, { pos: "centre" });
    note(s, "なんでやったかというと、お金を稼げたかったから。\nメンタル的にきついっていうイメージありませんか？");
  }

  // ===== 天給自足実践塾とは =====
  divider("02", "天給自足実践塾とは", "季節の恵みを活かす、一生モノのスキル", "天給自足実践塾とは");
  {
    const s = add("CONTENT", "天給自足実践塾とは");
    kicker(s, "Before → After");
    title(s, "天給自足実践塾を受けると、どんな変化があるの？");
    // Before
    box(s, 0.6, 1.65, 5.3, 5.15, "F1F1EF");
    T(s, "Before", { x: 0.85, y: 1.75, w: 3, h: 0.5, fontSize: 22, bold: true, color: "8A8A8A" });
    const bef = [{ text: "醗酵", options: { bold: true, color: MU, fontSize: 17, breakLine: true } },
      ...["醗酵のすばらしさがわからない", "味噌などの本物の調味料を作っていない", "本物の漬物を作ることができない", "多くの醗酵食を理解、実践できていない"].map(t => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true } })),
      { text: "天給自足", options: { bold: true, color: MU, fontSize: 17, breakLine: true, paraSpaceBefore: 6 } },
      ...["自然農の一歩が踏み出せない", "野草の活用、見極めに自信がない", "陸稲、菊芋の作り方がわからない", "きのこ、山菜を楽しめていない", "グルテンフリーお菓子、玄米100％・米粉100％パンを楽しく作れない"].map((t, i, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < a.length - 1 } }))];
    T(s, bef, { x: 0.85, y: 2.3, w: 4.9, h: 4.4, fontSize: 16, color: "555555", noCheck: true, lineSpacingMultiple: 1.1 });
    // After
    box(s, 7.4, 1.65, 5.3, 5.15, PG, { shadow: true });
    T(s, "After", { x: 7.65, y: 1.75, w: 3, h: 0.5, fontSize: 22, bold: true, color: DG });
    const aft = [{ text: "醗酵", options: { bold: true, color: LG, fontSize: 17, breakLine: true } },
      ...["醗酵食で腸から健康になる", "醗酵実践塾であらゆる発酵の理論と実践を学ぶ", "食の安心安全、食の保存・備蓄を学び伝承する", "発酵調味料での調理を楽しむ"].map(t => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true } })),
      { text: "天給自足", options: { bold: true, color: LG, fontSize: 17, breakLine: true, paraSpaceBefore: 6 } },
      ...["陸稲、野菜作りをスタート", "季節の恵み（きのこ、山菜、野草）を学び、自然に対する畏敬の念を伝承する", "玄米パンやお米のお菓子を作り、加工する楽しさを伝える"].map((t, i, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < a.length - 1 } }))];
    T(s, aft, { x: 7.65, y: 2.3, w: 4.9, h: 4.4, fontSize: 16, color: TX, noCheck: true, lineSpacingMultiple: 1.1 });
    circ(s, 5.75, 3.35, 1.8, GD, { shadow: true });
    T(s, "一生モノの\nスキル", { x: 5.75, y: 3.35, w: 1.8, h: 1.8, fontSize: 15, bold: true, color: WH, align: "center", valign: "middle", noCheck: true });
    note(s, "これを見てみて特にここは自分に必要そう、興味があるなと思うところはありますか？\nこうなれたら嬉しいくないですか？");
  }
  const twoCircles = async (s, a, b, colA, colB, icA, icB) => {
    for (const [i, t, col, ic] of [[0, a, colA, icA], [1, b, colB, icB]]) {
      const x = i === 0 ? 1.6 : 7.75;
      circ(s, x, 2.0, 4.0, col, { tr: 0 , shadow: true});
      await iconC(s, ic, x + 1.55, 2.35, 0.9, WH, col);
      T(s, t, { x: x + 0.35, y: 3.35, w: 3.3, h: 2.0, fontSize: 22, bold: true, color: WH, align: "center", valign: "middle" });
    }
  };
  {
    const s = add("CONTENT", "天給自足実践塾とは");
    kicker(s, "課題");
    title(s, "天給自足がうまくいかない、2つの要因");
    await twoCircles(s, "経験が少ない\n（理論の学び・実践経験が少ない）", "楽しんでできる仲間がいない\n＆\nいつでも聞ける環境がない", "8A8F86", "8A8F86", FA.FaBookOpen, FA.FaUserFriends);
    T(s, "×", { x: 5.9, y: 3.35, w: 1.5, h: 1.3, fontSize: 60, bold: true, color: CR, align: "center", valign: "middle", noCheck: true });
    note(s, "・セールスに罪悪感がある\n・お金を受け取るブロック\n・商品に対する自信のなさ");
  }
  {
    const s = add("CONTENT", "天給自足実践塾とは");
    kicker(s, "解決のカギ");
    title(s, "この2つを「同時に」進めることが必要です");
    T(s, "天給自足、醗酵食を楽しむためには", { x: 0.6, y: 1.45, w: 8, h: 0.4, fontSize: 16, color: MU });
    await twoCircles(s, "季節ごとにする\n作業を知る", "活用し、生活に\n落とし込み実践する", LG, DG, FA.FaCalendarAlt, GI.GiCookingPot);
    T(s, "＋", { x: 5.9, y: 3.35, w: 1.5, h: 1.3, fontSize: 60, bold: true, color: GD, align: "center", valign: "middle", noCheck: true });
  }
  {
    const s = add("DARK", "天給自足実践塾とは");
    kicker(s, "ところが、他のサービスでは・・・", true);
    T(s, "両方を同時に、年間を通して\n学び・楽しみながら問題解決し\n成長できる場所がない。", { x: 0.6, y: 1.0, w: 7.2, h: 2.7, fontFace: M, fontSize: 32, color: WH });
    T(s, "だから、作ります！", { x: 0.6, y: 3.9, w: 7, h: 0.9, fontSize: 40, bold: true, color: GD });
    box(s, 8.4, 1.1, 4.3, 4.9, WH, { tr: 88 , line: "6F8F7C"});
    T(s, "人間は学んだ次の日", { x: 8.6, y: 1.4, w: 3.9, h: 0.45, fontSize: 18, color: "DDE8DF", align: "center" });
    T(s, [{ text: "74", options: { fontSize: 96, bold: true, color: GD } }, { text: "%", options: { fontSize: 40, bold: true, color: GD } }], { x: 8.6, y: 1.9, w: 3.9, h: 1.6, align: "center", valign: "middle", noCheck: true });
    T(s, "を忘れてしまう", { x: 8.6, y: 3.5, w: 3.9, h: 0.45, fontSize: 18, color: "DDE8DF", align: "center" });
    T(s, "だから、いつでも聞ける環境と仲間が必要。1人では限界があります。", { x: 8.75, y: 4.2, w: 3.6, h: 1.5, fontSize: 16, color: WH, align: "center" });
  }
  {
    const s = add("CONTENT", "天給自足実践塾とは");
    kicker(s, "だから天給自足実践塾は・・・");
    title(s, "3つの強みを掛け合わせ、輝く人生へ");
    const cs = [[0.7, 1.75, LG, "50年間で学んだ食（調理・菓子・パン）の技術"], [3.2, 1.75, "3E7C9B", "自然農で陸稲・菊芋等を育て達成してきた、頑張らない天給自足の経験"], [1.95, 4.0, GD, "自分で育てた食材で醗酵食を作り、食の安心安全（備蓄）を伝承してゆく"]];
    for (const [x, y, c, t] of cs) {
      circ(s, x, y, 2.75, c, { tr: 12 });
      T(s, t, { x: x + 0.35, y: y + 0.45, w: 2.05, h: 1.85, fontSize: 14, bold: true, color: WH, align: "center", valign: "middle" });
    }
    s.addImage({ data: await icon(FA.FaArrowRight, DG), x: 6.55, y: 3.65, w: 0.7, h: 0.7 });
    circ(s, 7.6, 1.6, 5.1, PGD, { line: GD, lw: 2 });
    T(s, "天給自足・醗酵で\n家族が最後まで健康で\n楽しい毎日を実現", { x: 8.1, y: 2.3, w: 4.1, h: 1.6, fontSize: 21, bold: true, color: DG, align: "center", valign: "middle" });
    T(s, "伝承者・講師として社会貢献し、\n自分らしく自然を楽しみ\n輝く人生へ", { x: 8.1, y: 3.95, w: 4.1, h: 1.6, fontSize: 17, color: "7A4A0B", align: "center", valign: "top" });
    note(s, "・今の話で何かご質問はありませんか？\n・ワクワクする気持ちになってきましたか？\n・では今度は実際にこのプランで成果を上げたクライアント様を1人ずつ紹介します。");
  }
  {
    const s = add("CONTENT", "天給自足実践塾とは");
    kicker(s, "なぜ講師・伝承者を増やしたいのか");
    title(s, "人に教えると、学びは90％浸透する");
    s.addChart(pres.charts.BAR, [{ name: "学びの浸透率", labels: ["聞いただけ", "アウトプット", "実践", "人に教える"], values: [6, 54, 75, 90] }], {
      x: 0.6, y: 1.65, w: 6.6, h: 5.1, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [LG],
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '0"%"', dataLabelFontSize: 16, dataLabelFontBold: true, dataLabelColor: DG, dataLabelFontFace: "+mn-lt",
      catAxisLabelFontSize: 16, catAxisLabelColor: TX, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valAxisMaxVal: 100, valAxisMinVal: 0,
      valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLineShow: false, barGapWidthPct: 45,
      showTitle: true, title: "学びの浸透率（学び浸透の法則）", titleFontSize: 15, titleColor: MU, titleFontFace: "+mn-lt", showLegend: false,
    });
    box(s, 7.6, 1.65, 5.1, 1.55, SOFT);
    T(s, [{ text: "うすめの法則", options: { bold: true, color: LG, breakLine: true } }, { text: "うなずき・スマイル・メモをしている人ほど、学びがよく浸透します。", options: {} }], { x: 7.85, y: 1.7, w: 4.7, h: 1.45, fontSize: 15, valign: "middle", noCheck: true });
    box(s, 7.6, 3.4, 5.1, 1.95, SOFT);
    T(s, "昨年から受講者に「次の日に講師・伝承者として教える」心構えで参加をお願いしたところ、受講後の翌週に早速講座を開催する方が出てきました。", { x: 7.85, y: 3.45, w: 4.7, h: 1.85, fontSize: 15, valign: "middle" });
    box(s, 7.6, 5.55, 5.1, 1.2, DG);
    T(s, "伝える心構えが、学びを深める", { x: 7.85, y: 5.55, w: 4.7, h: 1.2, fontSize: 19, bold: true, color: WH, valign: "middle" });
    note(s, "「このプランはこうしてできたあったんですがここまで聞いてみて共通点とか、共感できるポイントってありましたか？」\n\n「ではみなさん受けたらどう変わっているのかとのを、分かりやすく表にまとめました・・・」\n\n【元スライド】うすめの法則（学び浸透の法則）うなずき、スマイル、メモをしている人が学びの浸透がいいということです。しかし！聞いただけでは6％、アウトプットして54％、実践して75％、人に教えて90％の学びの浸透なのです！昨年から受講して頂いた方には必ず講師、伝承者として次の日に教えるという心構えで参加してくださいと伝えました。そうしたら、受講後次の週に早速講座を開催して頂ける方が出てきました。伝える心構えの大切さを学びました。");
  }

  // ===== お客様の声 =====
  divider("03", "受講された方の声", "全国、そして海外から学びに来られています", "お客様の声");
  const voice = async (img, role, name, attr, quote, notes, pos, qsize = 22) => {
    const s = add("CONTENT", "お客様の声");
    kicker(s, "お客様の声");
    title(s, role);
    await photo(s, img, 0.6, 1.7, 4.0, 4.6, { pos: pos || "attention" });
    T(s, name, { x: 5.1, y: 1.7, w: 7.6, h: 0.55, fontSize: 24, bold: true, color: TX });
    T(s, attr, { x: 5.1, y: 2.25, w: 7.6, h: 0.45, fontSize: 15, color: MU });
    box(s, 5.1, 2.95, 7.6, 3.8, PG);
    s.addImage({ data: await icon(FA.FaQuoteLeft, GD), x: 5.35, y: 3.15, w: 0.5, h: 0.5 });
    T(s, quote, { x: 5.4, y: 3.75, w: 7.05, h: 2.9, fontSize: qsize, color: DG, noCheck: typeof quote !== "string" });
    note(s, notes);
  };
  await voice("s15_d148145a.jpg", "内科循環器科の医者様ご夫婦でご参加", "清水啓司先生 ＆ 千秋さん", "60歳代 ／ 清水内科循環器医院 経営 ／ 福井県福井市",
    "息子さんがおなかを下しやすい体質とのことで、醗酵食が身体によいとお考えになり参加。今ではいろんな醗酵食を作りアレンジして楽しんでいらっしゃいます。とても喜ばれています。", "", undefined, 19);
  await voice("s16_fcea3cb7.jpg", "料理研究家", "michi kiyono さん", "50代 ／ 料理研究家 ／ 九州から参加",
    "濃く、幸せな、学びの3日間でした。\nシェフの手際を見ながら、実際に手を動かしながら習う発酵食品作りは、本を見て見様見真似で作るのとは全く違う。気付きがたくさんありました。どれもこれも本当に美味しくて、さらに身体にもいいなんて最高。",
    "【ご感想の全文】\nレジオン八ヶ岳で発酵実践塾を受講。濃く、幸せな、学びの3日間でした。\nきっかけは去年こちらで頂いた縄文漬け。今まで食べた漬物とは違う、身体の深いところが喜んでいるような美味しさだったのです。その前にも米粉パンや天然酵母パンを頂いたことがあり、それらもとても美味しくて。連れて行ってくれたサッチーに、レジオンさんで発酵実践塾をされているみたいよ、と聞いてぜひ受講したい！と思ったのが半年前。今回サッチー、ハワイのれいこさん、東京の井出さんも一緒に受講することができました。\n藤巻シェフとまりこさんから直接、少人数で教えて頂ける貴重な体験。シェフの手際を見ながら、実際に手を動かしながら習う発酵食品作りは本を見て見様見真似で作るのとは全く違う。気付きがたくさんありました。動画も頂けるので、家に帰ったら見ながら復習して生活に落とし込みたいと思います。\n発酵実践塾の様子は藤巻シェフがFBにあげてくださったので、私はレジオンさんで今回頂いた発酵食の写真をあげます。どれもこれも本当に美味しくてさらに身体にもいいなんて最高。\n藤巻シェフ、まりこさん、愛あふれる素晴らしい3日間の学びの場を提供してくださりありがとうございました！これからも末永くよろしくお願いいたします", undefined, 18);
  await voice("s17_f2033b8c.jpg", "保育園経営", "野末いずみ さん", "40代 ／ 保育園経営 ／ 神奈川県",
    "いろんな発酵が学べて、楽しい充実した時間でした。\n生活にしっかりと落とし込みたいと思います。", "紹介したお客様の中で「特に自分の似ているな」とか「この人みたいになりたいなって思った方はいませんか？」\n\nではなぜこうしてお客様が一人一人がしっかり成果が出ているかというと、\nそれは今まで説明してきた内容であったり\nまた僕自身がこれまで自分が成果を上げるためにたくさんのことを学んできて、それらを全てクライアント様に伝えられるからなんですね。参考までに今までどんなことを学んできて、何を伝えられるかと", "north", 24);
  await voice("s18_d4ea9a3c.jpg", "機能性医学認定ヘルスコーチ", "あげな れいこ さん", "50代 ／ 機能性医学認定ヘルスコーチ ／ ハワイから参加",
    "『気づきは、はじめの一歩！』を合言葉に、アメリカから機能性医学に基づく最新の個育て改善法＆発達凸凹を消していける情報を発信！\n発酵食をハワイで広げて頂けると思います。\n『ママの笑顔』が私のエネルギーの源です♡", "紹介したお客様の中で「特に自分の似ているな」とか「この人みたいになりたいなって思った方はいませんか？」\n\nではなぜこうしてお客様が一人一人がしっかり成果が出ているかというと、\nそれは今まで説明してきた内容であったり\nまた僕自身がこれまで自分が成果を上げるためにたくさんのことを学んできて、それらを全てクライアント様に伝えられるからなんですね。参考までに今までどんなことを学んできて、何を伝えられるかと", undefined, 18);

  // ===== プログラム内容 =====
  divider("04", "プログラム内容", "50年の経験を、あなたに合わせてオーダーメイドで", "プログラム内容");
  const teachSlide = async (who, pan, sec, notes) => {
    const s = add("CONTENT", sec);
    kicker(s, "50年の経験のすべてを");
    title(s, "天給自足塾でお伝えできること");
    const rows = [[GI.GiCakeSlice, "スイス1年・フランス3年のお菓子作り修行", "修行4年4か月＋50年", "1,000万円〜"],
      [GI.GiCookingPot, "新潟県柏崎農業高等学校 食品化学科で、食の理論と実践を学ぶ ＆ 家庭で簡単にできる糀作り（だき糀作り）", "3年", "30万円〜"],
      [GI.GiSprout, "陸稲（畑のお米づくり）・菌ちゃん農法・自然農・野草塾・きのこ塾・ポタジェ（キッチンガーデン）作り・サバイバル術講座", "1〜5年", "30万円〜"],
      [GI.GiCakeSlice, "お米・玄米で作るフランス菓子講座", "50年", ""],
      [GI.GiBread, pan, "50年", ""],
      [FA.FaGraduationCap, "ビジネススクール", "2年", "100万円"]];
    let y = 1.58;
    for (const [ic, t, p, v] of rows) {
      const h = units(t) > 40 ? 0.74 : 0.5;
      await iconC(s, ic, 0.6, y + h / 2 - 0.22, 0.44, PG, LG);
      T(s, t, { x: 1.2, y, w: 7.5, h, fontSize: 15, valign: "middle" });
      box(s, 8.85, y + h / 2 - 0.19, 2.25, 0.38, PG, { r: 0.19 });
      T(s, p, { x: 8.85, y: y + h / 2 - 0.19, w: 2.25, h: 0.38, fontSize: 12, color: DG, align: "center", valign: "middle", margin: 0 });
      T(s, v, { x: 11.15, y, w: 1.55, h, fontSize: 17, bold: true, color: CR, align: "right", valign: "middle", noCheck: true });
      y += h + 0.06;
    }
    box(s, 0.6, 5.62, 12.1, 1.22, DG);
    T(s, [{ text: "1,160万円相当以上", options: { color: GD, fontSize: 28, bold: true } }, { text: " の学びすべてを、オーダーメイドでサポート", options: { color: WH, fontSize: 22, bold: true } }], { x: 0.9, y: 5.66, w: 11.6, h: 0.62, valign: "middle", noCheck: true });
    T(s, `${who}の必要な時期に、必要なタイミングで、必要な量の学びを随時提供してゆきます。`, { x: 0.9, y: 6.25, w: 11.6, h: 0.5, fontSize: 16, color: "DDE8DF", valign: "middle" });
    note(s, notes);
  };
  const teachNotes = "もし、僕にセールススキルも学びたいし、メンタルブロックも外したいと相談して、僕がじゃあ僕と同じようにここに書いてある講座に全て通ってくださいと言われたらどんなこと思いますか？\n\nそうですよね、みなさんそう言います。\n\nまたセールスなんとかしたいって今すぐ解決したいことですよね？こんな時間かけたくないですよね？\n本当に大事なことはこれらを全て学ぶことではない、\n今ある課題に対して、必要なものを必要な";
  await teachSlide("まっちゃん", "お米・玄米で作るパン講座", "プログラム内容", teachNotes);
  {
    const s = add("CONTENT", "プログラム内容");
    kicker(s, "比較");
    title(s, "他の講座（農業塾・発酵塾）との比較");
    const sym = (v, hl) => {
      const c = { "◎": DG, "○": LG, "△": "C08A1E", "×": "A0A0A0" }[v];
      return { text: v, options: { color: c, bold: v === "◎", fontSize: 20, align: "center", valign: "middle", fill: { color: hl ? PGD : WH } } };
    };
    const head = ["", "農業講座", "各講座\n個別サポート", "無料コンテンツ", "天給自足\nマスタリープラン"].map((t, i) => ({ text: t, options: { bold: true, color: WH, fill: { color: i === 4 ? GD : DG }, align: "center", valign: "middle", fontSize: 15 } }));
    const data = [["サポート", "△", "◎", "×", "◎"], ["オーダーメイド", "×", "○", "×", "◎"], ["再現性", "○", "△", "×", "◎"], ["成果の出るスピード", "△", "△", "×", "◎"],
      ["長期的な成果", "△", "△", "×", "◎"], ["難易度", "○", "○", "○", "○"], ["時間", "×", "○", "◎", "○"], ["コストパフォーマンス", "△", "△", "◎", "◎"]];
    const rows = [head, ...data.map(r => [{ text: r[0], options: { bold: true, color: TX, fontSize: 15, valign: "middle", fill: { color: SOFT } } }, ...r.slice(1).map((v, i) => sym(v, i === 3))])];
    s.addTable(rows, { x: 0.6, y: 1.65, w: 12.1, colW: [3.3, 2.1, 2.1, 2.1, 2.5], rowH: [0.68, ...Array(8).fill(0.54)], fontFace: F, border: { type: "solid", pt: 0.75, color: LN }, margin: 0.05 });
    note(s, "ここは何かご質問はありませんか？\n\n\n実は１週間前から、ミルキーさんが受けたらどうなるかなって思ってワクワクしながら作ってものがあるんですが、みていただけますか？");
  }
  {
    const s = add("CONTENT", "プログラム内容");
    kicker(s, "生活に落とし込み、連動して活かす");
    title(s, "まっちゃんが輝く人生を手に入れる、サクセス7ステップ");
    const st = ["頑張らない天給自足達成術で、楽しいマインドでスタート", "食創り（調理・パン・菓子）から天給自足の一歩を楽しく踏み出す", "発酵食品作りで楽しく、美容と健康、備蓄を実現し講座で教える",
      "自然の恵みを見極め活用し、山菜・きのこ・野草を楽しむライフスタイル", "陸稲で米、自然農で野菜・菊芋を育て、食を備蓄しポタジェと共に安心を創る", "食の安心安全を確保し、醗酵食中心の日本食文化・伝承文化を復活",
      "まっちゃんならではの学びの場を作り、喜ばれながら収入を得て社会に貢献"];
    const cols = [LG, LG, "3E7C9B", "3E7C9B", "3E7C9B", GD, GD];
    const bw = 1.63, gap = 0.1, base = 6.8;
    for (let i = 0; i < 7; i++) {
      const x = 0.6 + i * (bw + gap), h = 2.6 + i * 0.32, y = base - h;
      box(s, x, y, bw, h, cols[i], { r: 0.1 });
      T(s, String(i + 1), { x, y: y + 0.12, w: bw, h: 0.55, fontSize: 26, bold: true, color: WH, align: "center", noCheck: true });
      T(s, st[i], { x: x + 0.1, y: y + 0.72, w: bw - 0.2, h: h - 0.8, fontSize: 14, color: WH });
    }
    const phase = [[0, 2, "マインド作り", LG], [2, 3, "天給自足 実践実行", "3E7C9B"], [5, 2, "あなたらしく輝く人生", GD]];
    for (const [i0, c, t, col] of phase) {
      const x = 0.6 + i0 * (bw + gap), w = c * bw + (c - 1) * gap, y = base - (2.6 + (i0 + c - 1) * 0.32) - 0.5;
      T(s, t, { x, y, w, h: 0.4, fontSize: 15, bold: true, color: col, align: "center", valign: "bottom" });
    }
    note(s, "今の話を聞いてみて、ワクワクした気持ちになっていただけましたか？\n\n\n「私と一緒にこのプログラムに取り組めば、〇〇さんがよくなっていく(目標に近づける、課題が解決さ\nれる)イメージはできますか?」\n→「はい」\n→「いいですね!そしたら具体的にどうなりそうですか?」\n\n→「さらにどうなっていきますか?」\n\n本当のゴールまで見えたらそのゴールを達成すると、どんな気持ちになるか?、どんな場所にいて、どん");
  }
  {
    const s = add("CONTENT", "プログラム内容");
    kicker(s, "すべて実践・体験");
    title(s, "カリキュラム実践一覧");
    const items = [[FA.FaSeedling, "必ず見つかる、自分にあった天給自足をスタートできる"], [GI.GiPlantRoots, "頑張らないでうまくいく自然農！天給自足を実現"], [FA.FaHandshake, "知ると出来るは違います。すべて実践、体験！"],
      [GI.GiCookingPot, "すぐに醗酵生活に落とし込める。作って持ち帰り、すぐ実践！"], [FA.FaHeart, "現状に合わせた醗酵生活で！腸活、健康！"], [FA.FaChalkboardTeacher, "伝承する立場（講師）となり、楽しく社会貢献！"],
      [GI.GiWheat, "食の安心安全、食の備蓄（陸稲・菊芋・醗酵食）の実践！"], [GI.GiMushroomGills, "自然と季節の恵み（きのこ・野草・山菜）とポタジェを活用し楽しめる"], [GI.GiBread, "米パン、グルテンフリーのフランス菓子を楽しく学ぶ　etc."]];
    for (let i = 0; i < 9; i++) {
      const x = 0.6 + (i % 3) * 4.12, y = 1.65 + Math.floor(i / 3) * 1.72;
      box(s, x, y, 3.86, 1.55, SOFT, { shadow: true });
      await iconC(s, items[i][0], x + 0.22, y + 0.42, 0.7, DG, GD);
      T(s, items[i][1], { x: x + 1.1, y: y + 0.1, w: 2.65, h: 1.35, fontSize: 15, valign: "middle" });
    }
    note(s, "ここについて何かご質問ありますか？");
  }
  {
    const s = add("CONTENT", "プログラム内容");
    kicker(s, "サポート体制");
    title(s, "4月から1年間、毎回合宿型の塾を全6回開催");
    const ms = [["4月", "2泊3日"], ["6月", "2泊3日"], ["8月", "2泊3日"], ["10月", "3泊4日"], ["12月", "1泊2日"], ["2月", "1泊2日"]];
    s.addShape("line", { x: 1.4, y: 2.75, w: 10.5, h: 0, line: { color: LN, width: 3 } });
    for (let i = 0; i < 6; i++) {
      const cx = 1.4 + i * 2.1;
      circ(s, cx - 0.6, 2.15, 1.2, i === 3 ? GD : DG, { shadow: true });
      T(s, ms[i][0], { x: cx - 0.6, y: 2.15, w: 1.2, h: 1.2, fontSize: 22, bold: true, color: WH, align: "center", valign: "middle", noCheck: true });
      T(s, ms[i][1], { x: cx - 0.9, y: 3.45, w: 1.8, h: 0.4, fontSize: 16, color: TX, align: "center" });
    }
    box(s, 0.6, 4.3, 12.1, 2.45, PG);
    await photo(s, "s23_949c9115.png", 0.85, 4.5, 3.3, 2.05, { shadow: false, bg: PG });
    T(s, "仲間と学ぶ、共に成長", { x: 4.5, y: 4.65, w: 8, h: 0.7, fontSize: 28, bold: true, color: DG });
    T(s, "助け合い・協力・応援。一人では続かないことも、仲間となら楽しく続けられます。", { x: 4.5, y: 5.4, w: 7.9, h: 1.0, fontSize: 17, color: TX });
  }

  // ===== ご成約特典 =====
  {
    const s = add("DARK", "ご成約特典");
    T(s, "05", { x: 0.9, y: 1.4, w: 3, h: 1.2, fontFace: M, fontSize: 72, color: GD, noCheck: true });
    T(s, "ご成約特典のご紹介", { x: 0.9, y: 2.65, w: 7, h: 1.0, fontFace: M, fontSize: 44, color: WH, noCheck: true });
    T(s, "ご成約していただいた方に、成功に導く特別限定特典がついてきます！", { x: 0.9, y: 3.8, w: 6.3, h: 1.0, fontSize: 20, color: "CFE0D3" });
    await photo(s, "s24_85ba82ea.jpg", 7.8, 1.6, 4.7, 3.15, { png: true });
    note(s, "どうしても最初にある程度まとまった金額が必要になってくるので、背中を押させていただきたいということで、ご契約いただいた方だけにこれから紹介する特別な特典を全て無料でお付けしています。");
  }
  const perk = async (no, head, value, desc, imgs, ic, notes) => {
    const s = add("CONTENT", "ご成約特典");
    kicker(s, "ご成約特典");
    title(s, `限定特典 ${no}`);
    T(s, head, { x: 0.6, y: 1.6, w: 7.9, h: 1.3, fontSize: 24, bold: true, color: TX, valign: "middle" });
    box(s, 0.6, 3.0, 2.9, 0.5, PGD, { r: 0.25 });
    T(s, `価値 ${value} 相当`, { x: 0.6, y: 3.0, w: 2.9, h: 0.5, fontSize: 16, bold: true, color: "8A5A10", align: "center", valign: "middle" });
    box(s, 0.6, 3.75, 7.9, 3.0, SOFT);
    T(s, desc, { x: 0.85, y: 3.85, w: 7.4, h: 2.8, fontSize: desc.length > 150 ? 15 : 17, valign: "middle" });
    if (imgs.length === 0) {
      circ(s, 9.3, 2.1, 3.2, PG);
      s.addImage({ data: await icon(ic, DG), x: 10.15, y: 2.95, w: 1.5, h: 1.5 });
    } else {
      const gap = 0.2, hh = (5.1 - gap * (imgs.length - 1)) / imgs.length;
      for (let i = 0; i < imgs.length; i++) await photo(s, imgs[i], 8.9, 1.65 + i * (hh + gap), 3.8, hh);
    }
    note(s, notes);
  };
  await perk(1, "フォロー期間無制限 ＆\n圃場のリアル見学 随時OK・無制限", "50万円〜",
    "成果・結果を出す上で本当に大事なことは、天給自足を学び、現実の生活の中にどれだけ落とし込むための行動がとれるかです。\nそのために、塾のサポートを無制限・永久フォロー（メッセンジャー＆LINE）。さらにリアル圃場見学も随時OK。メッセージでの相談をいつでも無制限にお受けしています。",
    [], FA.FaRegEnvelope, "・普段連絡ツールって何を使っていますか？");
  await perk(2, "本格スタートの前に、見学で予備体験ができます", "50万円〜",
    "開始の前に、予備体験ができます。4月から始まる天給自足の意図と前提、成果を出すためのポイントを事前に理解しているかどうかで、実践の効果が変わります。", ["s26_03ceced8.jpg"], null, "");
  await perk(3, "醗酵食・野草健康食・天給自足研究会（Facebookグループ）に参加できます", "10万円〜",
    "発酵食、野草、自然農を学ぶ研究会です。グルテンフリーメニューの質問・相談もできます。グルテンフリーのフランス菓子作り、ビーガンメニューの研究をします。参加会員同士の繋がりも生まれます。安心安全な食を楽しみましょう。天給自足塾限定のグループミーティングも随時開催。",
    ["s27_ce573b12.jpg", "s27_6dd74595.jpg", "s27_336a8452.jpg"], null, "写真楽しそうじゃないですか？");
  await perk(4, "お米・玄米粉のフランス菓子作りのベースとなる、フランス菓子基礎解説動画をプレゼント！", "10万円〜",
    "わたしが50年間で習得したフランス菓子の基本生地の動画をプレゼントします！フランス菓子の基本を応用して、グルテンフリーやビーガンのメニュー作りができます。基本を学ぶことで、ゼロスタートの方でも非常に高い再現性でオリジナルメニュー作りができるようになります。",
    ["s28_eaeec2ab.png", "s28_52471d48.png", "s28_451a7f34.png"], null, "");
  await perk(5, "クライアント様限定　食がもたらす健康「過去、現在、未来」最新版をプレゼント", "1万円〜",
    "発酵食、野草健康食、天給自足！\n発酵、野草、天給自足（きのこ、山菜、陸稲、菊芋等々）の情報を共有できる資料です。", ["s29_6ce31d67.jpg", "s29_7a84b17b.jpg"], null, "");
  {
    const s = add("CONTENT", "ご成約特典");
    kicker(s, "ご成約特典");
    title(s, "特別限定特典一覧");
    const li = [[FA.FaLine, "フォロー＆圃場リアル見学 期間無制限", "50万円〜"], [FA.FaEye, "本格スタート前のプレ体験", "50万円〜"], [FA.FaFacebook, "限定Facebookグループ（発酵食・野草健康食・天給自足研究会）参加", "10万円〜"],
      [FA.FaVideo, "フランス菓子の基本動画3本プレゼント", "10万円〜"], [FA.FaFilePdf, "食がもたらす健康「過去、現在、未来」厳選PDFプレゼント", "1万円〜"]];
    for (let i = 0; i < 5; i++) {
      const y = 1.65 + i * 0.72;
      await iconC(s, li[i][0], 0.6, y + 0.04, 0.55, DG, WH);
      T(s, `${"①②③④⑤"[i]} ${li[i][1]}`, { x: 1.3, y, w: 5.9, h: 0.62, fontSize: 15, valign: "middle" });
      T(s, li[i][2], { x: 7.1, y, w: 1.3, h: 0.62, fontSize: 15, bold: true, color: CR, align: "right", valign: "middle" });
    }
    box(s, 0.6, 5.45, 7.8, 1.3, DG);
    T(s, [{ text: "合計 121万円相当", options: { color: GD, bold: true, fontSize: 26 } }, { text: " の特典を無料でプレゼント！", options: { color: WH, bold: true, fontSize: 20 } }], { x: 0.85, y: 5.5, w: 7.4, h: 0.75, valign: "middle", noCheck: true });
    T(s, "※参加コースで特典は変わります。", { x: 0.85, y: 6.2, w: 7.4, h: 0.4, fontSize: 13, color: "DDE8DF" });
    await photo(s, "s30_9ad4dc30.jpg", 8.8, 1.65, 3.9, 5.1);
    note(s, "この５つの特典で特にどの特典が嬉しいなとか使ってみたいなと思いませんか？\nマンツーマン＋グループで個別コンサルト講座のいいとこ取りをしている！");
  }

  // ===== メニューと価格 =====
  divider("06", "メニューと価格", "あなたに合ったコースで、天給自足の一歩を", "メニューと価格");
  const course = (name, lead, goal, sched, extra, perks, notes, sec = "メニューと価格") => {
    const s = add("CONTENT", sec);
    kicker(s, "メニューのご紹介");
    title(s, name);
    T(s, lead, { x: 0.6, y: 1.5, w: 8.3, h: 0.85, fontSize: 15, color: MU });
    T(s, goal, { x: 0.6, y: 2.4, w: 8.3, h: 0.4, fontSize: 15, bold: true, color: DG });
    let y = 2.88;
    const rh = sched.length > 4 ? 0.6 : 0.78;
    for (const [m, t, d] of sched) {
      box(s, 0.6, y, 8.3, rh - 0.06, SOFT, { r: 0.08 });
      box(s, 0.7, y + (rh - 0.06) / 2 - 0.2, 0.95, 0.4, DG, { r: 0.2 });
      T(s, m, { x: 0.7, y: y + (rh - 0.06) / 2 - 0.2, w: 0.95, h: 0.4, fontSize: m.length > 3 ? 12 : 14, bold: true, color: WH, align: "center", valign: "middle", margin: 0, noCheck: true });
      T(s, t, { x: 1.75, y, w: 6.02, h: rh - 0.06, fontSize: 14, valign: "middle" });
      if (d) T(s, d, { x: 7.8, y, w: 1.05, h: rh - 0.06, fontSize: 13, bold: true, color: LG, align: "center", valign: "middle", margin: 0 });
      y += rh;
    }
    if (extra) T(s, extra, { x: 0.6, y: y + 0.02, w: 8.3, h: 0.38, fontSize: 14, bold: true, color: "8A5A10" });
    box(s, 9.2, 1.5, 3.5, 5.25, DG, { shadow: true });
    T(s, "特別限定特典", { x: 9.45, y: 1.7, w: 3.0, h: 0.45, fontSize: 18, bold: true, color: GD });
    let py = 2.3;
    for (const p of perks) {
      const ph = estH(p, 2.55, 15, 1.38) + 0.05;
      T(s, [{ text: "✓ ", options: { color: GD, bold: true } }, { text: p, options: { color: WH } }], { x: 9.45, y: py, w: 3.05, h: ph, fontSize: 15, noCheck: true });
      py += ph + 0.12;
    }
    if (py > 6.7) warnings.push(`[slide ${s._n}] perks overflow ${py}`);
    note(s, notes);
    return s;
  };
  const S4 = ["4月", "菊芋活用実践塾＆陸稲・自然農野菜の植え付け、播種。ポタジェ（キッチンガーデン）で菌ちゃん農法実践", "2泊3日"],
    S6 = ["6月", "野草を生活に落とし込み楽しみ、見極め食べつくす。野草醤・野草チンキ・野草酵素を作ります", "2泊3日"],
    S8 = ["8月", "陸稲＆野菜栽培観察、夏野菜を楽しみ食べ尽くす。竹細工で自分の箸・皿・カップ等々を創る", "2泊3日"],
    S10 = ["10月", "醗酵実践塾＆きのこを楽しむ。あらゆる醗酵を学び、きのこ収穫体験と見極め", "3泊4日"],
    S12 = ["12月", "菊芋堀り＆乾物活用を楽しみ学ぶ", "1泊2日"],
    S2 = ["2月", "米・玄米粉のフランス菓子＆米パンを学ぶ", "1泊2日"];
  course("天給自足講師養成 2年コース", "発酵、農、自然の恵みを学び、習得実践できるようになり、講師として活躍もでき、さらにご自身・家族が最後まで健康で楽しい人生を実現できるようになるコースです。",
    "天給自足を学び講師として活躍し、家族の生涯健康を実現（すべて合宿型）", [S4, S6, S8, S10, S12, S2], "★2年目は講師としての視点で講座構築を考えながら再受講",
    ["LINEフォロー無期限", "リアルにいつでも圃場見学OK", "フランス菓子基礎動画プレゼント", "FBグループ参加", "食がもたらす健康 最新PDFプレゼント"], "");
  course("天給自足 1年コース", "発酵、農業、自然の恵みを学び、習得実践できるようになり、ご自身・家族が最後まで健康で楽しい人生を実現できるようになるコースです。",
    "天給自足を目指し、生涯健康をめざす（すべて合宿型）", [S4, S6, S8, S10, S12, S2], "",
    ["LINEフォロー無期限", "リアルにいつでも圃場見学OK", "フランス菓子基礎動画プレゼント", "FBグループ参加"], "");
  course("天給自足 半年コース", "発酵と菊芋の加工、天給自足（野草、きのこ、山菜）を学び、実践できるようになり、家族の健康が実現できます。",
    "天給自足を生活に落とし込み、家族の健康を実現", [S4, S6, S8, S10], "★このコースは半年で天給自足を学ぶコースです。",
    ["LINEフォロー無期限", "リアルにいつでも圃場見学 無期限", "FBグループ参加"], "メニューに関して何かご質問はありませんか？\n金額の発表はこれからですが、金額抜きにして単純に内容だけ見たらどのコース受けたいと思いましたか？");
  await teachSlide("有住さん", "お米・玄米で作るパン講座・天然酵母パン講座", "メニューと価格", teachNotes);
  {
    const s = add("CONTENT", "メニューと価格");
    kicker(s, "一生モノのメリット");
    title(s, "天給自足塾プランで得られる、7つのメリット");
    const m = [[GI.GiSprout, "自然農（天給自足）がスタートできる！"], [GI.GiCookingPot, "一生モノの発酵スキル（発酵食作りの実践と理論）が得られる！"], [GI.GiBread, "グルテンフリーのお菓子作り、玄米パン作りが身につく！"],
      [GI.GiWheat, "食品の加工スキルで無添加の食を作り備蓄し、安心が得られる！"], [PI.PiFlowerTulip, "ポタジェ作りで四季の恵みを知り、自然を楽しみ豊かさに氣づく"], [FA.FaLine, "オンラインサポート無期限で、何度でも質問ができる安心"],
      [FA.FaHeart, "食改善で家族の健康（便秘・肌荒れ解消、心の安定）を得る"]];
    for (let i = 0; i < 7; i++) {
      const row = i < 4 ? 0 : 1, col = row ? i - 4 : i;
      const cw = 2.85, gap = 0.233;
      const x = row ? 0.6 + (cw + gap) * 0.5 + col * (cw + gap) : 0.6 + col * (cw + gap);
      const y = 1.65 + row * 2.6;
      box(s, x, y, cw, 2.4, i === 6 ? PGD : SOFT, { shadow: true });
      await iconC(s, m[i][0], x + 0.25, y + 0.25, 0.75, i === 6 ? GD : DG, WH);
      T(s, "0" + (i + 1), { x: x + 1.7, y: y + 0.25, w: 0.95, h: 0.6, fontSize: 26, bold: true, color: i === 6 ? GD : "B9CBB5", align: "right", noCheck: true });
      T(s, m[i][1], { x: x + 0.22, y: y + 1.1, w: cw - 0.4, h: 1.2, fontSize: 15, bold: true, color: TX });
    }
    note(s, "・全体振り返っての疑問質問はありませんか？\n・ここまで聞いてみてこのプラン受けてみたいと思っていただけましたか？\n\nここまで聞いたらみなさんあとは気になるというのが");
  }
  const priceNotes = "次に出てくる金額が一番安く、なおかつ一番成果が出やすい銀行振込一括の金額です。分割、クレジットは。。。\nではここから価格を発表しますが、心の準備は宜しいでしょうか？\n\n最初はVIP（本気で関わる、本気の金額です）\n\nなんですけど、こちら定価でして、、、";
  const payNote = "※お支払い方法は銀行一括振り込み・クレジット払いになります。（分割・クレジット一括の場合、5%のお手数料をいただきます。）";
  const priceSlide = (early, sec = "メニューと価格") => {
    const s = add("CONTENT", sec);
    kicker(s, early ? "早期割引価格" : "価格のご紹介");
    title(s, "価格のご紹介");
    const P = [
      { n: "天給自足講師養成\n2年コース", p: "120万円", d: early ? "すべての講座を2年（2回）にわたって受講。2年目からは講師のつもりで受講" : "すべての講座を2年（2回）にわたって受講。2年目からは教える立場で考え受講",
        k: early ? ["LINEサポート無制限", "リアルでいつでも見学OK", "フランス菓子基礎動画", "限定FBグループ"] : ["LINEサポート無制限", "リアルでいつでも見学OK", "フランス菓子基礎動画", "FBグループ参加", "食がもたらす健康 最新PDF"], feat: true },
      { n: "天給自足\n1年コース", p: "60万円", d: "1年間を通してすべての講座を受講できます。四季を通しての学びが豊かで楽しい",
        k: early ? ["LINEサポート無制限", "リアルでいつでも見学OK", "フランス菓子基礎動画", "限定FBグループ"] : ["LINEサポート無制限", "リアルでいつでも見学OK", "フランス菓子基礎動画", "FBグループ参加"] },
      { n: "天給自足\n半年コース", p: "40万円", d: "天給自足の中心となる講座を受講。ポタジェ（キッチンガーデン）・菌ちゃん農法で素敵な庭を作ります",
        k: early ? ["LINEサポート無制限", "リアルでいつでも見学OK", "フランス菓子基礎動画", "限定FBグループ"] : ["LINEサポート無制限", "リアルでいつでも見学OK", "FBグループ参加"] }];
    for (let i = 0; i < 3; i++) {
      const c = P[i], x = 0.6 + i * 4.1, w = 3.85, f = c.feat;
      box(s, x, 1.6, w, 5.0, f ? DG : SOFT, { shadow: true, line: f ? undefined : LN });
      T(s, c.n, { x: x + 0.25, y: 1.75, w: w - 0.5, h: 0.85, fontSize: 18, bold: true, color: f ? WH : DG, valign: "middle" });
      if (f && early) {
        T(s, [{ text: "120万円（税込）", options: { strike: "sngStrike" } }], { x: x + 0.25, y: 2.6, w: 2.4, h: 0.38, fontSize: 15, color: "B9C9BF", valign: "middle", noCheck: true });
        box(s, x + 2.4, 2.62, 1.25, 0.34, CR, { r: 0.17 });
        T(s, "早期割引", { x: x + 2.4, y: 2.62, w: 1.25, h: 0.34, fontSize: 12, bold: true, color: WH, align: "center", valign: "middle", margin: 0, noCheck: true });
        T(s, [{ text: "108", options: { fontSize: 46, bold: true } }, { text: "万円（税込）", options: { fontSize: 15, bold: true } }], { x: x + 0.25, y: 2.95, w: w - 0.4, h: 0.85, color: GD, valign: "middle", noCheck: true });
      } else {
        T(s, [{ text: c.p.replace("万円", ""), options: { fontSize: 46, bold: true } }, { text: "万円（税込）", options: { fontSize: 15, bold: true } }], { x: x + 0.25, y: 2.7, w: w - 0.4, h: 1.0, color: f ? GD : DG, valign: "middle", noCheck: true });
      }
      T(s, c.d, { x: x + 0.25, y: 3.85, w: w - 0.5, h: 1.05, fontSize: 14, color: f ? "DDE8DF" : TX });
      T(s, c.k.map((t, j) => ({ text: "✓ " + t, options: { breakLine: j < c.k.length - 1 } })), { x: x + 0.25, y: 4.95, w: w - 0.5, h: 1.6, fontSize: 14, color: f ? WH : TX, noCheck: true, lineSpacingMultiple: 1.05 });
    }
    T(s, payNote, { x: 0.6, y: 6.65, w: 12.1, h: 0.33, fontSize: 11, color: MU });
    note(s, priceNotes);
  };
  priceSlide(false);
  {
    const s = add("DARK", "メニューと価格");
    T(s, "実は、今回限りの", { x: 0.9, y: 1.6, w: 11, h: 0.9, fontFace: M, fontSize: 40, color: WH });
    T(s, "早期契約割引", { x: 0.9, y: 2.55, w: 11, h: 1.4, fontFace: M, fontSize: 72, color: GD });
    T(s, "のご案内があります", { x: 0.9, y: 4.0, w: 11, h: 0.9, fontFace: M, fontSize: 40, color: WH });
  }
  {
    const s = add("CONTENT", "メニューと価格");
    kicker(s, "早期契約割引");
    title(s, "実は今、割引価格にてご案内しています");
    T(s, "割引条件は、次の2つです", { x: 0.6, y: 1.55, w: 8, h: 0.45, fontSize: 18, color: MU });
    const cond = [[FA.FaQuoteLeft, "お客様の声にご協力いただける方", ""], [FA.FaRegClock, "本日この場で、又は3日以内でご決断いただける方", "3日を過ぎると定価となります。"]];
    for (let i = 0; i < 2; i++) {
      const x = 0.6 + i * 6.2;
      box(s, x, 2.15, 5.9, 2.3, SOFT, { shadow: true });
      await iconC(s, cond[i][0], x + 0.3, 2.45, 0.85, DG, GD);
      T(s, "条件 " + "①②"[i], { x: x + 1.35, y: 2.45, w: 4, h: 0.4, fontSize: 15, bold: true, color: LG });
      T(s, cond[i][1], { x: x + 1.35, y: 2.85, w: 4.35, h: 0.95, fontSize: 19, bold: true, color: TX });
      if (cond[i][2]) T(s, cond[i][2], { x: x + 1.35, y: 3.8, w: 4.35, h: 0.45, fontSize: 15, color: CR });
    }
    T(s, "私を信じて頂き、自分を信じて、行動の早い方は、実績を出す力がある人だからです。", { x: 0.6, y: 4.7, w: 12.1, h: 0.6, fontSize: 18, color: TX, align: "center" });
    box(s, 0.6, 5.55, 12.1, 1.15, DG);
    T(s, [{ text: "①②を満たす方には、", options: { color: WH } }, { text: "更に特別価格", options: { color: GD } }, { text: "にてご案内させていただきます！", options: { color: WH } }], { x: 0.9, y: 5.55, w: 11.5, h: 1.15, fontSize: 22, bold: true, align: "center", valign: "middle", noCheck: true });
    note(s, "こういう方を応援したいと思っているので、、、\n先にモニター特典を紹介すると");
  }
  {
    const s = add("CONTENT", "メニューと価格");
    kicker(s, "ご参加をご決断頂いた方への特別価格です");
    title(s, "早期割引 特別特典");
    box(s, 0.6, 1.8, 6.6, 4.9, PGD);
    T(s, "すぐにご決断頂ける方限定の\n特別価格です。", { x: 1.0, y: 2.2, w: 6.0, h: 1.7, fontSize: 28, bold: true, color: DG });
    await iconC(s, FA.FaRegClock, 1.0, 4.35, 0.9, CR, WH);
    T(s, "3日を過ぎると\n定価となります", { x: 2.1, y: 4.25, w: 4.8, h: 1.1, fontSize: 22, bold: true, color: CR, valign: "middle" });
    await photo(s, "s39_949c9115.png", 7.6, 1.8, 5.1, 4.9);
    note(s, "なんですが、こちら使う必要ありません。\nなぜなら〜〜だから。\n倍以上の金額を出すぞという気持ちで受けて欲しいし、それができる人です。\nただ安心してお申し込みできるようにできている");
  }
  priceSlide(true);
  {
    const s = add("PHOTO", "クロージング");
    s.addImage({ path: IMG + "s01_61dbc221.jpg", x: 0, y: -0.05, w: W, h: W * 900 / 1352 });
    s.addImage({ path: GEN + "overlay_top.png", x: 0, y: 0, w: W, h: H });
    T(s, "ありがとうございます", { x: 0.9, y: 1.2, w: 11.5, h: 1.3, fontFace: M, fontSize: 54, color: WH, align: "center", valign: "middle" });
    T(s, "今日という日は、残りの人生の最初の日。\nいっしょに、天の恵みを活かす未来を創りましょう。", { x: 1.4, y: 2.6, w: 10.5, h: 1.1, fontSize: 20, color: WH, align: "center" });
  }

  // ===== 参考資料 =====
  {
    const s = course("単独塾コース", "各講座で、発酵、菊芋の加工、野草、サバイバルを学ぶ。", "気になる講座だけを選んで受講できます",
      [["4月", "菊芋活用実践塾", "1泊2日"], ["6月", "野草を生活に落とし込み楽しむ会", "1泊2日"], ["8月", "アパッチ族のフルサバイバル体験", "1泊2日"], ["4〜10月", "発酵実践塾", "2泊3日"]], "",
      ["LINEフォロー無期限", "リアルにいつでも圃場見学 無期限", "限定FBグループ"], "メニューに関して何かご質問はありませんか？\n金額の発表はこれからですが、金額抜きにして単純に内容だけ見たらどのコース受けたいと思いましたか？", "参考資料");
  }
  {
    const s = add("CONTENT", "参考資料");
    kicker(s, "単独塾");
    title(s, "単独塾 価格のご紹介");
    const P = [[GI.GiCookingPot, "発酵実践塾", "11", "124,300円", "糀作りから始まり、いろんな発酵を理論と実践で学びます。"],
      [GI.GiPotato, "菊芋活用実践塾", "7", "84,150円", "菊芋の栽培から始まり、菊芋のいろいろな活用を実践してゆきます。食の安心安全の第一歩。"],
      [GI.GiHerbsBundle, "野草を生活に落とし込み楽しむ会", "1.8", "25,150円", "野草を見極め、食べる、飲む、飾る、活ける、遊ぶ。"]];
    for (let i = 0; i < 3; i++) {
      const x = 0.6 + i * 4.1, w = 3.85;
      box(s, x, 1.6, w, 5.0, SOFT, { shadow: true, line: LN });
      await iconC(s, P[i][0], x + 0.25, 1.85, 0.75, DG, GD);
      T(s, P[i][1], { x: x + 1.15, y: 1.8, w: w - 1.3, h: 0.85, fontSize: 18, bold: true, color: DG, valign: "middle" });
      T(s, [{ text: P[i][2], options: { fontSize: 46, bold: true } }, { text: "万円", options: { fontSize: 18, bold: true } }], { x: x + 0.25, y: 2.8, w: w - 0.5, h: 0.9, color: DG, valign: "middle", noCheck: true });
      T(s, "宿泊なし・税込", { x: x + 0.25, y: 3.65, w: w - 0.5, h: 0.35, fontSize: 13, color: MU });
      box(s, x + 0.25, 4.1, w - 0.5, 0.5, PGD, { r: 0.25 });
      T(s, `宿泊あり ${P[i][3]}（税込）`, { x: x + 0.25, y: 4.1, w: w - 0.5, h: 0.5, fontSize: 14, bold: true, color: "8A5A10", align: "center", valign: "middle" });
      T(s, P[i][4], { x: x + 0.25, y: 4.8, w: w - 0.5, h: 1.6, fontSize: 15, color: TX });
    }
    T(s, payNote, { x: 0.6, y: 6.65, w: 12.1, h: 0.33, fontSize: 11, color: MU });
    note(s, priceNotes);
  }
  await msgSlide("〜さん", "このタイトルを見て、いいなと思ったところ教えてもらえますか？\nなぜですか？\n\n※お客様のお名前を「〜さん」に入れて使うテンプレートです。\n\n【元スライドの全文】\n本日の体験セッションの実りあるものにするために和多志の志とお伝えしたいこと。\n～さんの輝く未来、100％～さんの未来地図を描くお手伝いの時間にしたいと考えています。先に天給自足を経験した者として～さんの人生に必要な応援者になりたいと思っています。残りの人生の時間をどう作るか、和多志は本来の日本の食の復活が日本全体の復活につながると考えています。世の中を変えるには二つしかないとの思いに至りました。\n武力か伝承かしか世の中を変えられません。政治家、教育者、医者、ジャーナリスト、インフルエンサーに任せていても世の中は良くなりません。80年以上に日本を弱体化するために政策等を伝承してきていまの日本があります。すべてのひとがまず足元の自分の食は自分で確保しながら日本の食文化、伝統文化、徳文化を伝承してゆくしかないと思います。人生の質は選択の質！\n自分によりしっくりくる、勇気付けてくれる、後押ししてくれる選択\n一生モノの食のスキル（天給自足）を習得し\nこれからの人生をどう生きるか？\n天給自足は単なるスキルではありません、自分の人生をどう生きてゆきたいか？\n人生の主役はあなたです！！自分で人生を作る。迷い、不安の振り回される時間を自分の本質に沿った時間に");

  const out = "/root/work/deck.pptx";
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("slides:", n);
  console.log(warnings.join("\n") || "no warnings");
})().catch(e => { console.error(e); process.exit(1); });
