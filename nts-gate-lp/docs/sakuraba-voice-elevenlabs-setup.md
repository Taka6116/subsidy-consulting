# 桜庭さんの声でナレーション動画を作る手順書（ElevenLabs ボイスクローン）

## 目的

スライド解説動画（`runVideoJob` パイプライン）のナレーション音声を、桜庭さんの声にする。
現在 HeyGen 内にある桜庭さんのボイスクローンは外部に書き出せないため、ElevenLabs でクローンを作り直し、既存パイプラインに接続する。

## 全体像

```
桜庭さんの音源を用意
  → ElevenLabs でボイスクローン作成（voice_id 取得）
  → 環境変数に voice_id を設定
  → VIDEO_TTS_PROVIDER=elevenlabs に切替
  → runVideoJob でスライド＋桜庭さんの声の動画を生成
```

コード改修は不要。環境変数の設定のみで切り替わる。

## なぜ ElevenLabs か

| プロバイダ | 任意の人の声を再現 | 桜庭さんの声 | 備考 |
|-----------|------------------|-------------|------|
| ElevenLabs | 可能（ボイスクローン） | 可能 | 日本語ナレーション品質が高い。本手順の対象 |
| AWS Polly | 不可（プリセット音声のみ） | 不可 | Brand Voice は大企業向け・高額で非現実的 |
| HeyGen | 可能だがプラットフォーム外に持ち出せない | 既存クローンは流用不可 | アバター用途。今回は不要 |

---

## 手順

### Step 1. 桜庭さんの音源を用意する

ElevenLabs のクローンには 2 方式がある。品質要件が高いため **Professional Voice Clone（PVC）を推奨**。

| 方式 | 必要音源 | 学習時間 | 品質 | 用途 |
|------|---------|---------|------|------|
| Instant Voice Clone（IVC） | 1〜3 分 | 即時 | 中 | デモ・試作 |
| Professional Voice Clone（PVC） | 30 分〜数時間 | 数時間 | 高（推奨） | 本番・クライアント納品 |

音源の要件:

- **クリーンな録音**（BGM・環境ノイズ・エコーなし、単一話者のみ）
- サンプリングレート 44.1kHz 以上、WAV または高ビットレート MP3
- 自然な話速・抑揚で、ナレーション調の発話が望ましい
- PVC の場合は、内容にバリエーションがある音源（同じ文の繰り返しは避ける）が高品質につながる
- HeyGen クローン作成時に使った元音源があれば、それを流用してよい

### Step 2. 桜庭さんご本人の同意を取得する

- ElevenLabs の PVC は、作成時に **本人による音声同意（Voice Captcha / Verification）** を要求する。
- 桜庭さんご本人に、ElevenLabs が指定する同意文言を読み上げて録音してもらう必要がある。
- 商用利用・LP 掲載の許諾も併せて書面で確認しておくこと。

### Step 3. ElevenLabs でボイスクローンを作成する

1. ElevenLabs にログイン（チーム用アカウント推奨。請求・権限を一元管理）。
2. プランを確認する。PVC は有料プラン（Creator 以上）で利用可。利用量（文字数）に応じた課金。
3. `Voices` → `Add a new voice` → `Professional Voice Clone`（または Instant）を選択。
4. Step 1 の音源をアップロード。
5. PVC の場合は本人確認（Step 2 の同意録音）を実施。
6. 学習完了後、作成された **Voice ID** を控える（例: `abcd1234...`）。
   - Voice ID は `Voices` 一覧の各音声の詳細画面、または API `GET https://api.elevenlabs.io/v1/voices` で確認できる。

### Step 4. 環境変数を設定する

`.env`（ローカル）および本番（Vercel / 動画生成を実行する環境）に以下を設定する。

```bash
# プロバイダを ElevenLabs に切替
VIDEO_TTS_PROVIDER=elevenlabs

# ElevenLabs 認証とボイス
ELEVENLABS_API_KEY=<ElevenLabs の API キー>
ELEVENLABS_VOICE_ID=<Step 3 で取得した桜庭さんの Voice ID>

# 任意（既定値あり）
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

# 音声保存先（既存の動画パイプラインと共通）
VIDEO_S3_BUCKET=<保存先バケット>
# VIDEO_S3_REGION / VIDEO_S3_BASE_URL は既存設定を流用
```

