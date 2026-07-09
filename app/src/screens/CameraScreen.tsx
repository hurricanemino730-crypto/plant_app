import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { diagnosePlant, DiagnoseApiError } from "../api/plantApi";
import { DiagnosisResult } from "../types/plant";

interface Props {
  /** 診断完了時に結果画面へ遷移するためのコールバック */
  onDiagnosed: (result: DiagnosisResult, imageUri: string) => void;
}

/** 撮影・画像選択と診断リクエストを行う画面 */
export default function CameraScreen({ onDiagnosed }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.7,
    base64: true, // サーバー送信用にbase64も取得する
  };

  /** カメラで撮影 */
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("カメラの使用が許可されていません", "設定アプリから許可してください。");
      return;
    }
    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    handlePickerResult(result);
  };

  /** ギャラリーから選択 */
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("写真へのアクセスが許可されていません", "設定アプリから許可してください。");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    handlePickerResult(result);
  };

  const handlePickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
  };

  /** 「診断する」ボタン押下時の処理 */
  const diagnose = async () => {
    if (!imageBase64 || !imageUri) return;
    setLoading(true);
    try {
      const result = await diagnosePlant(imageBase64);
      onDiagnosed(result, imageUri);
    } catch (err) {
      const message =
        err instanceof DiagnoseApiError ? err.message : "予期しないエラーが発生しました。";
      Alert.alert("診断エラー", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>🌱 Plant Doctor</Text>
      <Text style={styles.subtitle}>植物の写真から健康状態を診断します</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <View style={[styles.preview, styles.placeholder]}>
          <Text style={styles.placeholderText}>写真を選択してください</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={loading}>
          <Text style={styles.buttonText}>📷 撮影する</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickFromGallery} disabled={loading}>
          <Text style={styles.buttonText}>🖼 写真を選ぶ</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.diagnoseButton, (!imageBase64 || loading) && styles.disabled]}
        onPress={diagnose}
        disabled={!imageBase64 || loading}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.diagnoseText}> 診断中...</Text>
          </View>
        ) : (
          <Text style={styles.diagnoseText}>🔍 診断する</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#2e7d32" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4, marginBottom: 20 },
  preview: { width: "100%", height: 320, borderRadius: 16, backgroundColor: "#eee" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#999" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  button: {
    flex: 1,
    backgroundColor: "#e8f5e9",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#2e7d32", fontWeight: "600" },
  diagnoseButton: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: { opacity: 0.4 },
  diagnoseText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loadingRow: { flexDirection: "row", alignItems: "center" },
});
