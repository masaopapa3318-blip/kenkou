# 天給自足実践塾 紹介動画（第2.3版）

体験セッション資料（5月3日版・第6版）をもとにした紹介動画の作業ファイル。

- `scenes.py` / `scenes_v.py`：横長（1920×1080）／縦長（1080×1920）の各場面をHTMLで書き出す
- `shoot.js` / `shoot2.js`：場面HTMLをPNGにする（縦長は `SDIR=scenes_v`）
- `build.py`：PNGからゆっくりズーム＋クロスフェードの動画を作る（縦長は `SDIR=scenes_v`）
- `bgm.py`：オリジナルBGMを合成（引数：秒数 出力wav）
- `mux.sh`：映像にBGMを重ねる
- `narration.json`：ナレーション原稿、`narration-script.html`：原稿PDFの元
- `tenkyu-intro-video.html`：確認用ページ（https://claude.ai/artifact/YGnwZDsxgy7koTgYpb6MZA）
- `deck-media/`：資料から使った写真、`booklet/`：小冊子の表紙

作業時は scripts 内の DECK パス（scratchpad/deck6/media/）とブックレット表紙パスを、このフォルダの deck-media/・booklet/ に置き換えて使う。
次の作業：ご本人の録音（ボイスメモ）を受け取り、場面ごとの長さを合わせてナレーションを重ねる。
