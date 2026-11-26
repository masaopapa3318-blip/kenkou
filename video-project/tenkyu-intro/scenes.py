# 天給自足実践塾 紹介動画：各シーンを 1920x1080 の HTML として書き出す
import json, os, html

IMG = 'file:///home/user/kenkou/images/'
DECK = 'file:///tmp/claude-0/-home-user-kenkou/365c7380-fdc8-5909-a387-b0f263485918/scratchpad/deck6/media/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scenes')
os.makedirs(OUT, exist_ok=True)

CSS = '''
@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Noto+Sans+JP:wght@400;500;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1920px; height: 1080px; overflow: hidden; }
body { font-family: 'Noto Sans JP', sans-serif; color: #2b2620; background: #faf6ee; }
.serif { font-family: 'Shippori Mincho', serif; }
.eyebrow { font-size: 30px; letter-spacing: .3em; color: #d99a5b; font-weight: 500; }
.full { position: relative; width: 1920px; height: 1080px; }
.full > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.full .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,32,25,.25) 0%, rgba(20,32,25,.65) 100%); }
.full .text { position: absolute; left: 140px; right: 140px; bottom: 150px; color: #fff; }
.full.center .text { top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
.full h1 { font-family: 'Shippori Mincho', serif; font-size: 92px; line-height: 1.35; font-weight: 700; text-shadow: 0 4px 24px rgba(0,0,0,.35); }
.full p { margin-top: 34px; font-size: 40px; line-height: 1.7; text-shadow: 0 2px 12px rgba(0,0,0,.4); }
.split { display: grid; grid-template-columns: 900px 1fr; width: 1920px; height: 1080px; }
.split.right { grid-template-columns: 1fr 900px; }
.split .ph { position: relative; overflow: hidden; }
.split .ph img { width: 100%; height: 100%; object-fit: cover; }
.split .tx { padding: 0 130px; display: flex; flex-direction: column; justify-content: center; }
.split h2 { font-family: 'Shippori Mincho', serif; font-size: 72px; line-height: 1.35; color: #1f3227; margin: 22px 0 36px; }
.split p { font-size: 36px; line-height: 1.85; }
.split .em { color: #b9713a; font-weight: 700; }
.page { width: 1920px; height: 1080px; padding: 90px 130px; display: flex; flex-direction: column; }
.page h2 { font-family: 'Shippori Mincho', serif; font-size: 68px; color: #1f3227; margin-top: 14px; }
.dark { background: #1f3227; color: #faf6ee; }
.dark h2 { color: #faf6ee; }
.card img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mark { font-family: 'Shippori Mincho', serif; color: #b9713a; font-weight: 800; }
'''

