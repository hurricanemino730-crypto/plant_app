import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { diagnoseRouter } from "./routes/diagnose";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

// CORS設定: Expo開発サーバー（実機・シミュレーター）からのアクセスを許可
app.use(cors({ origin: "*" }));

// base64画像を受け取るため上限を大きめに設定（約10MBの画像まで）
app.use(express.json({ limit: "15mb" }));

// レート制限: 1IPあたり1分間に10リクエストまで
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
  })
);

// ヘルスチェック
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/diagnose", diagnoseRouter);

app.listen(port, () => {
  console.log(`🌱 Plant Doctor server listening on http://localhost:${port}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY が設定されていません。.env を確認してください。");
  }
});
