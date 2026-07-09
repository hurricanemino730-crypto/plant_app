import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DiagnosisResult, HealthLevel } from "../types/plant";

interface Props {
  result: DiagnosisResult;
  imageUri: string;
  /** 「もう一度診断する」で撮影画面に戻る */
  onBack: () => void;
}

/** 健康状態レベルごとの表示色 */
const LEVEL_COLORS: Record<HealthLevel, string> = {
  良好: "#2e7d32",
  注意: "#f9a825",
  危険: "#c62828",
};

/** 診断結果を表示する画面 */
export default function ResultScreen({ result, imageUri, onBack }: Props) {
  const levelColor = LEVEL_COLORS[result.healthStatus.level] ?? "#666";

  const careItems: { label: string; value: string }[] = [
    { label: "💧 水やり", value: result.careGuide.watering },
    { label: "☀️ 日照", value: result.careGuide.light },
    { label: "🌡 温度", value: result.careGuide.temperature },
    { label: "🪴 土", value: result.careGuide.soil },
    { label: "🌾 肥料", value: result.careGuide.fertilizer },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      {/* 植物名 */}
      <Text style={styles.plantName}>{result.plantName.common}</Text>
      <Text style={styles.scientific}>{result.plantName.scientific}</Text>

      {/* 健康状態 */}
      <View style={[styles.statusBadge, { backgroundColor: levelColor }]}>
        <Text style={styles.statusText}>{result.healthStatus.level}</Text>
      </View>
      <Text style={styles.summary}>{result.healthStatus.summary}</Text>

      {/* 改善方法 */}
      <Text style={styles.sectionTitle}>🩺 改善方法</Text>
      {result.improvements.map((item, index) => (
        <Text key={index} style={styles.listItem}>
          ・{item}
        </Text>
      ))}

      {/* 育て方ガイド */}
      <Text style={styles.sectionTitle}>📖 最適な育て方</Text>
      {careItems.map((item) => (
        <View key={item.label} style={styles.careRow}>
          <Text style={styles.careLabel}>{item.label}</Text>
          <Text style={styles.careValue}>{item.value}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>もう一度診断する</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  image: { width: "100%", height: 240, borderRadius: 16 },
  plantName: { fontSize: 26, fontWeight: "bold", marginTop: 16, color: "#333" },
  scientific: { fontSize: 14, fontStyle: "italic", color: "#888", marginBottom: 12 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontWeight: "bold" },
  summary: { marginTop: 10, fontSize: 15, lineHeight: 22, color: "#444" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 24, marginBottom: 8, color: "#2e7d32" },
  listItem: { fontSize: 15, lineHeight: 24, color: "#444" },
  careRow: { marginBottom: 12 },
  careLabel: { fontWeight: "600", fontSize: 15, color: "#333" },
  careValue: { fontSize: 14, lineHeight: 21, color: "#555", marginTop: 2 },
  backButton: {
    marginTop: 32,
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