def page(name, body):
    with open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8') as f:
        f.write('<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + body + '</body></html>')

def full(name, img, eyebrow, title, sub='', center=False, pos='center'):
    page(name, f'''<div class="full{' center' if center else ''}"><img src="{img}" style="object-position:{pos}"><div class="shade"></div>
<div class="text">{f'<div class="eyebrow">{eyebrow}</div>' if eyebrow else ''}<h1>{title}</h1>{f'<p>{sub}</p>' if sub else ''}</div></div>''')

def split(name, img, eyebrow, title, body, right=False, pos='center'):
    ph = f'<div class="ph"><img src="{img}" style="object-position:{pos}"></div>'
    tx = f'<div class="tx"><div class="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{body}</p></div>'
    page(name, f'<div class="split{" right" if right else ""}">' + (tx + ph if right else ph + tx) + '</div>')

def course(name, eyebrow, title, lead, words, imgs, dark=False):
    cards = ''.join(f'<div class="card" style="position:relative;border-radius:18px;overflow:hidden"><img src="{src}"><span style="position:absolute;left:16px;bottom:14px;padding:6px 18px;border-radius:99px;background:rgba(31,50,39,.82);color:#fff;font-size:26px">{cap}</span></div>' for src, cap in imgs)
    page(name, f'''<div class="page{' dark' if dark else ''}" style="display:grid;grid-template-columns:760px 1fr;gap:70px;padding:90px 110px;align-items:center">
<div style="display:flex;flex-direction:column;justify-content:center">
<div class="eyebrow">{eyebrow}</div>
<h2 style="font-size:76px;line-height:1.3;margin:18px 0 34px">{title}</h2>
<p style="font-size:34px;line-height:1.85">{lead}</p>
<p class="mark" style="font-size:44px;margin-top:40px;letter-spacing:.15em">{words}</p></div>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:22px;height:880px">{cards}</div></div>''')

def voice(name, img, who, quote, pos='center'):
    page(name, f'''<div class="page" style="display:grid;grid-template-columns:720px 1fr;gap:90px;align-items:center;padding:90px 140px">
<div style="height:860px;border-radius:24px;overflow:hidden"><img src="{img}" style="width:100%;height:100%;object-fit:cover;object-position:{pos}"></div>
<div><div class="eyebrow">VOICE　受講生の声</div>
<p class="serif" style="font-size:150px;line-height:.6;color:#d99a5b;margin-top:40px">“</p>
<p class="serif" style="font-size:52px;line-height:1.7;color:#1f3227;font-weight:700">{quote}</p>
<p style="font-size:32px;margin-top:44px;color:#5a5348">{who}</p></div></div>''')

scenes = []
def add(name, dur): scenes.append({'name': name, 'dur': dur})

# 1 オープニング
full('s01', DECK + 'image1.jpg', '<span style="display:inline-block;padding:12px 40px;border-radius:999px;background:rgba(31,50,39,.78);color:#fff;font-family:Shippori Mincho,serif;font-size:46px;font-weight:700;letter-spacing:.18em;margin-bottom:30px">天給自足実践塾</span>', '一生モノの食のスキルを、<br>これからの人生に。', '天給自足・醗酵食・自然農・野草・きのこ<br>そして、それを楽しむあらゆる加工法', center=True); add('s01', 7)
# 2 問いかけ
full('s02', IMG + 'yatsugatake-blue-sky.jpg', '', '残りの人生の時間を、<br>どう創りますか？', '今日という日は、残りの人生の最初の日です。', center=True); add('s02', 7)
# 3 天給自足とは
split('s03', IMG + 'rice-field-autumn.jpg', 'ABOUT', '「天給自足」とは',
      '大地、空氣、水、太陽の光、種──<br>どれひとつ、自分で供給などしていない。<br>すべて天が与えてくれている。<br><br><span class="em">だから「自給自足」ではなく「天給自足」。</span><br>農の経験がなくても、誰でもできるようになるための塾です。'); add('s03', 12)
# 4 主宰者
split('s04', DECK + 'image2.jpg', 'PROFILE', '主宰　藤巻正夫',
      '新潟県柏崎市生まれ。<br>八ヶ岳・原村「レジオン八ヶ岳」主宰。<br><br>洋菓子職人として50年。<br>天給自足と醗酵で、食を楽しみ健康に。<br><span class="em">天給自足の伝承者・講師を養成しています。</span>', pos='center 20%'); add('s04', 9)
# 5 歩み
steps = [('18歳', '上京し、洋菓子の道へ'), ('24歳', 'オーボンヴュータンで<br>スーシェフに'), ('27〜31歳', 'スイス・フランスで修業<br>ミシュラン三ツ星・二ツ星'), ('横浜', '「レジオン」を21年営業<br>菓子・パン教室を15年'), ('八ヶ岳', '自然農と醗酵を実践し<br>天給自足を伝える')]
tl = ''.join(f'<div style="flex:1;text-align:center"><div style="width:30px;height:30px;border-radius:50%;background:#b9713a;margin:0 auto 34px;box-shadow:0 0 0 10px #f2ead9"></div><p class="serif" style="font-size:46px;color:#1f3227;font-weight:700">{a}</p><p style="font-size:29px;line-height:1.6;margin-top:16px">{b}</p></div>' for a, b in steps)
page('s05', f'''<div class="page"><div class="eyebrow">STORY</div><h2>食の道、50年の歩み</h2>
<div style="display:flex;gap:26px;margin-top:70px;height:330px">
<div class="card" style="flex:1;border-radius:18px;overflow:hidden"><img src="{DECK}image8.jpg"></div>
<div class="card" style="flex:1.5;border-radius:18px;overflow:hidden"><img src="{DECK}image4.jpg"></div>
<div class="card" style="flex:1.5;border-radius:18px;overflow:hidden"><img src="{IMG}venue-exterior-1.jpg"></div>
<div class="card" style="flex:1.5;border-radius:18px;overflow:hidden"><img src="{DECK}image7.jpg"></div></div>
<div style="position:relative;display:flex;margin-top:66px"><div style="position:absolute;left:10%;right:10%;top:14px;height:2px;background:#d99a5b"></div>{tl}</div></div>'''); add('s05', 13)
# 6 氣づき
full('s06', IMG + 'august-fieldwork-end.jpg', '帰国後、田舎で氣づいたこと', '<span style="font-size:76px">「自然に根ざした食創り」の豊かさは、<br>三ツ星以上だった。</span>', ''); add('s06', 8)
# 7 うまくいかない2つの理由
circ = lambda t: f'<div style="width:520px;height:520px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffffff,#e8f0ea 70%);border:3px solid #4c6b57;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px"><p class="serif" style="font-size:46px;line-height:1.6;color:#1f3227;font-weight:700">{t}</p></div>'
page('s07', f'''<div class="page" style="align-items:center;text-align:center"><div class="eyebrow">WHY</div><h2>天給自足がうまくいかない、2つの理由</h2>
<div style="display:flex;align-items:center;gap:60px;margin-top:56px">{circ('経験が少ない<br>理論と実践の<br>学びが少ない')}<p class="mark" style="font-size:120px">×</p>{circ('楽しんでできる<br>仲間がいない<br>いつでも聞ける<br>環境がない')}</div>
<p style="font-size:38px;margin-top:50px">人は学んだ次の日、<span class="mark" style="font-size:56px">74%</span>を忘れてしまう。<b>だから、この2つを年6回の合宿で同時に解決します。</b></p></div>'''); add('s07', 12)
# 8 7つのメリット
merits = [(IMG + 'april-field-work.jpg', '自然農と自然の恵みを<br>四季を通して学ぶ'), (IMG + 'koji-making.jpg', '一生モノの醗酵スキル<br>（実践と理論）'), (IMG + 'shop-komegyapan-set.jpg', 'グルテンフリーの<br>フランス菓子・米パン'),
          (IMG + 'pickled-vegetables-jars.jpg', '無添加の食づくりと<br>醗酵食の備蓄'), (IMG + 'tomato-seedlings-spring.jpg', 'ポタジェ（キッチンガーデン）<br>で四季を楽しむ'), (IMG + 'june-outdoor-meal.jpg', '家族の健康を見つめ直し<br>老けない・病まない生き方')]
mc = ''.join(f'<div style="display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 10px 30px rgba(43,38,32,.08)"><div class="card" style="height:250px"><img src="{s}"></div><p style="font-size:30px;line-height:1.5;padding:20px 24px;font-weight:500;color:#1f3227">{t}</p></div>' for s, t in merits)
page('s08', f'''<div class="page"><div class="eyebrow">MERITS</div><h2>天給自足実践塾で得られる、一生モノのスキル</h2>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:46px">{mc}</div>
<p style="font-size:30px;margin-top:30px;color:#5a5348">＋ 無期限のオンラインサポートで、いつでも聞ける安心</p></div>'''); add('s08', 14)
# 9 Before / After
col = lambda head, color, items: f'<div style="flex:1;border-radius:24px;padding:44px 54px;background:{color}"><p class="serif" style="font-size:54px;font-weight:700;margin-bottom:26px">{head}</p>' + ''.join(f'<p style="font-size:32px;line-height:1.6;margin-top:16px">・{i}</p>' for i in items) + '</div>'
page('s09', f'''<div class="page"><div class="eyebrow">CHANGE</div><h2>受講すると、どう変わる？</h2>
<div style="display:flex;gap:40px;margin-top:50px;align-items:stretch">
{col('Before', '#efe9df', ['自然農の一歩が踏み出せない', '野草の見極めに自信がない', '味噌や漬物を自分で作れない', '醗酵のすばらしさがわからない', 'きのこ・山菜を楽しめていない'])}
<p class="mark" style="font-size:90px;align-self:center">→</p>
{col('After', '#e3ede6', ['陸稲・野菜づくりをスタート', '季節の恵み（きのこ・山菜・野草）を活かせる', '醗酵食で腸から健康に', '食の保存・備蓄で安心を自給', '玄米パンや米のお菓子を楽しく作れる'])}</div></div>'''); add('s09', 12)
# 10 1年間の合宿
CAMPS = [('4', '菊芋・陸稲の<br>植え付け', 'april-planting-group.jpg'), ('6', '野草を<br>見極め楽しむ', 'june-sorting-herbs.jpg'),
         ('8', '夏の畑と<br>焚火を楽しむ', 'august-serving-food.jpg'), ('10', '醗酵と<br>きのこ', 'october-koji-making.jpg'),
         ('12', '菊芋掘りと<br>乾物料理', 'kikuimo-fresh.jpg'), ('2', '米粉のお菓子と<br>玄米パン', 'october-rice-bread.jpg')]
mont = ''.join(f'<div style="display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:#faf6ee"><div class="card" style="height:330px;border-radius:0"><img src="{IMG}{f}"></div><div style="padding:22px 22px 26px"><p class="serif" style="font-size:64px;line-height:1;color:#b9713a;font-weight:800">{m}<span style="font-size:32px">月</span></p><p style="font-size:28px;line-height:1.5;margin-top:14px;color:#1f3227;font-weight:500">{t}</p></div></div>' for m, t, f in CAMPS)
page('s10', f'''<div class="page dark" style="padding:80px 100px"><div class="eyebrow">6 CAMPS</div><h2>2か月に1度、年6回の合宿で<br>八ヶ岳の四季を巡る</h2>
<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:22px;margin-top:44px">{mont}</div>
<p style="font-size:32px;margin-top:36px">各回1泊2日〜3泊4日。仲間と一緒に、季節ごとの作業を体で覚えます。</p></div>'''); add('s10', 15)
# 11〜14 その他の塾
course('s11', 'FERMENTATION', '醗酵実践塾', '糀・味噌・縄文漬け・甘酒・シードルなど、<br>全11講座を2泊3日で集中して学ぶ<br>醗酵のリトリートです。', '委ねる。待つ。信じる。',
       [(IMG + 'koji-making.jpg', '糀'), (IMG + 'miso-paste.jpg', '味噌'), (IMG + 'amazake.jpg', '甘酒'), (IMG + 'october-jomon-zuke.jpg', '縄文漬け')]); add('s11', 11)
course('s12', 'KIKUIMO', '菊芋活用実践塾', '自然農で誰でも育てられる菊芋。<br>栽培から、あらゆる調理・保存法まで、<br>合宿で集中して究めます。', '究める。楽しむ。落とし込む。',
       [(IMG + 'kikuimo-fresh.jpg', '菊芋'), (IMG + 'kikuimo-chijimi.jpg', 'チヂミ'), (IMG + 'kikuimo-miso.png', '菊芋味噌'), (IMG + 'kikuimo-pound-cake.jpg', 'パウンドケーキ')]); add('s12', 11)
course('s13', 'WILD HERBS', '野草を生活に<br>落とし込み楽しむ会', '野草研究家・みこたまさんを講師に迎え、<br>野草を見極め、生活に落とし込む<br>2泊3日のリトリートです。', '見極める。身近にする。楽しむ。',
       [(IMG + 'june-sorting-herbs.jpg', '野草の見極め'), (IMG + 'wild-herb-salad.jpg', '野草のサラダ'), (IMG + 'yomogi-dango.jpg', 'よもぎ団子'), (IMG + 'wild-herb-takikomi-gohan.jpg', '炊き込みご飯')]); add('s13', 11)
course('s14', 'RETREAT', '四季を楽しむ<br>食と香りの<br>実践リトリート', '藤巻まり子が主宰。ミネラルと天然の香り、<br>醗酵食・グルテンフリー食で、<br>心と身体を内と外から整えます。', '氣づく。癒やす。見つめ直す。',
       [(IMG + 'retreat-gallery-lavender.jpg', '天然の香り'), (IMG + 'retreat-gallery-cafe-salad.jpg', '八ヶ岳の食'), (IMG + 'retreat-gallery-farm-sky.jpg', '森林浴'), (IMG + 'retreat-gallery-venue-daytime.jpg', 'レジオン八ヶ岳')]); add('s14', 11)
# 15〜18 受講生の声（お名前は出さず、属性のみ）
voice('s15', DECK + 'image10.jpg', '60代・医師ご夫妻（福井県）', '醗酵食が身体によいと考えて参加。<br>今ではいろいろな醗酵食を作り、<br>アレンジして楽しんでいます。'); add('s15', 7)
voice('s16', DECK + 'image11.jpg', '50代・料理研究家（九州から参加）', '濃く、幸せな、学びの3日間でした。<br>本を見て作るのとは全く違う。<br>氣づきがたくさんありました。', pos='center 30%'); add('s16', 7)
voice('s17', DECK + 'image18.jpg', '40代・保育園経営（神奈川県）', 'いろんな醗酵が学べて、<br>楽しい充実した時間でした。<br>生活にしっかり落とし込みたいと思います。', pos='center 20%'); add('s17', 7)
voice('s18', DECK + 'image19.jpg', '50代・機能性医学認定ヘルスコーチ（ハワイから参加）', '醗酵食を、ハワイで広げていきます。<br>『氣づきは、はじめの一歩！』'); add('s18', 7)
# 19 伝承
bars = [('聞いただけ', 6), ('アウトプットして', 54), ('実践して', 75), ('人に教えて', 90)]
bh = ''.join(f'<div style="display:flex;align-items:center;gap:30px;margin-top:30px"><p style="width:330px;font-size:36px;text-align:right">{a}</p><div style="flex:1;height:64px;background:#efe9df;border-radius:12px;overflow:hidden"><div style="width:{v}%;height:100%;background:{"#b9713a" if v == 90 else "#4c6b57"}"></div></div><p class="mark" style="width:150px;font-size:58px">{v}%</p></div>' for a, v in bars)
page('s19', f'''<div class="page"><div class="eyebrow">PASS IT ON</div><h2>学びは、人に伝えてこそ身につく</h2>
<p style="font-size:34px;margin-top:20px;color:#5a5348">学びの浸透率</p><div style="margin-top:20px">{bh}</div>
<p class="serif" style="font-size:46px;margin-top:60px;color:#1f3227;font-weight:700">だから天給自足実践塾は、伝承者・講師を育てます。</p></div>'''); add('s19', 11)
# 20 ビジョン
full('s20', IMG + 'venue-full-view-summer.jpg', 'VISION', '天給自足と醗酵で、<br>家族が最後まで健康で楽しい毎日を。', '自分らしく、自然を楽しみ、輝く人生へ。'); add('s20', 9)
# 21 クロージング（お申し込みの案内）
page('gift', f'''<div class="page" style="display:grid;grid-template-columns:1fr 460px;gap:100px;align-items:center;padding:90px 150px">
<div><div class="eyebrow">GIFT　お申し込み特典</div>
<h2 style="font-size:60px;line-height:1.5;margin:22px 0 36px">30分セッションにお申し込みの方に、<br>小冊子をプレゼントします。</h2>
<p class="serif" style="font-size:56px;color:#b9713a;font-weight:700;line-height:1.5">『食がもたらす健康<br>　現在、過去、未来』</p>
<p style="font-size:34px;line-height:1.8;margin-top:30px">食から微生物へ。微生物から腸へ。<br>腸から心と免疫へ。そして、生き方へ。</p></div>
<div style="display:flex;justify-content:center"><div style="width:430px;aspect-ratio:1/1.414;border-radius:4px 12px 12px 4px;overflow:hidden;box-shadow:18px 22px 40px rgba(0,0,0,.35);transform:rotate(-3deg);position:relative"><img src="file:///tmp/claude-0/-home-user-kenkou/365c7380-fdc8-5909-a387-b0f263485918/scratchpad/video/booklet-cover.jpg" style="width:100%;height:100%;object-fit:cover;display:block"><div style="position:absolute;left:0;top:0;bottom:0;width:15px;background:rgba(0,0,0,.15)"></div></div></div></div>'''); add('gift', 10)
page('s21', f'''<div class="page dark" style="display:grid;grid-template-columns:1fr 640px;gap:60px;align-items:center;padding:80px 100px">
<div><div class="eyebrow">NEXT STEP</div>
<h2 style="font-size:52px;line-height:1.5;margin:18px 0 30px">まずは<span class="mark" style="font-size:66px;color:#e0a36d">無料</span>の30分個別セッションで、<br>あなたの未来を一緒に描きましょう。</h2>
<p style="font-size:32px;line-height:1.7">お申し込みは、公式LINEに次のひとことを送るだけ。</p>
<div style="display:inline-block;background:#faf6ee;color:#1f3227;border-radius:20px;padding:18px 40px;margin-top:20px;font-size:44px;font-weight:700;letter-spacing:.03em;box-shadow:0 0 0 6px rgba(217,154,91,.55)">「天給自足 30分セッション希望」</div>
<p style="font-size:32px;line-height:1.7;margin-top:24px">日程は、こちらからご連絡します。</p><p style="margin-top:14px"><span style="display:inline-block;background:#d99a5b;color:#1f3227;border-radius:999px;padding:6px 26px;font-family:Noto Sans JP,sans-serif;font-size:30px;font-weight:700;letter-spacing:.08em;vertical-align:middle">参加無料</span><span style="display:inline-block;background:#faf6ee;color:#1f3227;border-radius:999px;padding:6px 26px;margin-left:12px;font-size:30px;font-weight:700;vertical-align:middle">小冊子プレゼント付き</span></p>
<p class="serif" style="font-size:38px;margin-top:40px">レジオン八ヶ岳　天給自足実践塾</p></div>
<div style="display:flex;gap:40px;align-items:flex-start;justify-content:center"><div style="text-align:center;width:300px"><p style="font-size:24px;line-height:1.45;font-weight:700;margin-bottom:14px;min-height:110px;display:flex;align-items:flex-end;justify-content:center">天給自足実践塾<br>30分セッションの<br>お申し込み</p><div style="background:#fff;border-radius:22px;padding:21px"><img src="{IMG}line-qr-code.png" style="width:100%;display:block"></div><p style="font-size:24px;line-height:1.45;margin-top:14px">公式LINE<br>レジオン八ヶ岳</p></div><div style="text-align:center;width:300px"><p style="font-size:24px;line-height:1.45;font-weight:700;margin-bottom:14px;min-height:110px;display:flex;align-items:flex-end;justify-content:center">食と香りの実践リトリート<br>お問い合わせ・<br>ご相談はこちら</p><div style="background:#fff;border-radius:22px;padding:21px"><img src="file:///home/user/kenkou/video-project/tenkyu-intro/line-qr-hakko-lab.png" style="width:100%;display:block"></div><p style="font-size:24px;line-height:1.45;margin-top:14px">公式LINE<br>八ヶ岳醗酵する暮らしラボ</p></div></div></div>'''); add('s21', 14)

# ナレーションに合わせた秒数があれば、それを優先する
_dp = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voice', 'durations.json')
if os.path.exists(_dp):
    _d = json.load(open(_dp))
    for _s in scenes: _s['dur'] = _d.get(_s['name'], _s['dur'])
json.dump(scenes, open(os.path.join(OUT, 'scenes.json'), 'w'), ensure_ascii=False, indent=1)
print(len(scenes), 'scenes,', sum(s['dur'] for s in scenes), 'sec')
