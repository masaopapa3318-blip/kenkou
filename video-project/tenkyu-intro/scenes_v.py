# 天給自足実践塾 紹介動画（スマホ向け縦長 1080x1920）：横長版と同じ21シーンを縦の構図で書き出す
import json, os

IMG = 'file:///home/user/kenkou/images/'
DECK = 'file:///tmp/claude-0/-home-user-kenkou/365c7380-fdc8-5909-a387-b0f263485918/scratchpad/deck6/media/'
D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, 'scenes_v')
os.makedirs(OUT, exist_ok=True)

CSS = '''
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Noto+Sans+JP:wght@400;500;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1080px; height: 1920px; overflow: hidden; }
body { font-family: 'Noto Sans JP', sans-serif; color: #2b2620; background: #faf6ee; }
.serif { font-family: 'Shippori Mincho', serif; }
.eyebrow { font-size: 30px; letter-spacing: .3em; color: #d99a5b; font-weight: 500; }
.full { position: relative; width: 1080px; height: 1920px; }
.full > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.full .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,32,25,.15) 0%, rgba(20,32,25,.7) 100%); }
.full .text { position: absolute; left: 90px; right: 90px; bottom: 300px; color: #fff; }
.full.center .text { top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
.full h1 { font-family: 'Shippori Mincho', serif; font-size: 82px; line-height: 1.45; font-weight: 700; text-shadow: 0 4px 24px rgba(0,0,0,.4); }
.full p { margin-top: 40px; font-size: 40px; line-height: 1.7; text-shadow: 0 2px 12px rgba(0,0,0,.45); }
.stack { display: flex; flex-direction: column; width: 1080px; height: 1920px; }
.stack .ph { height: 900px; overflow: hidden; }
.stack .ph img { width: 100%; height: 100%; object-fit: cover; }
.stack .tx { flex: 1; padding: 70px 90px 0; }
.stack h2 { font-family: 'Shippori Mincho', serif; font-size: 76px; line-height: 1.35; color: #1f3227; margin: 18px 0 34px; }
.stack p { font-size: 38px; line-height: 1.85; }
.em { color: #b9713a; font-weight: 700; }
.page { width: 1080px; height: 1920px; padding: 150px 80px 120px; display: flex; flex-direction: column; }
.page h2 { font-family: 'Shippori Mincho', serif; font-size: 70px; line-height: 1.4; color: #1f3227; margin-top: 16px; }
.dark { background: #1f3227; color: #faf6ee; }
.dark h2 { color: #faf6ee; }
.card { border-radius: 18px; overflow: hidden; position: relative; }
.card img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cap { position: absolute; left: 14px; bottom: 12px; padding: 6px 18px; border-radius: 99px; background: rgba(31,50,39,.82); color: #fff; font-size: 28px; }
.mark { font-family: 'Shippori Mincho', serif; color: #b9713a; font-weight: 800; }
'''

