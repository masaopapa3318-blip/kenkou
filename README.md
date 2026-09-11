# 天給自足実践塾 ホームページ

長野県・八ヶ岳原村「レジオン八ヶ岳」が主催する天給自足実践塾の公式サイトです。

## 構成

- `index.html` — ホーム
- `philosophy.html` — 理念（天給自足とは／志／7つのメリット／祈り）
- `curriculum.html` — 年間カリキュラム
- `courses.html` — コース・料金
- `about.html` — 主宰者・レジオン八ヶ岳について
- `contact.html` — お問い合わせ
- `style.css` — 全ページ共通スタイルシート
- `script.js` — モバイルメニューの開閉
- `images/` — サイトで使用する写真（下記参照）

## 写真について

`images/` 内の写真は、既存サイト [regioncafelabo.wixsite.com/mysite](https://regioncafelabo.wixsite.com/mysite)
（レジオン八ヶ岳 公式サイト）に藤巻さんご自身がアップロードされていた実写真から転用しています
（建物外観・客室・庭の花）。アーティスト鳥海勝稚氏の作品・プロフィールカードは、第三者の著作物・個人情報を
含むため転用していません。

今後さらに写真を追加する場合は `images/` に配置し、各HTMLファイルの `<img>` タグから参照してください。

## 技術構成

ビルド不要の静的サイト（HTML / CSS / JavaScript のみ）です。Node.js 等のインストールは不要で、
[Vercel](https://vercel.com) にそのままデプロイできます。

## 開発・更新のしかた

ファイルを編集して GitHub に push すると、Vercel が自動的に本番サイトへ反映します。
