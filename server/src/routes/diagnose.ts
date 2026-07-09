import { Router, Request, Response } from "express";
import { diagnosePlant, NotAPlantError } from "../services/claudeService";

export const diagnoseRouter = Router();

// base64画像のサイズ上限（約10MB相当）
const MAX_BASE64_LENGTH = 14 * 1024 * 1024;

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type MediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

/**
 * POST /api/diagnose
 * リクエストボディ: { image: string (base64), mediaType?: string }
 */
diagnoseRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { image, mediaType } = req.body as { image?: string; mediaType?: string };

    // --- バリデーション ---
    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "画像データ（base64）が必要です。" });
      return;
    }
    if (image.length > MAX_BASE64_LENGTH) {
      res.status(413).json({ error: "画像サイズが大きすぎます。10MB以下にしてください。" });
      return;
    }
    const resolvedMediaType: MediaType = ALLOWED_MEDIA_TYPES.includes(mediaType as MediaType)
      ? (mediaType as MediaType)
      : "image/jpeg";

    // data URLプレフィックスが付いていたら除去
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const result = await diagnosePlant(base64Data, resolvedMediaType);
    res.json(result);
  } catch (err) {
    if (err instanceof NotAPlantError) {
      res.status(422).json({ error: "植物が写っていないか、認識できませんでした。植物全体がはっきり写る写真をお試しください。" });
      return;
    }
    console.error("診断エラー:", err);
    res.status(500).json({ error: "診断中にエラーが発生しました。時間をおいて再試行してください。" });
  }
});
