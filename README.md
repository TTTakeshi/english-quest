# Word Quest 3min

中学英語（英検5級〜3級相当）を3分間で楽しく学べる、スマホ向け単語バトルRPGです。

## 概要

- **ジャンル**: 単語バトルRPG
- **対象**: 中学英語レベル（英検5級〜3級手前）
- **対応**: スマホ向け（縦持ち）
- **1プレイ時間**: 3分固定

## ゲームの流れ

1. **ステージ選択** — カテゴリ（学校・食べ物・動詞など）を選ぶ
2. **バトル** — 英単語の四択問題に答えて敵を攻撃
   - 正解でダメージ、連続正解でコンボボーナス
   - 不正解で被ダメージ
3. **結果 & 復習** — 正答率・獲得EXP・間違えた単語を確認

## 主な機能

- 四択問題（日→英 / 英→日）、穴埋め問題
- HP・ダメージ・コンボシステム
- スキル（Fire Slash、Heal）
- 要復習リスト（間違えた単語を自動保存）
- 連続プレイ日数の記録

## 収録カテゴリ（中学1年中心 約80語）

| カテゴリ | 語数 |
|--------|-----|
| 学校生活 | 20語 |
| 日常動作（動詞） | 20語 |
| 時間・曜日・月 | 15語 |
| 家族 | 10語 |
| 食べ物 | 15語 |

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## ビルド

```bash
npm run build
npm run preview
```

## 技術スタック

- [React](https://react.dev/) 18
- [Vite](https://vitejs.dev/) 5

## アーキテクチャ

機能ごとに分割する **Feature-Sliced** 寄りの構成を採用しています。

- `app`: エントリポイントとアプリ全体の構成
- `features`: 画面/機能単位の UI とロジック
- `shared`: 複数機能で共有するデータ・ユーティリティ・永続化処理

## ディレクトリ構成

```text
src/
   app/
      App.jsx
      styles/
         global.css
   features/
      battle/components/
         BattleScreen.jsx
      results/components/
         ResultScreen.jsx
      review/components/
         ReviewList.jsx
      stage-select/components/
         StageSelect.jsx
      title/components/
         TitleScreen.jsx
   shared/
      data/
         word-data.json
         words.js
      lib/
         storage.js
      utils/
         questions.js
   main.jsx
```

## import ルール

- 共有モジュール参照は `@` エイリアス（`src`）を優先
- 例: `@/shared/lib/storage`, `@/features/battle/components/BattleScreen`