def page(name, body):
    with open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8') as f:
        f.write('<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + body + '</body></html>')

def full(name, img, eyebrow, title, sub='', center=False, pos='center'):
    page(name, f'''<div class="full{' center' if center else ''}"><img src="{img}" style="object-position:{pos}"><div class="shade"></div>
<div class="text">{f'<div class="eyebrow">{eyebrow}</div>' if eyebrow else ''}<h1>{title}</h1>{f'<p>{sub}</p>' if sub else ''}</div></div>''')

def stack(name, img, eyebrow, title, body, pos='center'):
    page(name, f'<div class="stack"><div class="ph"><img src="{img}" style="object-position:{pos}"></div><div class="tx"><div class="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{body}</p></div></div>')

def course(name, eyebrow, title, lead, words, imgs):
    cards = ''.join(f'<div class="card"><img src="{s}"><span class="cap">{c}</span></div>' for s, c in imgs)
    page(name, f'''<div class="page"><div class="eyebrow">{eyebrow}</div><h2 style="font-size:80px">{title}</h2>
<p style="font-size:36px;line-height:1.8;margin-top:30px">{lead}</p>
<p class="mark" style="font-size:44px;margin-top:30px;letter-spacing:.12em">{words}</p>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:minmax(0,1fr) minmax(0,1fr);gap:20px;flex:1 1 0;min-height:0;margin-top:50px">{cards}</div></div>''')

def voice(name, img, who, quote, pos='center'):
    page(name, f'''<div class="stack"><div class="ph" style="height:1000px"><img src="{img}" style="object-position:{pos}"></div>
<div class="tx" style="padding-top:60px"><div class="eyebrow">VOICE　受講生の声</div>
<p class="serif" style="font-size:150px;line-height:.6;color:#d99a5b;margin-top:44px">“</p>
<p class="serif" style="font-size:52px;line-height:1.7;color:#1f3227;font-weight:700">{quote}</p>
<p style="font-size:32px;margin-top:36px;color:#5a5348">{who}</p></div></div>''')

scenes = []
def add(name, dur): scenes.append({'name': name, 'dur': dur})

full('s01', DECK + 'image1.jpg', '<span style="display:inline-block;padding:12px 40px;border-radius:999px;background:rgba(31,50,39,.78);color:#fff;font-family:Shippori Mincho,serif;font-size:48px;font-weight:700;letter-spacing:.18em;margin-bottom:30px">天給自足実践塾</span>', '一生モノの<br>食のスキルを、<br>これからの人生に。', '天給自足・醗酵食・自然農<br>野草・きのこ<br>そして、それを楽しむ<br>あらゆる加工法', center=True, pos='60% center'); add('s01', 7)
full('s02', IMG + 'yatsugatake-blue-sky.jpg', '', '残りの人生の時間を、<br>どう創りますか？', '今日という日は、<br>残りの人生の最初の日です。', center=True); add('s02', 7)
stack('s03', IMG + 'rice-field-autumn.jpg', 'ABOUT', '「天給自足」とは',
      '大地、空氣、水、太陽の光、種──<br>すべて天が与えてくれている。<br><span class="em">だから「自給自足」ではなく<br>「天給自足」。</span><br>農の経験がなくても、誰でもできる<br>ようになるための塾です。'); add('s03', 12)
stack('s04', DECK + 'image2.jpg', 'PROFILE', '主宰　藤巻正夫',
      '新潟県柏崎市生まれ。<br>八ヶ岳・原村「レジオン八ヶ岳」主宰。<br>洋菓子職人として50年。<br><span class="em">天給自足の伝承者・講師を<br>養成しています。</span>', pos='center 18%'); add('s04', 9)
steps = [('18歳', '上京し、洋菓子の道へ'), ('24歳', 'オーボンヴュータンでスーシェフに'), ('27〜31歳', 'スイス・フランスで修業（ミシュラン三ツ星・二ツ星）'), ('横浜', '「レジオン」を21年営業、菓子・パン教室を15年'), ('八ヶ岳', '自然農と醗酵を実践し、天給自足を伝える')]
tl = ''.join(f'<div style="display:flex;gap:34px;align-items:flex-start;margin-top:34px"><div style="width:26px;height:26px;border-radius:50%;background:#b9713a;margin-top:18px;flex:none;box-shadow:0 0 0 9px #f2ead9"></div><div><p class="serif" style="font-size:46px;color:#1f3227;font-weight:700">{a}</p><p style="font-size:32px;line-height:1.55">{b}</p></div></div>' for a, b in steps)
ph = ''.join(f'<div class="card"><img src="{s}"></div>' for s in [DECK + 'image8.jpg', DECK + 'image4.jpg', IMG + 'venue-exterior-1.jpg', DECK + 'image7.jpg'])
page('s05', f'''<div class="page"><div class="eyebrow">STORY</div><h2>食の道、50年の歩み</h2>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:330px 330px;gap:18px;margin-top:44px">{ph}</div>
<div style="margin-top:30px">{tl}</div></div>'''); add('s05', 13)
full('s06', IMG + 'august-fieldwork-end.jpg', '帰国後、田舎で氣づいたこと', '<span style="font-size:72px">「自然に根ざした<br>食創り」の豊かさは、<br>三ツ星以上だった。</span>', ''); add('s06', 8)
circ = lambda t: f'<div style="width:560px;height:560px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffffff,#e8f0ea 70%);border:3px solid #4c6b57;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px;margin:0 auto"><p class="serif" style="font-size:48px;line-height:1.6;color:#1f3227;font-weight:700">{t}</p></div>'
page('s07', f'''<div class="page" style="text-align:center"><div class="eyebrow">WHY</div><h2>天給自足が<br>うまくいかない、2つの理由</h2>
<div style="margin-top:50px">{circ('経験が少ない<br>理論と実践の<br>学びが少ない')}<p class="mark" style="font-size:100px;line-height:1.3">×</p>{circ('楽しんでできる<br>仲間がいない<br>いつでも聞ける<br>環境がない')}</div>
<p style="font-size:38px;line-height:1.7;margin-top:46px">人は学んだ次の日、<span class="mark" style="font-size:56px">74%</span>を忘れてしまう。<br><b>この2つを年6回の合宿で同時に解決します。</b></p></div>'''); add('s07', 12)
merits = [(IMG + 'april-field-work.jpg', '自然農と自然の恵みを<br>四季を通して学ぶ'), (IMG + 'koji-making.jpg', '一生モノの醗酵スキル<br>（実践と理論）'), (IMG + 'shop-komegyapan-set.jpg', 'グルテンフリーの<br>フランス菓子・米パン'),
          (IMG + 'pickled-vegetables-jars.jpg', '無添加の食づくりと<br>醗酵食の備蓄'), (IMG + 'tomato-seedlings-spring.jpg', 'ポタジェで<br>四季を楽しむ'), (IMG + 'june-outdoor-meal.jpg', '家族の健康を<br>見つめ直す')]
mc = ''.join(f'<div style="display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 10px 30px rgba(43,38,32,.08)"><div class="card" style="height:300px;border-radius:0"><img src="{s}"></div><p style="font-size:30px;line-height:1.5;padding:18px 22px;font-weight:500;color:#1f3227">{t}</p></div>' for s, t in merits)
page('s08', f'''<div class="page" style="padding-top:130px"><div class="eyebrow">MERITS</div><h2>天給自足実践塾で得られる、<br>一生モノのスキル</h2>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px">{mc}</div>
<p style="font-size:32px;margin-top:28px;color:#5a5348">＋ 無期限のオンラインサポートで、いつでも聞ける安心</p></div>'''); add('s08', 14)
col = lambda head, color, items: f'<div style="border-radius:24px;padding:40px 54px;background:{color}"><p class="serif" style="font-size:56px;font-weight:700;margin-bottom:16px">{head}</p>' + ''.join(f'<p style="font-size:34px;line-height:1.6;margin-top:12px">・{i}</p>' for i in items) + '</div>'
page('s09', f'''<div class="page"><div class="eyebrow">CHANGE</div><h2>受講すると、どう変わる？</h2>
<div style="margin-top:50px">{col('Before', '#efe9df', ['自然農の一歩が踏み出せない', '野草の見極めに自信がない', '味噌や漬物を自分で作れない', '醗酵のすばらしさがわからない', 'きのこ・山菜を楽しめていない'])}</div>
<p class="mark" style="font-size:90px;text-align:center;line-height:1.4">↓</p>
{col('After', '#e3ede6', ['陸稲・野菜づくりをスタート', '季節の恵みを活かせる', '醗酵食で腸から健康に', '食の保存・備蓄で安心を自給', '玄米パンや米のお菓子を楽しく作れる'])}</div>'''); add('s09', 12)
CAMPS = [('4', '菊芋・陸稲の<br>植え付け', 'april-planting-group.jpg'), ('6', '野草を<br>見極め楽しむ', 'june-sorting-herbs.jpg'),
         ('8', '夏の畑と<br>焚火を楽しむ', 'august-serving-food.jpg'), ('10', '醗酵と<br>きのこ', 'october-koji-making.jpg'),
         ('12', '菊芋掘りと<br>乾物料理', 'kikuimo-fresh.jpg'), ('2', '米粉のお菓子と<br>玄米パン', 'october-rice-bread.jpg')]
mont = ''.join(f'<div style="display:flex;border-radius:18px;overflow:hidden;background:#faf6ee;min-height:0"><div class="card" style="width:46%;border-radius:0;flex:none"><img src="{IMG}{f}"></div><div style="padding:20px 22px;display:flex;flex-direction:column;justify-content:center"><p class="serif" style="font-size:64px;line-height:1;color:#b9713a;font-weight:800">{m}<span style="font-size:30px">月</span></p><p style="font-size:28px;line-height:1.45;margin-top:12px;color:#1f3227;font-weight:500">{t}</p></div></div>' for m, t, f in CAMPS)
page('s10', f'''<div class="page dark" style="padding-top:140px"><div class="eyebrow">6 CAMPS</div><h2>2か月に1度、<br>年6回の合宿で<br>八ヶ岳の四季を巡る</h2>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,minmax(0,1fr));gap:20px;margin-top:44px;flex:1 1 0;min-height:0">{mont}</div>
<p style="font-size:34px;line-height:1.7;margin-top:36px">各回1泊2日〜3泊4日。<br>仲間と一緒に、季節ごとの作業を体で覚えます。</p></div>'''); add('s10', 15)
course('s11', 'FERMENTATION', '醗酵実践塾', '糀・味噌・縄文漬け・甘酒・シードルなど、<br>全11講座を2泊3日で集中して学ぶ<br>醗酵のリトリートです。', '委ねる。待つ。信じる。',
       [(IMG + 'koji-making.jpg', '糀'), (IMG + 'miso-paste.jpg', '味噌'), (IMG + 'amazake.jpg', '甘酒'), (IMG + 'october-jomon-zuke.jpg', '縄文漬け')]); add('s11', 11)
course('s12', 'KIKUIMO', '菊芋活用実践塾', '自然農で誰でも育てられる菊芋。<br>栽培から、あらゆる調理・保存法まで、<br>合宿で集中して究めます。', '究める。楽しむ。落とし込む。',
       [(IMG + 'kikuimo-fresh.jpg', '菊芋'), (IMG + 'kikuimo-chijimi.jpg', 'チヂミ'), (IMG + 'kikuimo-miso.png', '菊芋味噌'), (IMG + 'kikuimo-pound-cake.jpg', 'パウンドケーキ')]); add('s12', 11)
course('s13', 'WILD HERBS', '野草を生活に<br>落とし込み楽しむ会', '野草研究家・みこたまさんを講師に迎え、<br>野草を見極め、生活に落とし込む<br>2泊3日のリトリートです。', '見極める。身近にする。楽しむ。',
       [(IMG + 'june-sorting-herbs.jpg', '野草の見極め'), (IMG + 'wild-herb-salad.jpg', '野草のサラダ'), (IMG + 'yomogi-dango.jpg', 'よもぎ団子'), (IMG + 'wild-herb-takikomi-gohan.jpg', '炊き込みご飯')]); add('s13', 11)
course('s14', 'RETREAT', '四季を楽しむ<br>食と香りの<br>実践リトリート', '藤巻まり子が主宰。ミネラルと天然の香り、<br>醗酵食・グルテンフリー食で、<br>心と身体を内と外から整えます。', '氣づく。癒やす。見つめ直す。',
       [(IMG + 'retreat-gallery-lavender.jpg', '天然の香り'), (IMG + 'retreat-gallery-cafe-salad.jpg', '八ヶ岳の食'), (IMG + 'retreat-gallery-farm-sky.jpg', '森林浴'), (IMG + 'retreat-gallery-venue-daytime.jpg', 'レジオン八ヶ岳')]); add('s14', 11)
voice('s15', DECK + 'image10.jpg', '60代・医師ご夫妻（福井県）', '醗酵食が身体によいと考えて参加。<br>今ではいろいろな醗酵食を作り、<br>アレンジして楽しんでいます。', pos='center 30%'); add('s15', 7)
voice('s16', DECK + 'image11.jpg', '50代・料理研究家（九州から参加）', '濃く、幸せな、<br>学びの3日間でした。<br>氣づきがたくさんありました。', pos='center 35%'); add('s16', 7)
voice('s17', DECK + 'image18.jpg', '40代・保育園経営（神奈川県）', 'いろんな醗酵が学べて、<br>楽しい充実した時間でした。', pos='center 25%'); add('s17', 7)
voice('s18', DECK + 'image19.jpg', '50代・機能性医学認定ヘルスコーチ<br>（ハワイから参加）', '醗酵食を、ハワイで<br>広げていきます。', pos='center 30%'); add('s18', 7)
bars = [('聞いただけ', 6), ('アウトプットして', 54), ('実践して', 75), ('人に教えて', 90)]
bh = ''.join(f'<div style="margin-top:44px"><div style="display:flex;justify-content:space-between;align-items:baseline"><p style="font-size:38px">{a}</p><p class="mark" style="font-size:64px">{v}%</p></div><div style="height:56px;background:#efe9df;border-radius:12px;overflow:hidden;margin-top:10px"><div style="width:{v}%;height:100%;background:{"#b9713a" if v == 90 else "#4c6b57"}"></div></div></div>' for a, v in bars)
page('s19', f'''<div class="page" style="padding-top:220px"><div class="eyebrow">PASS IT ON</div><h2>学びは、<br>人に伝えてこそ身につく</h2>
<p style="font-size:34px;margin-top:30px;color:#5a5348">学びの浸透率</p><div>{bh}</div>
<p class="serif" style="font-size:52px;line-height:1.6;margin-top:80px;color:#1f3227;font-weight:700">だから天給自足実践塾は、<br>伝承者・講師を育てます。</p></div>'''); add('s19', 11)
full('s20', IMG + 'venue-full-view-summer.jpg', 'VISION', '天給自足と醗酵で、<br>家族が最後まで<br>健康で楽しい毎日を。', '自分らしく、自然を楽しみ、<br>輝く人生へ。'); add('s20', 9)
page('gift', f'''<div class="page" style="justify-content:center;align-items:center;text-align:center;padding:120px 80px">
<div class="eyebrow">GIFT　お申し込み特典</div>
<h2 style="font-size:64px;line-height:1.45;margin:22px 0 60px">30分セッションに<br>お申し込みの方に、<br>小冊子をプレゼント</h2>
<div style="width:500px;aspect-ratio:1/1.414;border-radius:4px 12px 12px 4px;overflow:hidden;box-shadow:18px 22px 40px rgba(0,0,0,.35);transform:rotate(-3deg);position:relative"><img src="file:///tmp/claude-0/-home-user-kenkou/365c7380-fdc8-5909-a387-b0f263485918/scratchpad/video/booklet-cover.jpg" style="width:100%;height:100%;object-fit:cover;display:block"><div style="position:absolute;left:0;top:0;bottom:0;width:17px;background:rgba(0,0,0,.15)"></div></div>
<p class="serif" style="font-size:54px;color:#b9713a;font-weight:700;margin-top:80px;line-height:1.5">『食がもたらす健康<br>現在、過去、未来』</p>
<p style="font-size:34px;line-height:1.8;margin-top:26px">食から微生物へ。微生物から腸へ。<br>腸から心と免疫へ。そして、生き方へ。</p></div>'''); add('gift', 10)
page('s21', f'''<div class="page dark" style="justify-content:center;padding-top:70px"><div class="eyebrow">NEXT STEP</div>
<h2 style="font-size:66px;line-height:1.45;margin:20px 0 26px">まずは<span class="mark" style="font-size:76px;color:#e0a36d">無料</span>の<br>30分個別セッションで、<br>あなたの未来を<br>一緒に描きましょう。</h2>
<p><span style="display:inline-block;background:#d99a5b;color:#1f3227;border-radius:999px;padding:6px 26px;font-family:Noto Sans JP,sans-serif;font-size:34px;font-weight:700;letter-spacing:.08em;vertical-align:middle">参加無料</span><span style="display:inline-block;background:#faf6ee;color:#1f3227;border-radius:999px;padding:6px 26px;margin-left:12px;font-size:34px;font-weight:700;vertical-align:middle">小冊子プレゼント付き</span></p>
<p style="font-size:36px;line-height:1.7;margin-top:30px">お申し込みは、公式LINEに<br>次のひとことを送るだけ。</p>
<div style="background:#faf6ee;color:#1f3227;border-radius:22px;padding:24px 0;margin-top:24px;font-size:52px;font-weight:700;text-align:center;line-height:1.4;box-shadow:0 0 0 6px rgba(217,154,91,.55)">「天給自足<br>30分セッション希望」</div>
<p style="font-size:36px;line-height:1.7;margin-top:24px">日程は、こちらからご連絡します。</p>
<div style="margin-top:40px"><div style="display:flex;gap:50px;align-items:flex-start;justify-content:center"><div style="text-align:center;width:380px"><p style="font-size:30px;line-height:1.45;font-weight:700;margin-bottom:14px;min-height:132px;display:flex;align-items:flex-end;justify-content:center">天給自足実践塾<br>30分セッションの<br>お申し込み</p><div style="background:#fff;border-radius:22px;padding:27px"><img src="{IMG}line-qr-code.png" style="width:100%;display:block"></div><p style="font-size:30px;line-height:1.45;margin-top:14px">公式LINE<br>レジオン八ヶ岳</p></div><div style="text-align:center;width:380px"><p style="font-size:30px;line-height:1.45;font-weight:700;margin-bottom:14px;min-height:132px;display:flex;align-items:flex-end;justify-content:center">食と香りの実践リトリート<br>お問い合わせ・<br>ご相談はこちら</p><div style="background:#fff;border-radius:22px;padding:27px"><img src="file:///home/user/kenkou/video-project/tenkyu-intro/line-qr-hakko-lab.png" style="width:100%;display:block"></div><p style="font-size:30px;line-height:1.45;margin-top:14px">公式LINE<br>八ヶ岳醗酵する暮らしラボ</p></div></div></div>
<p class="serif" style="font-size:38px;margin-top:40px">レジオン八ヶ岳　天給自足実践塾</p></div>'''); add('s21', 14)

# ナレーションに合わせた秒数があれば、それを優先する
_dp = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voice', 'durations.json')
if os.path.exists(_dp):
    _d = json.load(open(_dp))
    for _s in scenes: _s['dur'] = _d.get(_s['name'], _s['dur'])
json.dump(scenes, open(os.path.join(OUT, 'scenes.json'), 'w'), ensure_ascii=False, indent=1)
print(len(scenes), 'scenes,', sum(s['dur'] for s in scenes), 'sec')