設定箇所の対応コード:

- 参照: `src/lib/aws/elevenLabsTts.ts`（`ELEVENLABS_VOICE_ID` / `ELEVENLABS_API_KEY` / `ELEVENLABS_MODEL_ID` を読む）
- 切替: `src/lib/content/runVideoJob.ts` の `synthesizeNarration()` が `VIDEO_TTS_PROVIDER=elevenlabs` のとき ElevenLabs を使い、失敗時は Polly にフォールバックする
- テンプレート: `.env.example` の「解説動画のナレーション音声（TTS）」セクションにコメント付きで全変数を記載済み。コピーして値を埋める

> 現状（要設定）: `.env.local` には `VIDEO_S3_BUCKET` のみ設定済み。`VIDEO_TTS_PROVIDER` と `ELEVENLABS_*` は未設定のため、このままでは Polly（プリセット音声 Takumi）になる。桜庭さんの声にするには上記 3 変数（`VIDEO_TTS_PROVIDER` / `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`）の追加が必須。

### Step 5. 声質を調整する（任意）

`src/lib/aws/elevenLabsTts.ts` の `voice_settings` は環境変数でチューニングできる。クローン直後に試聴しながら調整する。

```bash
# 0〜1。高いほど安定（抑揚は減る）。低いほど表現豊か（ブレやすい）
ELEVENLABS_STABILITY=0.48

# 0〜1。高いほど元の声に忠実
ELEVENLABS_SIMILARITY_BOOST=0.8

# 0〜1。高いほど話し方の癖を強調
ELEVENLABS_STYLE=0.25

# 話者の明瞭さを補正（既定 true）
ELEVENLABS_SPEAKER_BOOST=true
```

調整の目安:

- 桜庭さんらしさが弱い → `SIMILARITY_BOOST` を上げる（0.85〜0.9）
- 棒読みに感じる → `STABILITY` を下げる（0.35〜0.45）、`STYLE` を少し上げる
- 不自然に揺れる・ノイズが乗る → `STABILITY` を上げる、`STYLE` を下げる

### Step 6. 動画を生成して確認する

既存の動画生成ジョブを実行する（補助金 1 件を対象）。

```bash
# 例: 既存のトリガー経由で実行（subsidyId を指定）
# runVideoJob({ subsidyId, force: true }) が呼ばれる経路を使用
```

確認ポイント:

- 生成された MP3 が桜庭さんの声になっているか（`audioPath`）
- スライドと音声のタイミングが合っているか
- ログに `TTS provider=elevenlabs` が出ているか（`[runVideoJob]` プレフィックス）
- `elevenlabs` が失敗して Polly にフォールバックしていないか（フォールバック時はログに警告が出る）

---

## 補足・注意点

- **HeyGen は解約検討可**: アバターを使わない方針のため、桜庭さんの声を ElevenLabs に移行できれば HeyGen は不要。解約前に、HeyGen 側に残したい資産（過去動画等）がないか確認する。
- **コスト**: ElevenLabs は文字数ベースの従量課金。月間のナレーション総文字数から必要プランを見積もる。
- **フォールバック挙動**: `ELEVENLABS_API_KEY` または `ELEVENLABS_VOICE_ID` が未設定・失敗の場合、自動的に Polly（プリセット音声）に切り替わる。桜庭さんの声で確実に出すには、両変数が正しく設定されていることを必ずログで確認する。
- **品質要件**: クライアント（日本提携支援）納品向けの「質が高いもの」が要件のため、IVC で試作 → 問題なければ PVC で本番、という二段構えが安全。

## 関連ファイル

- `src/lib/aws/elevenLabsTts.ts` — ElevenLabs TTS 実装
- `src/lib/aws/pollyTts.ts` — Polly TTS 実装（フォールバック先）
- `src/lib/content/runVideoJob.ts` — 動画生成ワーカー（台本→音声→スライド→MP4 合成）
- `src/lib/video/composeVideo.ts` — FFmpeg スライド＋音声合成
- `docs/hyperframes-video-generation-design.md` — スライド/モーション動画の設計
