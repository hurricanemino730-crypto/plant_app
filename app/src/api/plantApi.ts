import { DiagnosisResult, ApiError } from "../types/plant";

/**
 * プロキシサーバーのURL。
 * 実機（Expo Go）で確認する場合は、PCのローカルIPに書き換えてください。
 * 例: "http://192.168.1.10:3000"
 */
const API_BASE_URL = "http://localhost:3000";

/** 診断APIの呼び出しに失敗したときのエラー */
export class DiagnoseApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

/**
 * base64画像をサーバーに送信して診断結果を取得する
 * @param base64Image base64エンコード済みの画像データ
 * @param mediaType 画像のMIMEタイプ（省略時は image/jpeg）
 */
export async function diagnosePlant(
  base64Image: string,
  mediaType: string = "image/jpeg"
): Promise<DiagnosisResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image, mediaType }),
    });
  } catch {
    throw new DiagnoseApiError(
      "サーバーに接続できませんでした。サーバーが起動しているか、API_BASE_URLの設定を確認してください。"
    );
  }

  const json = (await response.json().catch(() => null)) as DiagnosisResult | ApiError | null;

  if (!response.ok) {
    const message =
      json && "error" in json ? json.error : "診断に失敗しました。時間をおいて再試行してください。";
    throw new DiagnoseApiError(message, response.status);
  }

  if (!json || "error" in json) {
    throw new DiagnoseApiError("サーバーから不正な応答が返されました。");
  }

  return json;
}
