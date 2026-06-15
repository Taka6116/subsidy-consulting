# HeyGen スライド動画 完全自動生成セットアップガイド

> `scripts/heygen/generate-heygen-agent.ts` を使った**完全自動化**フローの解説です。

---

## 処理フロー

```
DB（補助金データ）
  ↓
5枚スライドSVG を生成（sharp / Resvg）
  ↓
PNG を HeyGen Assets API にアップロード（asset_id 取得）
  ↓
Video Agent API にプロンプト + 5枚スライド(asset_id) + 桜庭さんの voice_id を送信
  ↓
セッション → video_id → 動画レンダリング完了待ち
  ↓
video_url をコンソールに表示
```

## 必要な環境変数

```env
# .env.local に追記
HEYGEN_API_KEY=your_heygen_api_key
```

桜庭さんの voice_id はスクリプト内にハードコード済みです:
```
625b342f002045da9f24df8f1b5cf3d3
```

## 実行方法

```bash
# 最新の公募中補助金で動画生成
npm run video:heygen

# 特定の補助金IDを指定
npm run video:heygen -- <subsidyId>
```

実行中のログ例:
```
🔍 補助金データを取得中...
✅ IT導入補助金2025 (id: xxxx)

━━━ Step 1: スライドPNG生成（5シーン） ━━━
  Slide 1: 142 KB → scripts/heygen/output/slide-1.png
  ...

━━━ Step 2: HeyGen Assets にスライドPNGをアップロード ━━━
  Slide 1: asset_id=ast_xxxx
  ...

━━━ Step 3: Video Agent API でセッション作成 ━━━
✅ session_id: ses_xxxx

━━━ Step 4: セッションから video_id を取得 ━━━
  [6s] session status: processing
✅ video_id: vid_xxxx

━━━ Step 5: 動画レンダリング完了待ち ━━━
  [10s] video status: processing
  ...
🎉 動画生成完了！
  video_url : https://files.heygen.com/...
```

## 生成されるスライド（5シーン）

| # | シーン | 内容 |
|---|--------|------|
| 1 | Hook | ダーク背景で「補助金で経営課題を解決する」訴求 |
| 2 | What | 補助金の制度説明・概要 |
| 3 | Numbers | 補助上限金額・申請期限・対象業種 |
| 4 | Use Case | 活用事例2件 |
| 5 | CTA | 無料診断への誘導 |

スライドPNGは `scripts/heygen/output/slide-X.png` に保存されます（確認用）。

## 注意事項

- 動画生成には HeyGen のクレジットを消費します（1動画あたり数クレジット）
- 生成時間の目安: セッション開始後 3〜10 分
- HeyGen の Video Agent は `voice_id` を受け付けますが、最終的に採用されるかは API の挙動によります。確認は HeyGen ダッシュボード（https://app.heygen.com）で行ってください
- フォントが見つからない場合は `public/fonts/NotoSansCJKjp-Regular.otf` を配置してください
