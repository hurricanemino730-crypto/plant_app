/** 健康状態のレベル */
export type HealthLevel = "良好" | "注意" | "危険";

/** サーバーから返ってくる診断結果 */
export interface DiagnosisResult {
  plantName: {
    /** 和名（一般名） */
    common: string;
    /** 学名 */
    scientific: string;
  };
  healthStatus: {
    level: HealthLevel;
    summary: string;
  };
  /** 改善方法の箇条書き */
  improvements: string[];
  /** 項目別の育て方ガイド */
  careGuide: {
    watering: string;
    light: string;
    temperature: string;
    soil: string;
    fertilizer: string;
  };
}

/** サーバーのエラーレスポンス */
export interface ApiError {
  error: string;
}
