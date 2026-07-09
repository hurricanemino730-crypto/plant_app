# 🌱 Plant Doctor — 植物健康診断アプリ

スマホで植物の写真を撮る・選ぶだけで、AI（Claude API）が以下を診断するオープンソースアプリです。

1. **植物の名前**（和名・学名）
2. **健康状態の診断**（葉の色・形、虫食い、徒長などから判断。良好 / 注意 / 危険）
3. **改善方法**（箇条書きの具体的アドバイス）
4. **最適な育て方**（水やり・日照・温度・土・肥料）

## 構成

```
plant_app/
├── app/      # React Native + Expo（TypeScript）モバイルアプリ
└── server/   # Node.js + Express プロキシサーバー（Claude APIキーはここだけで保持）
```

診断結果は保存されません（サーバーはステートレス）。APIキーはサーバー側の `.env` のみに置き、クライアントには埋め込みません。

## セットアップ

### 前提

- Node.js 20以上
- Anthropic APIキー（https://console.anthropic.com/ で取得）
- スマホに [Expo Go](https://expo.dev/go) アプリ（実機確認用）

### 1. サーバー側（/server）

```bash
cd server
npm install
cp .env.example .env
# .env を編集して ANTHROPIC_API_KEY に自分のAPIキーを設定
npm run dev
```

`http://localhost:3000/health` にアクセスして `{"status":"ok"}` が返れば起動成功です。

#### 環境変数

| 変数名 | 説明 |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic APIキー（必須） |
| `PORT` | サーバーのポート番号（省略時 3000） |

### 2. アプリ側（/app）

```bash
cd app
npm install
```

実機（Expo Go）から接続する場合は、`src/api/plantApi.ts` の `API_BASE_URL` をPCのローカルIPに書き換えてください。

```ts
const API_BASE_URL = "http://192.168.x.x:3000"; // PCのIPアドレス
```

その後、開発サーバーを起動します。

```bash
npx expo start
```

## Expo Goでの動作確認方法

1. PCとスマホを**同じWi-Fi**に接続する
2. `server` で `npm run dev`、`app` で `npx expo start` をそれぞれ起動
3. スマホのExpo Goアプリでターミナルに表示されるQRコードを読み取る
4. アプリが起動したら植物の写真を撮影 or 選択して「診断する」をタップ

## API仕様

### POST /api/diagnose

リクエスト:

```json
{ "image": "<base64画像データ>", "mediaType": "image/jpeg" }
```

レスポンス（成功時）:

```json
{
  "plantName": { "common": "モンステラ", "scientific": "Monstera deliciosa" },
  "healthStatus": { "level": "注意", "summary": "葉先が茶色くなっています" },
  "improvements": ["水やり頻度を減らす", "直射日光を避ける"],
  "careGuide": {
    "watering": "...", "light": "...", "temperature": "...", "soil": "...", "fertilizer": "..."
  }
}
```

エラー時は `{ "error": "メッセージ" }` を返します（植物と認識できない場合は 422）。

## 注意事項

- `.env`（APIキー）は絶対にコミットしないでください（`.gitignore` 済み）
- レート制限: 1IPあたり1分間に10リクエスト
- 画像サイズ上限: 約10MB

## ライセンス

MIT License — 詳細は [LICENSE](LICENSE) を参照
