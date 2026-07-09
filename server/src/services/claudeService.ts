import Anthropic from "@anthropic-ai/sdk";

/** 画像が植物と認識できなかった場合に投げるエラー */
export class NotAPlantError extends Error {}

/** 診断結果の型（アプリ側の types/plant.ts と対応） */
export interface DiagnosisResult {
  plantName: { common: string; scientific: string };
  healthStatus: { level: "良好" | "注意" | "危険"; summary: string };
  improvements: string[];
  careGuide: {
    watering: string;
    light: string;
    temperature: string;
    soil: string;
    fertilizer: string;
  };
}

const SYSTEM_PROMPT = `あなたは植物の専門家（園芸士・植物病理学者）です。
送られてきた植物の写真を分析し、以下のJSON構造のみで回答してください。
前置き・後書き・Markdown記法（\`\`\`など）は一切含めず、JSONオブジェクトだけを出力すること。

{
  "plantName": { "common": "和名（一般名）", "scientific": "学名" },
  "healthStatus": { "level": "良好 | 注意 | 危険 のいずれか", "summary": "健康状態の詳細説明（葉の色・形、虫食い、徒長などの観察結果を含める）" },
  "improvements": ["改善方法1", "改善方法2", ...],
  "careGuide": {
    "watering": "水やりの頻度と方法",
    "light": "日照条件",
    "temperature": "適温と冬越し・夏越しの注意",
    "soil": "適した土",
    "fertilizer": "肥料の与え方"
  }
}

写真に植物が写っていない、または植物と判断できない場合は、代わりに次のJSONだけを返すこと:
{ "error": "NOT_A_PLANT" }`;

/**
 * Claude APIに画像を送信して植物診断を行う
 * @param base64Image base64エンコードされた画像データ（data URLプレフィックスなし）
 * @param mediaType 画像のMIMEタイプ
 */
export async function diagnosePlant(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<DiagnosisResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          {
            type: "text",
            text: "この植物を診断してください。JSONのみで回答してください。",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude APIからテキスト応答が得られませんでした。");
  }

  // 万一コードフェンスが付いてきた場合に備えて除去してからパース
  const cleaned = textBlock.text.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude APIの応答をJSONとして解析できませんでした: ${cleaned.slice(0, 200)}`);
  }

  if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
    throw new NotAPlantError();
  }

  return parsed as DiagnosisResult;
}
